import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = await verifyToken(token);

  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/livraria", "/livraria/:path*", "/tesouraria", "/tesouraria/:path*"],
};
