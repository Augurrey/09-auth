import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAxiosError } from "axios";
import { getMe } from "@/lib/api/serverApi";
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await cookies()).has("accessToken")) {
    let authenticated = false;
    try {
      await getMe();
      authenticated = true;
    } catch (error) {
      if (
        !isAxiosError(error) ||
        ![401, 403].includes(error.response?.status ?? 0)
      )
        throw error;
    }
    if (authenticated) redirect("/profile");
  }
  return children;
}
