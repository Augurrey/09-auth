import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isAxiosError } from "axios";
import { parseSetCookie } from "cookie";

import { checkSession, getMe } from "@/lib/api/serverApi";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

function isUnauthorized(error: unknown): boolean {
  return (
    isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)
  );
}

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const { pathname } = request.nextUrl;

  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isPublic = publicRoutes.includes(pathname);

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let isAuthenticated = false;
  let refreshedCookies: ReturnType<typeof parseSetCookie>[] = [];

  if (accessToken) {
    try {
      await getMe(cookieStore.toString());
      isAuthenticated = true;
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }
    }
  }

  if (!isAuthenticated && refreshToken) {
    const refreshCookies = cookieStore
      .getAll()
      .filter((cookie) => cookie.name !== "accessToken")
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    try {
      const session = await checkSession(refreshCookies);
      const setCookie = session.headers["set-cookie"];

      const cookieHeaders = Array.isArray(setCookie)
        ? setCookie
        : setCookie
          ? [setCookie]
          : [];

      refreshedCookies = cookieHeaders.map((header) => parseSetCookie(header));

      isAuthenticated =
        session.data.success &&
        refreshedCookies.some(
          (cookie) => cookie.name === "accessToken" && Boolean(cookie.value),
        );
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }
    }
  }

  let response: NextResponse;

  if (isPrivate && !isAuthenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublic && isAuthenticated) {
    response = NextResponse.redirect(new URL("/profile", request.url));
  } else {
    response = NextResponse.next();
  }

  if (isAuthenticated) {
    for (const cookie of refreshedCookies) {
      if (cookie.value !== undefined) {
        response.cookies.set(cookie.name, cookie.value, cookie);
      }
    }
  } else {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
