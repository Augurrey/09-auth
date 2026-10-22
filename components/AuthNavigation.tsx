"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { logout } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import useNoteStore from "@/lib/store/noteStore";
import css from "./AuthNavigation.module.css";
export default function AuthNavigation() {
  const { user, isAuthenticated, clearIsAuthenticated } = useAuthStore();
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  async function handleLogout() {
    setPending(true);
    try {
      await logout();
      await queryClient.cancelQueries();
      queryClient.clear();
      clearIsAuthenticated();
      useNoteStore.getState().clearDraft();
      router.replace("/sign-in");
      router.refresh();
    } catch {
      toast.error("Failed to log out. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return isAuthenticated ? (
    <>
      <li className={css.navigationItem}>
        <Link href="/profile" prefetch={false} className={css.navigationLink}>
          Profile
        </Link>
      </li>
      <li className={css.navigationItem}>
        <p className={css.userEmail}>{user?.email}</p>
        <button
          type="button"
          disabled={pending}
          className={css.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </li>
    </>
  ) : (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
          Login
        </Link>
      </li>
      <li className={css.navigationItem}>
        <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
          Register
        </Link>
      </li>
    </>
  );
}
