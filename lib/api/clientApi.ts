import type { Note, NoteTag } from "@/types/note";
import { api } from "@/lib/api/api";
import type { User } from "@/types/user";

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes(
  search: string,
  page: number,
  perPage: number = 12,
  tag?: string,
): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      search,
      page,
      perPage,
      ...(tag && { tag }),
    },
  });

  return response.data;
}

export async function createNote(note: CreateNoteData): Promise<Note> {
  const response = await api.post<Note>("/notes", note);

  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`);

  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`);

  return response.data;
}

export interface Credentials {
  email: string;
  password: string;
}
export async function register(credentials: Credentials): Promise<User> {
  const { data } = await api.post<User>("/auth/register", credentials);
  return data;
}
export async function login(credentials: Credentials): Promise<User> {
  const { data } = await api.post<User>("/auth/login", credentials);
  return data;
}
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
export async function checkSession(): Promise<boolean> {
  const { data } = await api.get<{ success: boolean }>("/auth/session");
  return data.success;
}
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}
export async function updateMe(user: { username: string }): Promise<User> {
  const { data } = await api.patch<User>("/users/me", user);
  return data;
}
