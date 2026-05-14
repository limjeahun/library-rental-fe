"use client";

import type {
  ClearOverdueCommand,
  RentalItemCommand,
  RentalMemberCommand,
} from "@domain/rental/ports/driven/rental-repository";
import { useAppContainer } from "@di/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "../book/book-hooks";
import { memberKeys } from "../member/member-hooks";

export const rentalKeys = {
  card: (memberId: string) => ["rental", "card", memberId] as const,
  rentItems: (memberId: string) => ["rental", "rent-items", memberId] as const,
  returnItems: (memberId: string) => ["rental", "return-items", memberId] as const,
};

export function useCreateRentalCard() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: RentalMemberCommand) => rental.createRentalCard.execute(command),
    onSuccess: (card) => queryClient.setQueryData(rentalKeys.card(card.userId), card),
  });
}

export function useFindRentalCard() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => rental.getRentalCard.execute(memberId),
    onSuccess: (card) => {
      queryClient.setQueryData(rentalKeys.card(card.userId), card);
      queryClient.setQueryData(rentalKeys.rentItems(card.userId), card.rentItems);
      queryClient.setQueryData(rentalKeys.returnItems(card.userId), card.returnItems);
    },
  });
}

export function useFindRentItems() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => rental.getRentItems.execute(memberId),
    onSuccess: (items, memberId) => queryClient.setQueryData(rentalKeys.rentItems(memberId), items),
  });
}

export function useFindReturnItems() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => rental.getReturnItems.execute(memberId),
    onSuccess: (items, memberId) => queryClient.setQueryData(rentalKeys.returnItems(memberId), items),
  });
}

export function useRentItem() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: RentalItemCommand) => rental.rentItem.execute(command),
    onSuccess: (result) => {
      invalidateRentalFlow(queryClient, result.userId, result.rentItems.at(-1)?.itemId);
    },
  });
}

export function useReturnItem() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: RentalItemCommand) => rental.returnItem.execute(command),
    onSuccess: (result) => {
      invalidateRentalFlow(queryClient, result.userId, result.returnItems.at(-1)?.itemId);
    },
  });
}

export function useOverdueItem() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: RentalItemCommand) => rental.overdueItem.execute(command),
    onSuccess: (card) => {
      queryClient.setQueryData(rentalKeys.card(card.userId), card);
      queryClient.setQueryData(rentalKeys.rentItems(card.userId), card.rentItems);
    },
  });
}

export function useClearOverdue() {
  const { rental } = useAppContainer();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: ClearOverdueCommand) => rental.clearOverdue.execute(command),
    onSuccess: (result) => {
      invalidateRentalFlow(queryClient, result.userId);
    },
  });
}

function invalidateRentalFlow(
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: string,
  bookNo?: number,
) {
  queryClient.invalidateQueries({ queryKey: rentalKeys.card(memberId) });
  queryClient.invalidateQueries({ queryKey: rentalKeys.rentItems(memberId) });
  queryClient.invalidateQueries({ queryKey: rentalKeys.returnItems(memberId) });
  queryClient.invalidateQueries({ queryKey: memberKeys.id(memberId) });
  queryClient.invalidateQueries({ queryKey: ["bestbook", "list"] });
  if (bookNo) {
    queryClient.invalidateQueries({ queryKey: bookKeys.detail(bookNo) });
  }
}
