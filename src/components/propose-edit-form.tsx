"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Textarea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProposeEditForm({
  promptId,
  currentBody,
  currentVariables,
}: {
  promptId: string;
  currentBody: string;
  currentVariables: string[];
}) {
  const router = useRouter();
  const [body, setBody] = useState(currentBody);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`/api/prompts/${promptId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, note, variables: currentVariables }),
    });
    if (res.ok) {
      setStatus("done");
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Why this change? (optional)"
      />
      <Button type="submit" variant="outline" size="sm" disabled={status === "saving"} className="w-fit">
        {status === "saving" && <Loader2 size={14} className="animate-spin" />}
        {status === "saving" ? "Submitting..." : "Submit for review"}
      </Button>
      {status === "done" && (
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <CheckCircle2 size={15} />
          Submitted — pending admin approval.
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle size={15} />
          Something went wrong.
        </p>
      )}
    </form>
  );
}
