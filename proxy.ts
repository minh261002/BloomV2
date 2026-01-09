import { NextRequest, NextResponse } from "next/server";

interface SessionData {
  user?: {
    role?: "ADMIN" | "USER";
    id?: string;
  };
}

const CACHE_DURATION = 5000; // 5s
const SESSION_TIMEOUT = 3000; // 3s
const sessionCache = new Map<
  string,
  { session: SessionData | null; timestamp: number }
>();

const isPublicPath = (pathname: string): boolean => {
  const publicPaths = ["/login", "/unauthorized", "/api"];
  return publicPaths.some((path) => pathname.startsWith(path));
};

const isAdminRoute = (pathname: string): boolean =>
  pathname.startsWith("/admin");

const fetchSession = async (
  request: NextRequest
): Promise<SessionData | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT);

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
        "User-Agent": request.headers.get("User-Agent") || "",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const isAdmin = isAdminRoute(pathname);
  const cookie = request.headers.get("cookie") || "";
  const cacheKey = `${cookie}-${pathname}`;
  const cached = sessionCache.get(cacheKey);

  let session: SessionData | null = null;

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    session = cached.session;
  } else {
    session = await fetchSession(request);
    sessionCache.set(cacheKey, { session, timestamp: Date.now() });
  }

  const role = session?.user?.role;

  // If no session, redirect to login
  if (!role) return NextResponse.redirect(new URL("/login", request.url));

  if (isAdmin) {
    if (role === "ADMIN") return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Protected non-admin routes: only USER allowed
  if (role === "USER") return NextResponse.next();
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/protected/:path*"],
};
