import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";

import { fetchNotes } from "@/lib/api/serverApi";
import NotesByTagClient from "./Notes.client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface NoteTagProps {
  params: Promise<{ slug: string[] }>;
}

type NetadataProps = {
  params: Promise<{ slug: string[] }>;
};

const PER_PAGE = 12;

const tags = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

export async function generateMetadata({
  params,
}: NetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const noteTag = slug[0];
  return {
    title: `Notes - ${noteTag}`,
    description: `Browse notes tagged with ${noteTag}. NoteHub allows you to filter and view notes based on specific tags for better organization.`,
    openGraph: {
      title: `Notes - ${noteTag}`,
      description: `Browse notes tagged with ${noteTag}. NoteHub allows you to filter and view notes based on specific tags for better organization.`,
      url: "/notes/filter/" + noteTag,
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
}

export default async function NotesByTag({ params }: NoteTagProps) {
  const { slug } = await params;

  const currentTag = slug[0];
  if (
    slug.length !== 1 ||
    !tags.some((item) => item.toLowerCase() === currentTag.toLowerCase())
  )
    notFound();

  const tag =
    currentTag.toLowerCase() === "all"
      ? ""
      : (tags.find((item) => item.toLowerCase() === currentTag.toLowerCase()) ??
        "");

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1, tag],
    queryFn: () => fetchNotes("", 1, PER_PAGE, tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesByTagClient key={tag} tag={tag} />
    </HydrationBoundary>
  );
}
