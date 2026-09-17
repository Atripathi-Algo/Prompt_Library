import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Mail, Lock, AlertCircle, LibraryBig } from "lucide-react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/ui/google-icon";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function credentialsSignIn(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await signIn("credentials", { email, password, redirectTo: "/library" });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=invalid");
      }
      throw error;
    }
  }

  async function googleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/library" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/60 to-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <LibraryBig size={22} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your @algoanalytics.com account
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>Invalid email or password.</span>
            </div>
          )}

          <form action={googleSignIn}>
            <Button type="submit" variant="outline" className="w-full">
              <GoogleIcon />
              Continue with Google
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or continue with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form action={credentialsSignIn} className="flex flex-col gap-3.5">
            <div className="relative">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@algoanalytics.com"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                className="pl-10"
              />
            </div>
            <Button type="submit" className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <a href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
