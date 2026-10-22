import { NextRequest, NextResponse } from "next/server";
import { parseSetCookie } from "cookie";
import { isAxiosError } from "axios";
import { checkSession, getMe } from "@/lib/api/serverApi";
const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(path);
  let authenticated = request.cookies.has("accessToken");
  const cookieHeaders: string[] = [];
  if (authenticated) {
    try {
      await getMe(request.headers.get("cookie") ?? "");
    } catch (error) {
      if (
        !isAxiosError(error) ||
        ![401, 403].includes(error.response?.status ?? 0)
      )
        throw error;
      authenticated = false;
      request.cookies.delete("accessToken");
    }
  }
  if (!authenticated && request.cookies.has("refreshToken")) {
    try {
      const session = await checkSession(request.cookies.toString());
      authenticated = session.data.success;
      cookieHeaders.push(...(session.headers["set-cookie"] ?? []));
    } catch {
      authenticated = false;
    }
  }
  let response: NextResponse;
  if (isPrivate && !authenticated)
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  else if (isPublic && authenticated)
    response = NextResponse.redirect(new URL("/profile", request.url));
  else {
    const headers = new Headers(request.headers);
    for (const header of cookieHeaders) {
      const parsed = parseSetCookie(header);
      if (parsed.value !== undefined)
        request.cookies.set(parsed.name, parsed.value);
    }
    headers.set("cookie", request.cookies.toString());
    response = NextResponse.next({ request: { headers } });
  }
  for (const header of cookieHeaders)
    response.headers.append("set-cookie", header);
  if (!authenticated) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }
  return response;
}
export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
