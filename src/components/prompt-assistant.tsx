"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { HighlightedBody } from "@/components/highlighted-body";
import { CopyTextButton } from "@/components/copy-text-button";
import { PromptCardGrid, type PromptCard } from "@/components/prompt-card-grid";

type ProviderId = "anthropic" | "openai" | "gemini" | "groq";

const PROVIDERS: {
  id: ProviderId;
  label: string;
  model: string;
  placeholder: string;
  note?: string;
}[] = [
  { id: "anthropic", label: "Claude", model: "Sonnet", placeholder: "sk-ant-..." },
  { id: "openai", label: "ChatGPT", model: "GPT-4o mini", placeholder: "sk-..." },
  { id: "gemini", label: "Gemini", model: "2.0 Flash", placeholder: "AIza..." },
  {
    id: "groq",
    label: "Groq",
    model: "Llama 3.3 70B",
    placeholder: "gsk_...",
    note: "free tier",
  },
];

const PROVIDER_STORAGE_KEY = "promptlib:optimizeProvider";
const apiKeyStorageKey = (provider: ProviderId) => `promptlib:apiKey:${provider}`;

export function PromptAssistant() {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<PromptCard[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [apiKeys, setApiKeys] = useState<Partial<Record<ProviderId, string>>>({});
  const [showKey, setShowKey] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState<string | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

  const activeProvider = PROVIDERS.find((p) => p.id === provider)!;
  const apiKey = apiKeys[provider] ?? "";

  useEffect(() => {
    try {
      // The provider choice is just a UI preference, fine to persist across
      // tabs/sessions. The API keys themselves use sessionStorage instead
      // (cleared when the tab closes) to shrink the window a leaked/shared
      // machine could expose them.
      const savedProvider = localStorage.getItem(PROVIDER_STORAGE_KEY) as ProviderId | null;
      const loadedKeys: Partial<Record<ProviderId, string>> = {};
      for (const p of PROVIDERS) {
        const saved = sessionStorage.getItem(apiKeyStorageKey(p.id));
        if (saved) loadedKeys[p.id] = saved;
      }
      // One-time hydration from a browser-only store on mount, not a derived-state
      // loop — these stores don't exist during SSR, so this can't run there.
      if (savedProvider && PROVIDERS.some((p) => p.id === savedProvider)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProvider(savedProvider);
      }
      setApiKeys(loadedKeys);
    } catch {
      // storage can be unavailable (private browsing); fields just stay empty
    }
  }, []);

  function selectProvider(next: ProviderId) {
    setProvider(next);
    setOptimized(null);
    setOptimizeError(null);
    try {
      localStorage.setItem(PROVIDER_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
  }

  function updateApiKey(value: string) {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
    try {
      if (value) sessionStorage.setItem(apiKeyStorageKey(provider), value);
      else sessionStorage.removeItem(apiKeyStorageKey(provider));
    } catch {
      // ignore storage failures
    }
  }

  async function findSimilar() {
    if (!draft.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch("/api/assistant/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results);
      setSearched(true);
    } catch {
      setSearchError("Something went wrong searching the library.");
    } finally {
      setSearching(false);
    }
  }

  async function optimize() {
    if (!draft.trim() || !apiKey.trim()) return;
    setOptimizing(true);
    setOptimizeError(null);
    setOptimized(null);
    try {
      const res = await fetch("/api/assistant/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, apiKey, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to optimize prompt.");
      setOptimized(data.optimized);
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : "Failed to optimize prompt.");
    } finally {
      setOptimizing(false);
    }
  }

  function submitOptimizedToLibrary() {
    if (!optimized) return;
    try {
      sessionStorage.setItem("promptlib:draftBody", optimized);
    } catch {
      // ignore storage failures — the new-prompt form just won't be pre-filled
    }
    router.push("/library/new");
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <Label htmlFor="draft">Your prompt idea</Label>
        <Textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={7}
          placeholder="Describe what you're trying to get an AI assistant to do, or paste a rough draft of your prompt..."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={findSimilar} disabled={!draft.trim() || searching}>
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {searching ? "Searching..." : "Find similar prompts"}
          </Button>
        </div>
        {searchError && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle size={15} />
            {searchError}
          </p>
        )}
      </Card>

      {searched && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {results.length > 0
              ? `${results.length} similar ${results.length === 1 ? "prompt" : "prompts"} already in the library`
              : "No close matches in the library"}
          </h2>
          {results.length > 0 ? (
            <PromptCardGrid prompts={results} initialOpenId={null} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing close enough was found — your idea might be worth submitting as a new
              prompt.
            </p>
          )}
        </div>
      )}

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={17} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Optimize with your own API key
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Pick a provider and paste an API key to have it rewrite your draft into a clearer,
          more structured prompt. Your key stays only in this browser tab (cleared when you
          close it) and is sent directly to power this one request — it is never saved on our
          server or logged.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProvider(p.id)}
              className={clsx(
                "cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                provider === p.id
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-white text-muted-foreground hover:bg-muted"
              )}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-xs">
                {p.model}
                {p.note ? ` · ${p.note}` : ""}
              </div>
            </button>
          ))}
        </div>

        <div className="relative mb-4 max-w-md">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => updateApiKey(e.target.value)}
            placeholder={activeProvider.placeholder}
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-3.5 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="button"
            onClick={() => setShowKey((s) => !s)}
            aria-label={showKey ? "Hide API key" : "Show API key"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Button onClick={optimize} disabled={!draft.trim() || !apiKey.trim() || optimizing}>
          {optimizing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {optimizing ? "Optimizing..." : `Optimize with ${activeProvider.label}`}
        </Button>
        {!apiKey.trim() && (
          <p className="mt-2 text-xs text-muted-foreground">
            Add a {activeProvider.label} API key above to enable optimization.
          </p>
        )}

        {optimizeError && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle size={15} />
            {optimizeError}
          </p>
        )}

        {optimized && (
          <div className="mt-5">
            <Card className="bg-muted/40 p-4">
              <HighlightedBody
                body={optimized}
                className="whitespace-pre-wrap font-mono text-[13.5px] leading-relaxed text-foreground"
              />
            </Card>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyTextButton text={optimized} />
              <Button variant="outline" size="sm" onClick={submitOptimizedToLibrary}>
                Submit to library
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
