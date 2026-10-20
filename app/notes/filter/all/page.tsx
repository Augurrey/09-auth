import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes - All Tags",
  description:
    "Browse notes tegged with all tags. NoteHub allows you to filter and view notes based on specific tags for better organization.",
  openGraph: {
    title: "Notes - All Tags",
    description:
      "Browse notes tegged with all tags. NoteHub allows you to filter and view notes based on specific tags for better organization.",
    url: "https://notehub.com/",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub Open Graph Image",
      },
    ],
  },
};

const PER_PAGE = 12;

export default async function Notes() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1],
    queryFn: () => fetchNotes("", 1, PER_PAGE),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient />
    </HydrationBoundary>
  );
}
