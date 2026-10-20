import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateNoteData } from "@/lib/api";

type NoteDraft = {
  draft: CreateNoteData;
  setDraft: (note: Partial<CreateNoteData>) => void;
  clearDraft: () => void;
};

const initialDraft: CreateNoteData = {
  title: "",
  content: "",
  tag: "Todo",
};

const useNoteStore = create<NoteDraft>()(
  persist(
    (set) => ({
      draft: initialDraft,

      setDraft: (note) =>
        set((state) => ({
          draft: {
            ...state.draft,
            ...note,
          },
        })),

      clearDraft: () =>
        set({
          draft: initialDraft,
        }),
    }),
    {
      name: "note-draft",

      partialize: (state) => ({
        draft: state.draft,
      }),

      skipHydration: true,
    },
  ),
);

export default useNoteStore;
