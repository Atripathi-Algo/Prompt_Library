import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isApiAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/library", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
