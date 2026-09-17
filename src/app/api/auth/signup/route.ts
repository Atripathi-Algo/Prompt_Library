import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAllowedEmail, ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  const { ok, retryAfterMs } = rateLimit(clientKey(req, "signup"), 5, 15 * 60 * 1000);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      { error: `Signup is restricted to @${ALLOWED_EMAIL_DOMAIN} email addresses.` },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
    });
  } catch (err) {
    logger.error({ err, email }, "signup: user creation failed");
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
