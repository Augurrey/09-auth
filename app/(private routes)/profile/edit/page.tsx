"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/authStore";
import { updateMe } from "@/lib/api/clientApi";
import { getErrorMessage } from "@/lib/api/errors";
import css from "./EditProfilePage.module.css";
export default function EditProfile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.setQueryData(["user"], updated);
      router.replace("/profile");
      router.refresh();
    },
    onError: (error) => setError(getErrorMessage(error)),
  });
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const username = String(
      new FormData(event.currentTarget).get("username") ?? "",
    ).trim();
    if (!username) {
      setError("Username is required");
      return;
    }
    setError("");
    mutation.mutate({ username });
  }
  if (!user)
    return (
      <main className={css.mainContent}>
        <p>Loading profile...</p>
      </main>
    );
  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>
        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />
        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              key={user.username}
              id="username"
              name="username"
              type="text"
              defaultValue={user.username}
              className={css.input}
              required
            />
          </div>
          <p>Email: {user.email}</p>
          {error && <p role="alert">{error}</p>}
          <div className={css.actions}>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={css.saveButton}
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              className={css.cancelButton}
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
