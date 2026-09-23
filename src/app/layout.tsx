import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Prompt Library",
  description: "AlgoAnalytics internal prompt library",
};

// Every page here is session/DB-backed (an internal authenticated tool, not
// a marketing site) — force dynamic rendering everywhere instead of letting
// Next.js try to statically prerender pages like /admin at build time,
// which fails without a real DATABASE_URL available in the build environment.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
