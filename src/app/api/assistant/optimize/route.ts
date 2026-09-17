import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const PROVIDERS = ["anthropic", "openai", "gemini", "groq"] as const;
type Provider = (typeof PROVIDERS)[number];

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: "Claude",
  openai: "OpenAI",
  gemini: "Gemini",
  groq: "Groq",
};

const schema = z.object({
  draft: z.string().min(1).max(8000),
  apiKey: z.string().min(1).max(300),
  provider: z.enum(PROVIDERS),
});

const SYSTEM_PROMPT = `You are an expert prompt engineer. Rewrite the user's draft into a clearer, more effective prompt for an AI assistant.
Preserve the user's intent, but improve structure, specificity, and desired-output framing.
Use {{snake_case}} placeholders for any values the user should fill in before use.
Return ONLY the improved prompt text — no preamble, no explanation, no markdown code fences.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Per-user limit — this proxies to paid third-party APIs using the caller's
  // own key, so it mainly guards against runaway client bugs/loops rather
  // than abuse of our own resources.
  const { ok, retryAfterMs } = rateLimit(clientKey(req, `optimize:${session.user.id}`), 10, 60 * 1000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many optimize requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { draft, apiKey, provider } = parsed.data;

  try {
    // The key is used for this single request only — never logged, stored, or
    // persisted server-side. It lives entirely in the caller's browser storage.
    const optimized = await callProvider(provider, apiKey, draft);

    if (!optimized) {
      return NextResponse.json({ error: "The model returned an empty response." }, { status: 502 });
    }

    return NextResponse.json({ optimized });
  } catch (err) {
    // Log only a sanitized subset — provider SDK error objects can carry
    // request details, and this request body includes the caller's API key.
    logger.error(
      {
        provider,
        userId: session.user.id,
        status: err instanceof Error && "status" in err ? (err as { status?: unknown }).status : undefined,
        message: err instanceof Error ? err.message : "unknown error",
      },
      "assistant/optimize: provider call failed"
    );
    return NextResponse.json({ error: friendlyErrorMessage(provider, err) }, { status: 502 });
  }
}

async function callProvider(provider: Provider, apiKey: string, draft: string): Promise<string> {
  switch (provider) {
    case "anthropic":
      return callAnthropic(apiKey, draft);
    case "openai":
      return callOpenAI(apiKey, draft);
    case "gemini":
      return callGemini(apiKey, draft);
    case "groq":
      return callGroq(apiKey, draft);
  }
}

// Anthropic — Claude Sonnet: solid general-purpose quality without reaching for Opus.
async function callAnthropic(apiKey: string, draft: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: draft }],
  });
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

// OpenAI — GPT-4o mini: cheap and fast, plenty for rewriting a prompt.
async function callOpenAI(apiKey: string, draft: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1024,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: draft },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// Gemini — 2.0 Flash: Google's efficient, low-cost tier.
async function callGemini(apiKey: string, draft: string): Promise<string> {
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent(draft);
  return result.response.text().trim();
}

// Groq — Llama 3.3 70B: their strongest model with a free tier, via the
// OpenAI-compatible endpoint (no separate SDK needed).
async function callGroq(apiKey: string, draft: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: draft },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message ?? `Groq API error (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status });
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

function friendlyErrorMessage(provider: Provider, err: unknown): string {
  const status = extractStatus(provider, err);
  if (status === 401 || status === 403) {
    return "That API key was rejected. Double-check it and try again.";
  }
  if (status === 429) {
    return "Rate limit or usage cap reached on that API key. Try again shortly.";
  }
  return `Couldn't reach ${PROVIDER_LABELS[provider]}. Please check your API key and try again.`;
}

function extractStatus(provider: Provider, err: unknown): number | undefined {
  if (provider === "anthropic" && err instanceof Anthropic.APIError) return err.status;
  if (provider === "openai" && err instanceof OpenAI.APIError) return err.status ?? undefined;
  if (provider === "groq" && err instanceof Error && "status" in err) {
    return (err as Error & { status?: number }).status;
  }
  if (provider === "gemini" && err instanceof Error) {
    const match = err.message.match(/\b(\d{3})\b/);
    return match ? Number(match[1]) : undefined;
  }
  return undefined;
}
