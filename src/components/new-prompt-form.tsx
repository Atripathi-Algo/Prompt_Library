"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMPLEXITY_LEVELS, complexityLabel } from "@/lib/complexity";

const DRAFT_BODY_STORAGE_KEY = "promptlib:draftBody";

export function NewPromptForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [body, setBody] = useState("");

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem(DRAFT_BODY_STORAGE_KEY);
      if (draft) {
        // One-time hydration from a browser-only store on mount, not a derived-state
        // loop — sessionStorage doesn't exist during SSR, so this can't run there.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBody(draft);
        sessionStorage.removeItem(DRAFT_BODY_STORAGE_KEY);
      }
    } catch {
      // sessionStorage can be unavailable (private browsing); the field just stays empty
    }
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const form = new FormData(e.currentTarget);
    const variables = (form.get("variables") as string)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        body: form.get("body"),
        categoryName: form.get("category") || undefined,
        variables,
        complexity: form.get("complexity"),
      }),
    });

    setStatus("idle");

    if (!res.ok) {
      setError("Something went wrong.");
      return;
    }
    router.push("/library");
  }

  return (
    <Card className="p-6">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required placeholder="e.g. Weekly status summary" />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            list="category-options"
            placeholder="Optional, e.g. Reporting"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="body">Prompt body</Label>
          <Textarea
            id="body"
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={6}
            placeholder="Use {{variable}} for placeholders."
          />
        </div>
        <div>
          <Label htmlFor="variables">Variables</Label>
          <Input
            id="variables"
            name="variables"
            placeholder="Comma separated, e.g. audience, tone"
          />
        </div>
        <div>
          <Label htmlFor="complexity">Complexity</Label>
          <select
            id="complexity"
            name="complexity"
            defaultValue="BEGINNER"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-[15px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            {COMPLEXITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {complexityLabel[level]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={status === "saving"} className="w-fit">
          {status === "saving" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {status === "saving" ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Card>
  );
}
