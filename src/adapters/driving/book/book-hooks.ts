"use client";

import type { Book } from "@domain/book/entities/book";
import type { RegisterBookCommand } from "@domain/book/ports/driven/book-repository";
import { useAppContainer } from "@di/providers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";

export const bookKeys = {
  list: ["book", "list"] as const,
  detail: (no: number) => ["book", "detail", no] as const,
  recent: ["book", "recent"] as const,
};

export function useBooks() {
  const { book } = useAppContainer();

  return useQuery({
    queryKey: bookKeys.list,
    queryFn: () => book.getBooks.execute(),
  });
}

export function useRegisterBook() {
  const { book } = useAppContainer();
  const queryClient = useQueryClient();
  const addBook = useRecentCacheStore((store) => store.addBook);

  return useMutation({
    mutationFn: (command: RegisterBookCommand) => book.registerBook.execute(command),
    onSuccess: (created) => {
      addBook(created);
      upsertBookList(queryClient, created);
      queryClient.setQueryData(bookKeys.detail(created.no), created);
      queryClient.invalidateQueries({ queryKey: bookKeys.list });
    },
  });
}

export function useFindBook() {
  const { book } = useAppContainer();
  const queryClient = useQueryClient();
  const addBook = useRecentCacheStore((store) => store.addBook);

  return useMutation({
    mutationFn: (no: number) => book.getBook.execute(no),
    onSuccess: (found) => {
      addBook(found);
      upsertBookList(queryClient, found);
      queryClient.setQueryData(bookKeys.detail(found.no), found);
    },
  });
}

export function useMakeBookAvailable() {
  const { book } = useAppContainer();
  const queryClient = useQueryClient();
  const addBook = useRecentCacheStore((store) => store.addBook);

  return useMutation({
    mutationFn: (no: number) => book.makeAvailable.execute(no),
    onSuccess: (updated) => {
      addBook(updated);
      upsertBookList(queryClient, updated);
      queryClient.setQueryData(bookKeys.detail(updated.no), updated);
      queryClient.invalidateQueries({ queryKey: bookKeys.list });
    },
  });
}

export function useMakeBookUnavailable() {
  const { book } = useAppContainer();
  const queryClient = useQueryClient();
  const addBook = useRecentCacheStore((store) => store.addBook);

  return useMutation({
    mutationFn: (no: number) => book.makeUnavailable.execute(no),
    onSuccess: (updated) => {
      addBook(updated);
      upsertBookList(queryClient, updated);
      queryClient.setQueryData(bookKeys.detail(updated.no), updated);
      queryClient.invalidateQueries({ queryKey: bookKeys.list });
    },
  });
}

function upsertBookList(
  queryClient: ReturnType<typeof useQueryClient>,
  book: Book,
) {
  queryClient.setQueryData<Book[]>(bookKeys.list, (current) => {
    if (!current) {
      return current;
    }

    const exists = current.some((item) => item.no === book.no);
    const next = exists
      ? current.map((item) => (item.no === book.no ? book : item))
      : [book, ...current];

    return next.sort((a, b) => a.no - b.no);
  });
}
