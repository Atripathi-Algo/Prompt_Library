"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewButtons({ versionId }: { versionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  async function review(action: "approve" | "reject") {
    const rejectReason =
      action === "reject" ? window.prompt("Reason for rejection (optional):") ?? undefined : undefined;

    setPending(action);
    await fetch(`/api/admin/submissions/${versionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectReason }),
    });
    router.refresh();
  }

  return (
    <div className="mt-4 flex gap-2">
      <Button size="sm" onClick={() => review("approve")} disabled={pending !== null}>
        {pending === "approve" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Check size={14} />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => review("reject")}
        disabled={pending !== null}
      >
        {pending === "reject" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <X size={14} />
        )}
        Reject
      </Button>
    </div>
  );
}
