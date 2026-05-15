"use client";

import {
  useFindMemberById,
  useFindMemberByNo,
  useRegisterMember,
  useSavePoint,
  useUsePoint,
} from "@adapters/driving/member/member-hooks";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import type { Member } from "@domain/member/entities/member";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Button } from "@shared/ui/button";
import { Field, Input } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coins, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const memberSchema = z.object({
  id: z.string().min(1, "회원 ID를 입력하세요."),
  name: z.string().min(1, "이름을 입력하세요."),
  passWord: z.string().min(1, "비밀번호를 입력하세요."),
  email: z.string().email("이메일 형식을 확인하세요."),
});

const lookupByNoSchema = z.object({ memberNo: z.string().min(1, "회원 번호를 입력하세요.") });
const lookupByIdSchema = z.object({ memberId: z.string().min(1, "회원 ID를 입력하세요.") });
const pointSchema = z.object({
  memberId: z.string().min(1, "회원 ID를 입력하세요."),
  point: z.string().min(1, "포인트를 입력하세요."),
});

type MemberForm = z.infer<typeof memberSchema>;
type LookupByNoForm = z.infer<typeof lookupByNoSchema>;
type LookupByIdForm = z.infer<typeof lookupByIdSchema>;
type PointForm = z.infer<typeof pointSchema>;

const roleLabels: Record<string, string> = {
  USER: "일반회원",
  ADMIN: "관리자",
};

export default function MembersPage() {
  const members = useRecentCacheStore((store) => store.members);
  const touchedAt = useRecentCacheStore((store) => store.memberTouchedAtById ?? {});
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const registerMember = useRegisterMember();
  const findByNo = useFindMemberByNo();
  const findById = useFindMemberById();
  const savePoint = useSavePoint();
  const usePoint = useUsePoint();
  const { notifySuccess, notifyError } = useToast();

  const memberForm = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: { id: "", name: "", passWord: "", email: "" },
  });
  const byNoForm = useForm<LookupByNoForm>({ resolver: zodResolver(lookupByNoSchema) });
  const byIdForm = useForm<LookupByIdForm>({ resolver: zodResolver(lookupByIdSchema) });
  const pointForm = useForm<PointForm>({
    resolver: zodResolver(pointSchema),
    defaultValues: { memberId: "", point: "0" },
  });

  function loadMember(member: Member) {
    setSelectedMember(member);
    byIdForm.setValue("memberId", member.memberId);
    byNoForm.setValue("memberNo", String(member.memberNo));
    pointForm.setValue("memberId", member.memberId);
  }

  async function submitMember(values: MemberForm) {
    try {
      const created = await registerMember.mutateAsync(values);
      loadMember(created);
      notifySuccess(`${created.memberId} 회원이 등록되었습니다.`);
      memberForm.reset({ id: "", name: "", passWord: "", email: "" });
    } catch (error) {
      if (!applyApiFieldErrors(error, memberForm.setError)) {
        notifyError(getErrorMessage(error));
      }
    }
  }

  async function lookupNo(values: LookupByNoForm) {
    try {
      const found = await findByNo.mutateAsync(Number(values.memberNo));
      loadMember(found);
      notifySuccess(`${found.memberId} 회원을 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function lookupId(values: LookupByIdForm) {
    try {
      const found = await findById.mutateAsync(values.memberId);
      loadMember(found);
      notifySuccess(`${found.memberId} 회원을 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function changePoint(values: PointForm, mode: "save" | "use") {
    try {
      const updated =
        mode === "save"
          ? await savePoint.mutateAsync({ ...values, point: Number(values.point) })
          : await usePoint.mutateAsync({ ...values, point: Number(values.point) });
      loadMember(updated);
      notifySuccess(`${updated.memberId} 포인트가 ${updated.point.value}로 변경되었습니다.`);
    } catch (error) {
      if (!applyApiFieldErrors(error, pointForm.setError)) {
        notifyError(getErrorMessage(error));
      }
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-slate-500">접수 창구</p>
        <h1 className="mt-1 text-2xl font-semibold">회원 관리</h1>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="신규 회원 접수">
          <form className="grid gap-3" onSubmit={memberForm.handleSubmit(submitMember)}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="회원 ID" error={memberForm.formState.errors.id?.message}>
                <Input autoComplete="username" {...memberForm.register("id")} />
              </Field>
              <Field label="이름" error={memberForm.formState.errors.name?.message}>
                <Input autoComplete="name" {...memberForm.register("name")} />
              </Field>
              <Field label="비밀번호" error={memberForm.formState.errors.passWord?.message}>
                <Input
                  autoComplete="new-password"
                  type="password"
                  {...memberForm.register("passWord")}
                />
              </Field>
              <Field label="이메일" error={memberForm.formState.errors.email?.message}>
                <Input autoComplete="email" {...memberForm.register("email")} />
              </Field>
            </div>
            <Button disabled={registerMember.isPending}>
              <Plus size={16} />
              등록
            </Button>
          </form>
        </Panel>

        <Panel title="회원 조회와 포인트">
          <div className="grid gap-4">
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={byIdForm.handleSubmit(lookupId)}
            >
              <Field label="회원 ID" error={byIdForm.formState.errors.memberId?.message}>
                <Input {...byIdForm.register("memberId")} />
              </Field>
              <Button className="mt-6" disabled={findById.isPending}>
                <Search size={16} />
                조회
              </Button>
            </form>
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={byNoForm.handleSubmit(lookupNo)}
            >
              <Field label="회원 번호" error={byNoForm.formState.errors.memberNo?.message}>
                <Input min={1} type="number" {...byNoForm.register("memberNo")} />
              </Field>
              <Button className="mt-6" disabled={findByNo.isPending}>
                <Search size={16} />
                조회
              </Button>
            </form>

            {selectedMember ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-2 text-sm">
                  <InfoLine label="회원 ID" value={selectedMember.memberId} />
                  <InfoLine label="이름" value={selectedMember.name} />
                  <InfoLine label="이메일" value={selectedMember.email.value} />
                  <InfoLine
                    label="권한"
                    value={selectedMember.authorities
                      .map((role) => roleLabels[role] ?? role)
                      .join(", ")}
                  />
                </div>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="text-sm text-slate-500">현재 포인트</div>
                  <div className="mt-1 text-3xl font-semibold text-slate-950">
                    {selectedMember.point.value.toLocaleString()}
                  </div>
                  <form
                    className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <Field label="포인트" error={pointForm.formState.errors.point?.message}>
                      <Input min={0} type="number" {...pointForm.register("point")} />
                    </Field>
                    <Button
                      className="mt-6"
                      type="button"
                      variant="success"
                      onClick={pointForm.handleSubmit((values) => changePoint(values, "save"))}
                    >
                      <Plus size={16} />
                      적립
                    </Button>
                    <Button
                      className="mt-6"
                      type="button"
                      variant="secondary"
                      onClick={pointForm.handleSubmit((values) => changePoint(values, "use"))}
                    >
                      <Coins size={16} />
                      사용
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <EmptyState message="회원 ID를 입력하고 조회하세요." />
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="최근 회원 목록"
        description="이 목록은 이 브라우저에서 최근 등록/조회한 회원입니다."
      >
        {members.length === 0 ? (
          <EmptyState message="아직 등록하거나 조회한 회원이 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">번호</th>
                  <th>ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th className="text-right">포인트</th>
                  <th className="text-right">등록/조회 시각</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.memberId}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => loadMember(member)}
                  >
                    <td className="py-2">{member.memberNo}</td>
                    <td>{member.memberId}</td>
                    <td>{member.name}</td>
                    <td>{member.email.value}</td>
                    <td className="text-right font-semibold">
                      {member.point.value.toLocaleString()}
                    </td>
                    <td className="text-right text-slate-500">
                      {formatDateTime(touchedAt[member.memberId])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-950">{value}</span>
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
