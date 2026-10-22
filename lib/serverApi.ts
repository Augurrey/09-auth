import { cookies } from "next/headers";
import { api } from "./api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";
interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}
async function headers() {
  return { Cookie: (await cookies()).toString() };
}
export async function fetchNotes(
  search: string,
  page: number,
  perPage = 12,
  tag?: string,
): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>("/notes", {
    headers: await headers(),
    params: { search, page, perPage, ...(tag && { tag }) },
  });
  return data;
}
export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: await headers(),
  });
  return data;
}
export async function getMe(cookieHeader?: string): Promise<User> {
  const { data } = await api.get<User>("/users/me", {
    headers:
      cookieHeader === undefined ? await headers() : { Cookie: cookieHeader },
  });
  return data;
}
export async function checkSession(cookieHeader?: string) {
  return api.get<{ success: boolean }>("/auth/session", {
    headers:
      cookieHeader === undefined ? await headers() : { Cookie: cookieHeader },
  });
}
