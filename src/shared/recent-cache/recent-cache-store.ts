"use client";

import type { Book } from "@domain/book/entities/book";
import type { Member } from "@domain/member/entities/member";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT_ITEMS = 50;
const MAX_API_LOGS = 10;

export type ApiRequestLog = {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
};

type RecentCacheState = {
  books: Book[];
  members: Member[];
  bookTouchedAtByNo: Record<number, string>;
  memberTouchedAtById: Record<string, string>;
  apiLogs: ApiRequestLog[];
  addBook: (book: Book) => void;
  addMember: (member: Member) => void;
  addApiLog: (log: Omit<ApiRequestLog, "id" | "timestamp">) => void;
  clear: () => void;
};

export const useRecentCacheStore = create<RecentCacheState>()(
  persist(
    (set) => ({
      books: [],
      members: [],
      bookTouchedAtByNo: {},
      memberTouchedAtById: {},
      apiLogs: [],
      addBook: (book) =>
        set((state) => ({
          books: upsertAndLimit(state.books, book, (item) => item.no),
          bookTouchedAtByNo: { ...state.bookTouchedAtByNo, [book.no]: new Date().toISOString() },
        })),
      addMember: (member) =>
        set((state) => ({
          members: upsertAndLimit(state.members, member, (item) => item.memberId),
          memberTouchedAtById: {
            ...state.memberTouchedAtById,
            [member.memberId]: new Date().toISOString(),
          },
        })),
      addApiLog: (log) =>
        set((state) => ({
          apiLogs: [
            {
              ...log,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.apiLogs,
          ].slice(0, MAX_API_LOGS),
        })),
      clear: () =>
        set({
          books: [],
          members: [],
          bookTouchedAtByNo: {},
          memberTouchedAtById: {},
          apiLogs: [],
        }),
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
