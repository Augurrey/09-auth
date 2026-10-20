"use client";
import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "@/lib/api";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";
import css from "./NotesPage.module.css";

const PER_PAGE = 12;

export default function NotesClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["notes", search, page],
    queryFn: () => fetchNotes(search, page, PER_PAGE),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    handleSearch(value);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleSearchChange} />

        {data && data.totalPages > 1 && (
          <Pagination
            totalPages={data.totalPages}
            page={page}
            setPage={setPage}
          />
        )}

        <Link className={css.button} href="/notes/action/create">
          Create note +
        </Link>
      </header>

      {isLoading && <strong>Loading...</strong>}

      {isFetching && !isLoading && <strong>Updating...</strong>}

      {isError && <strong>Something went wrong. Please try again.</strong>}

      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}

      {data && data.notes.length === 0 && !isLoading && <p>No notes found.</p>}
    </div>
  );
}
