"use client";

import { useRouter } from "next/navigation";

export function UserRowControls({
  userId,
  role,
  isActive,
}: {
  userId: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
}) {
  const router = useRouter();

  async function update(patch: Record<string, unknown>) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={role}
        onChange={(e) => update({ role: e.target.value })}
        className="cursor-pointer rounded-md border border-border bg-white px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button
        onClick={() => update({ isActive: !isActive })}
        className="cursor-pointer rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
