import { z } from "zod";

/** Prisma's default `cuid()` ids — used to validate route params before querying. */
export const idParamSchema = z.string().min(1).max(60);
