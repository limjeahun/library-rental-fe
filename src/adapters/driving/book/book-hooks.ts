"use client";

import type { RegisterBookCommand } from "@domain/book/ports/driven/book-repository";
import { useAppContainer } from "@di/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";

export const bookKeys = {
  detail: (no: number) => ["book", "detail", no] as const,
  recent: ["book", "recent"] as const,
};

export function useRegisterBook() {
  const { book } = useAppContainer();
  const queryClient = useQueryClient();
  const addBook = useRecentCacheStore((store) => store.addBook);

  return useMutation({
    mutationFn: (command: RegisterBookCommand) => book.registerBook.execute(command),
    onSuccess: (created) => {
      addBook(created);
      queryClient.setQueryData(bookKeys.detail(created.no), created);
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
      queryClient.setQueryData(bookKeys.detail(updated.no), updated);
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
      queryClient.setQueryData(bookKeys.detail(updated.no), updated);
    },
  });
}
