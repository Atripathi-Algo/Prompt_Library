import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRowControls } from "@/components/user-row-controls";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Manage roles and account access for the library.
        </p>

        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Controls</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{u.name ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={u.role === "ADMIN" ? "accent" : "muted"}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          u.isActive
                            ? "inline-flex items-center gap-1.5 text-muted-foreground"
                            : "inline-flex items-center gap-1.5 text-destructive"
                        }
                      >
                        <span
                          className={
                            u.isActive
                              ? "h-1.5 w-1.5 rounded-full bg-accent"
                              : "h-1.5 w-1.5 rounded-full bg-destructive"
                          }
                        />
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.id === session?.user.id ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <UserRowControls userId={u.id} role={u.role} isActive={u.isActive} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
