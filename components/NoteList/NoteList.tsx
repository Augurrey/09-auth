"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Note } from "@/types/note";
import { deleteNote } from "@/lib/api";
import css from "./NoteList.module.css";
import Link from "next/link";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNote,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      toast.success("Note deleted");
    },

    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>

          <p className={css.content}>{note.content}</p>

          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>

            <Link className={css.link} href={`/notes/${note.id}`}>
              View details
            </Link>

            <button
              type="button"
              className={css.button}
              onClick={() => handleDelete(note.id)}
              disabled={
                deleteMutation.isPending && deleteMutation.variables === note.id
              }
            >
              {deleteMutation.isPending && deleteMutation.variables === note.id
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
