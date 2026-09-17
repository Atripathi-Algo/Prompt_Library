"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, AlertCircle, LibraryBig, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/60 to-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <LibraryBig size={22} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Only @algoanalytics.com email addresses can sign up.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
            <div className="relative">
              <User
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input name="name" required placeholder="Full name" className="pl-10" />
            </div>
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
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Password (min 8 characters)"
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
