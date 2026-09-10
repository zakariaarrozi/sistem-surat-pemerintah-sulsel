import { NextRequest, NextResponse } from "next/server";

// Halaman yang butuh login
const protectedPaths = ["/dashboard"];

// Halaman yang hanya untuk yang belum login
const authPaths = ["/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah ada token di cookie atau header
  // Token disimpan di localStorage (client-side), jadi kita gunakan cookie sebagai bridge
  const token = request.cookies.get("token")?.value;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPage = authPaths.includes(pathname);

  // Kalau belum login dan coba akses halaman protected → redirect ke login
  if (isProtected && !token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Kalau sudah login dan coba akses halaman auth (login) → redirect ke dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
