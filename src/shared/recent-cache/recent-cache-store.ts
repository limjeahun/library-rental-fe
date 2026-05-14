"use client";

import type { Book } from "@domain/book/entities/book";
import type { Member } from "@domain/member/entities/member";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT_ITEMS = 50;

type RecentCacheState = {
  books: Book[];
  members: Member[];
  addBook: (book: Book) => void;
  addMember: (member: Member) => void;
  clear: () => void;
};

export const useRecentCacheStore = create<RecentCacheState>()(
  persist(
    (set) => ({
      books: [],
      members: [],
      addBook: (book) =>
        set((state) => ({
          books: upsertAndLimit(state.books, book, (item) => item.no),
        })),
      addMember: (member) =>
        set((state) => ({
          members: upsertAndLimit(state.members, member, (item) => item.memberId),
        })),
      clear: () => set({ books: [], members: [] }),
    }),
    {
      name: "library-rental-recent-cache",
    },
  ),
);

function upsertAndLimit<T>(items: T[], next: T, keyOf: (item: T) => string | number): T[] {
  const nextKey = keyOf(next);
  const filtered = items.filter((item) => keyOf(item) !== nextKey);
  return [next, ...filtered].slice(0, MAX_RECENT_ITEMS);
}
