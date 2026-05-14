"use client";

import type {
  ChangePointCommand,
  RegisterMemberCommand,
} from "@domain/member/ports/driven/member-repository";
import { useAppContainer } from "@di/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";

export const memberKeys = {
  no: (memberNo: number) => ["member", "no", memberNo] as const,
  id: (memberId: string) => ["member", "by-id", memberId] as const,
};

export function useRegisterMember() {
  const { member } = useAppContainer();
  const queryClient = useQueryClient();
  const addMember = useRecentCacheStore((store) => store.addMember);

  return useMutation({
    mutationFn: (command: RegisterMemberCommand) => member.registerMember.execute(command),
    onSuccess: (created) => {
      addMember(created);
      queryClient.setQueryData(memberKeys.no(created.memberNo), created);
      queryClient.setQueryData(memberKeys.id(created.memberId), created);
    },
  });
}

export function useFindMemberByNo() {
  const { member } = useAppContainer();
  const queryClient = useQueryClient();
  const addMember = useRecentCacheStore((store) => store.addMember);

  return useMutation({
    mutationFn: (memberNo: number) => member.getMember.execute(memberNo),
    onSuccess: (found) => {
      addMember(found);
      queryClient.setQueryData(memberKeys.no(found.memberNo), found);
      queryClient.setQueryData(memberKeys.id(found.memberId), found);
    },
  });
}

export function useFindMemberById() {
  const { member } = useAppContainer();
  const queryClient = useQueryClient();
  const addMember = useRecentCacheStore((store) => store.addMember);

  return useMutation({
    mutationFn: (memberId: string) => member.getMemberById.execute(memberId),
    onSuccess: (found) => {
      addMember(found);
      queryClient.setQueryData(memberKeys.no(found.memberNo), found);
      queryClient.setQueryData(memberKeys.id(found.memberId), found);
    },
  });
}

export function useSavePoint() {
  const { member } = useAppContainer();
  const queryClient = useQueryClient();
  const addMember = useRecentCacheStore((store) => store.addMember);

  return useMutation({
    mutationFn: (command: ChangePointCommand) => member.savePoint.execute(command),
    onSuccess: (updated) => {
      addMember(updated);
      queryClient.setQueryData(memberKeys.no(updated.memberNo), updated);
      queryClient.setQueryData(memberKeys.id(updated.memberId), updated);
    },
  });
}

export function useUsePoint() {
  const { member } = useAppContainer();
  const queryClient = useQueryClient();
  const addMember = useRecentCacheStore((store) => store.addMember);

  return useMutation({
    mutationFn: (command: ChangePointCommand) => member.usePoint.execute(command),
    onSuccess: (updated) => {
      addMember(updated);
      queryClient.setQueryData(memberKeys.no(updated.memberNo), updated);
      queryClient.setQueryData(memberKeys.id(updated.memberId), updated);
    },
  });
}
