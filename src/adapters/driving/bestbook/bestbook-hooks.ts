"use client";

import type { RecordBestBookRentCommand } from "@domain/bestbook/ports/driven/bestbook-repository";
import { useAppContainer } from "@di/providers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const bestBookKeys = {
  list: ["bestbook", "list"] as const,
  detail: (id: number) => ["bestbook", "detail", id] as const,
};

export function useBestBooks() {
  const { bestbook } = useAppContainer();

  return useQuery({
    queryKey: bestBookKeys.list,
    queryFn: () => bestbook.getAllBestBooks.execute(),
  });
}

export function useFindBestBookById() {
  const { bestbook } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bestbook.getBestBookById.execute(id),
    onSuccess: (found) => queryClient.setQueryData(bestBookKeys.detail(found.id), found),
  });
}

export function useRecordBestBookRent() {
  const { bestbook } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: RecordBestBookRentCommand) => bestbook.recordBestBookRent.execute(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bestBookKeys.list }),
  });
}
