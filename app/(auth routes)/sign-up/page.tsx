"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { register } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import { getErrorMessage } from "@/lib/api/errors";
import css from "./SignUpPage.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setError("");
    setPending(true);
    try {
      const user = await register({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      });
      queryClient.clear();
      useAuthStore.getState().setUser(user);
      router.replace("/profile");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>
      <form className={css.form} onSubmit={handleSubmit}>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            className={css.input}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className={css.input}
            required
          />
        </div>

        <div className={css.actions}>
          <button type="submit" disabled={pending} className={css.submitButton}>
            Register
          </button>
        </div>

        <p className={css.error} role="alert">
          {error}
        </p>
      </form>
    </main>
  );
}
