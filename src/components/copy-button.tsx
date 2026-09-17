"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, promptId }: { text: string; promptId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard access can be denied by the browser; still record usage below
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    fetch(`/api/prompts/${promptId}/copy`, { method: "POST" }).catch(() => {});
  }

  return (
    <Button onClick={handleCopy} size="md">
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Copied!" : "Copy prompt"}
    </Button>
  );
}
