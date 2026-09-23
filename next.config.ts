import type { NextConfig } from "next";

// Baseline CSP for a Next.js app without a nonce pipeline: 'unsafe-inline' is
// needed for Next's inline bootstrap scripts/styles, and 'unsafe-eval' only
// applies in dev (HMR). Everything else is locked to same-origin.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Produces a minimal .next/standalone server bundle (only the deps it
  // actually needs) — keeps the Docker image small instead of shipping
  // the whole node_modules tree.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // CSP only in production — dev mode's HMR websocket doesn't play
          // well with a strict connect-src behind some local proxy setups,
          // and CSP's main value is protecting real deployed traffic anyway.
          ...(isDev ? [] : [{ key: "Content-Security-Policy", value: csp }]),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
