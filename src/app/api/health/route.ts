import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up" });
  } catch (err) {
    logger.error({ err }, "health check: database unreachable");
    return NextResponse.json({ status: "error", db: "down" }, { status: 503 });
  }
}
