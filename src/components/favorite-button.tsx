"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";

export function FavoriteButton({ promptId, initial }: { promptId: string; initial: boolean }) {
  const [favorited, setFavorited] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    setFavorited((f) => !f);
    try {
      const res = await fetch(`/api/prompts/${promptId}/favorite`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={clsx(
        "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors disabled:cursor-wait",
        favorited
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-border bg-white text-foreground hover:bg-muted"
      )}
    >
      <Star size={16} fill={favorited ? "currentColor" : "none"} />
      {favorited ? "Favorited" : "Favorite"}
    </button>
  );
}
