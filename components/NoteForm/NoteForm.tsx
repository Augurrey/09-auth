"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createNote } from "@/lib/api";
import type { CreateNoteData } from "@/lib/api";
import type { NoteTag } from "@/types/note";
import useNoteStore from "@/lib/store/noteStore";

import css from "./NoteForm.module.css";

type FormErrors = Partial<Record<keyof CreateNoteData, string>>;

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters")
    .required("Title is required"),

  content: Yup.string().max(500, "Content must be at most 500 characters"),

  tag: Yup.mixed<NoteTag>()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"])
    .required("Tag is required"),
});

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        await useNoteStore.persist.rehydrate();
      } catch {
        toast.error("Failed to restore draft");
      } finally {
        if (active) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const createMutation = useMutation({
    mutationFn: createNote,

    onSuccess: async () => {
      clearDraft();

      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      toast.success("Note created");
      router.push("/notes/filter/all");
    },

    onError: () => {
      toast.error("Failed to create note");
    },
  });

  const formAction = async (formData: FormData) => {
    const values: CreateNoteData = {
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      tag: String(formData.get("tag") ?? "Todo") as NoteTag,
    };

    try {
      await validationSchema.validate(values, {
        abortEarly: false,
      });

      setErrors({});
      createMutation.mutate(values);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: FormErrors = {};

        error.inner.forEach((err) => {
          const field = err.path as keyof CreateNoteData;

          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });

        setErrors(newErrors);
      } else {
        toast.error("Validation failed");
      }
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <form
      className={css.form}
      action={formAction}
      key={isHydrated ? "hydrated" : "loading"}
    >
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>

        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          defaultValue={draft.title}
          onChange={(event) => setDraft({ title: event.target.value })}
        />

        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>

        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={(event) => setDraft({ content: event.target.value })}
        />

        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>

        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(event) =>
            setDraft({
              tag: event.target.value as NoteTag,
            })
          }
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>

        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={css.submitButton}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
