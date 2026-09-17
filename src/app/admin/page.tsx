import Link from "next/link";
import { FileText, Clock, Users, TrendingUp, Award, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [
    totalPrompts,
    pendingCount,
    totalUsers,
    topPrompts,
    topContributors,
    noResultSearches,
  ] = await Promise.all([
    prisma.prompt.count(),
    prisma.promptVersion.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.prompt.findMany({
      orderBy: { useCount: "desc" },
      take: 5,
      select: { id: true, title: true, useCount: true },
    }),
    prisma.user.findMany({
      orderBy: { prompts: { _count: "desc" } },
      take: 5,
      select: { id: true, name: true, email: true, _count: { select: { prompts: true } } },
    }),
    prisma.usageEvent.groupBy({
      by: ["query"],
      where: { type: "SEARCH_NO_RESULT", query: { not: null } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Usage insights and moderation for the prompt library.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/submissions">
              <Button variant="outline" size="sm">
                Pending submissions
                {pendingCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
                    {pendingCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Users
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={<FileText size={18} />} label="Total prompts" value={totalPrompts} />
          <StatCard
            icon={<Clock size={18} />}
            label="Pending submissions"
            value={pendingCount}
            tone={pendingCount > 0 ? "warn" : "default"}
          />
          <StatCard icon={<Users size={18} />} label="Total users" value={totalUsers} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Panel title="Most-used prompts" icon={<TrendingUp size={16} />}>
            {topPrompts.length === 0 ? (
              <EmptyRow />
            ) : (
              topPrompts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/library/${p.id}`}
                    className="truncate text-foreground hover:text-primary hover:underline"
                  >
                    {p.title}
                  </Link>
                  <span className="ml-2 shrink-0 font-medium text-muted-foreground">
                    {p.useCount}
                  </span>
                </li>
              ))
            )}
          </Panel>

          <Panel title="Top contributors" icon={<Award size={16} />}>
            {topContributors.length === 0 ? (
              <EmptyRow />
            ) : (
              topContributors.map((u) => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground">{u.name ?? u.email}</span>
                  <span className="ml-2 shrink-0 font-medium text-muted-foreground">
                    {u._count.prompts}
                  </span>
                </li>
              ))
            )}
          </Panel>

          <Panel title="Searches with no results" icon={<SearchX size={16} />}>
            {noResultSearches.length === 0 ? (
              <EmptyRow label="None yet" />
            ) : (
              noResultSearches.map((s) => (
                <li key={s.query} className="flex items-center justify-between text-sm">
                  <span className="truncate text-foreground">{s.query}</span>
                  <span className="ml-2 shrink-0 font-medium text-muted-foreground">
                    {s._count.query}
                  </span>
                </li>
              ))
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "warn";
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={
          tone === "warn"
            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        }
      >
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h2>
      <ul className="space-y-3">{children}</ul>
    </Card>
  );
}

function EmptyRow({ label = "No data yet" }: { label?: string }) {
  return <li className="text-sm text-muted-foreground">{label}</li>;
}
