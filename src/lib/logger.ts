import pino from "pino";

/**
 * Structured server-side logger. Errors logged here stay on the server —
 * API routes must still return a generic, safe message to the client instead
 * of the raw error.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined, // omit pid/hostname noise in local dev logs
});
