"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyTextButton({ text, ...rest }: { text: string } & React.ComponentProps<typeof Button>) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard access can be denied by the browser; still flip the state below
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm" {...rest}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
