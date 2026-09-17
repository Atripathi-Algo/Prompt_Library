"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PromptDetailContent, type PromptDetail } from "@/components/prompt-detail-content";

export function PromptModal({
  promptId,
  onClose,
}: {
  promptId: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!promptId) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [promptId, onClose]);

  if (!promptId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-[2px] sm:py-16"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-surface p-6 shadow-xl sm:p-8 lg:max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-6 sm:top-6"
        >
          <X size={18} />
        </button>

        {/* pr-10 keeps title/badges from running under the absolutely-positioned close button */}
        <div className="pr-10">
          {/* Keyed by promptId so switching prompts remounts with fresh state instead of resetting it in an effect */}
          <PromptModalBody key={promptId} promptId={promptId} />
        </div>
      </div>
    </div>
  );
}

function PromptModalBody({ promptId }: { promptId: string }) {
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/prompts/${promptId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPrompt(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [promptId]);

  if (error) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground">
        Couldn&apos;t load this prompt.
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return <PromptDetailContent prompt={prompt} />;
}
