import Link from "next/link";
import { LibraryBig, Star, ShieldCheck, LogOut, Sparkles } from "lucide-react";
import { auth, signOut } from "@/lib/auth";

export async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/library" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <LibraryBig size={18} strokeWidth={2} />
          </span>
          <span className="hidden sm:inline">Prompt Library</span>
        </Link>

        {session?.user && (
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink href="/library" icon={<LibraryBig size={16} />} label="Library" />
            <NavLink href="/library/assistant" icon={<Sparkles size={16} />} label="Assistant" />
            <NavLink href="/library/favorites" icon={<Star size={16} />} label="Favorites" />
            {session.user.role === "ADMIN" && (
              <NavLink href="/admin" icon={<ShieldCheck size={16} />} label="Admin" />
            )}

            <div className="mx-2 hidden h-6 w-px bg-border sm:block" />

            <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground md:inline">
              {session.user.email}
            </span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
