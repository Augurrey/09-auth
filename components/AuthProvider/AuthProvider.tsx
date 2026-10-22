"use client";
import { useEffect, type ReactNode } from "react";
import { checkSession, getMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
export default function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;
    const initialUser = useAuthStore.getState().user;
    async function restore() {
      try {
        const valid = await checkSession();
        const user = valid ? await getMe() : null;
        // A login/logout completed while the initial request was in flight.
        if (!active || useAuthStore.getState().user !== initialUser) return;
        if (user) useAuthStore.getState().setUser(user);
        else useAuthStore.getState().clearIsAuthenticated();
      } catch {
        if (active && useAuthStore.getState().user === initialUser)
          useAuthStore.getState().clearIsAuthenticated();
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
  return children;
}
