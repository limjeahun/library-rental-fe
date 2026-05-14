"use client";

import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import {
  useFindMemberById,
  useFindMemberByNo,
  useRegisterMember,
  useSavePoint,
  useUsePoint,
} from "@adapters/driving/member/member-hooks";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Button } from "@shared/ui/button";
import { Field, Input } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const memberSchema = z.object({
  id: z.string().min(1, "회원 ID를 입력하세요."),
  name: z.string().min(1, "이름을 입력하세요."),
  passWord: z.string().min(1, "비밀번호를 입력하세요."),
  email: z.string().email("이메일 형식을 확인하세요."),
});

type MemberForm = z.infer<typeof memberSchema>;

const lookupByNoSchema = z.object({ memberNo: z.string().min(1, "회원 번호를 입력하세요.") });
const lookupByIdSchema = z.object({ memberId: z.string().min(1, "회원 ID를 입력하세요.") });
const pointSchema = z.object({
  memberId: z.string().min(1, "회원 ID를 입력하세요."),
  point: z.string().min(1, "포인트를 입력하세요."),
});

type LookupByNoForm = z.infer<typeof lookupByNoSchema>;
type LookupByIdForm = z.infer<typeof lookupByIdSchema>;
type PointForm = z.infer<typeof pointSchema>;

export default function MembersPage() {
  const members = useRecentCacheStore((store) => store.members);
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
  const pointForm = useForm<PointForm>({ resolver: zodResolver(pointSchema), defaultValues: { point: "0" } });

  async function submitMember(values: MemberForm) {
    try {
      const created = await registerMember.mutateAsync(values);
      notifySuccess(`${created.memberId} 회원이 등록되었습니다.`);
      memberForm.reset();
    } catch (error) {
      if (!applyApiFieldErrors(error, memberForm.setError)) {
        notifyError(getErrorMessage(error));
      }
    }
  }

  async function lookupNo(values: LookupByNoForm) {
    try {
      const found = await findByNo.mutateAsync(Number(values.memberNo));
      notifySuccess(`${found.memberId} 회원을 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function lookupId(values: LookupByIdForm) {
    try {
      const found = await findById.mutateAsync(values.memberId);
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
        <h1 className="text-2xl font-semibold">회원 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          member-service의 `/api/Member` API를 호출합니다. 대문자 M 경로를 그대로 유지합니다.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="회원 등록" description="POST /api/Member/">
          <form className="grid gap-3" onSubmit={memberForm.handleSubmit(submitMember)}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="회원 ID" error={memberForm.formState.errors.id?.message}>
                <Input {...memberForm.register("id")} />
              </Field>
              <Field label="이름" error={memberForm.formState.errors.name?.message}>
                <Input {...memberForm.register("name")} />
              </Field>
              <Field label="비밀번호" error={memberForm.formState.errors.passWord?.message}>
                <Input type="password" {...memberForm.register("passWord")} />
              </Field>
              <Field label="이메일" error={memberForm.formState.errors.email?.message}>
                <Input {...memberForm.register("email")} />
              </Field>
            </div>
            <Button disabled={registerMember.isPending}>등록</Button>
          </form>
        </Panel>

        <Panel title="회원 조회 / 포인트" description="단건 조회와 수동 포인트 적립/사용">
          <div className="grid gap-4">
            <form className="flex gap-2" onSubmit={byIdForm.handleSubmit(lookupId)}>
              <Field label="회원 ID" error={byIdForm.formState.errors.memberId?.message}>
                <Input {...byIdForm.register("memberId")} />
              </Field>
              <Button className="mt-6" variant="secondary" disabled={findById.isPending}>
                ID 조회
              </Button>
            </form>
            <form className="flex gap-2" onSubmit={byNoForm.handleSubmit(lookupNo)}>
              <Field label="회원 번호" error={byNoForm.formState.errors.memberNo?.message}>
                <Input type="number" {...byNoForm.register("memberNo")} />
              </Field>
              <Button className="mt-6" variant="secondary" disabled={findByNo.isPending}>
                번호 조회
              </Button>
            </form>
            <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={(event) => event.preventDefault()}>
              <Field label="회원 ID" error={pointForm.formState.errors.memberId?.message}>
                <Input {...pointForm.register("memberId")} />
              </Field>
              <Field label="포인트" error={pointForm.formState.errors.point?.message}>
                <Input type="number" {...pointForm.register("point")} />
              </Field>
              <Button
                className="mt-6"
                type="button"
                variant="secondary"
                onClick={pointForm.handleSubmit((values) => changePoint(values, "save"))}
              >
                적립
              </Button>
              <Button
                className="mt-6"
                type="button"
                variant="secondary"
                onClick={pointForm.handleSubmit((values) => changePoint(values, "use"))}
              >
                사용
              </Button>
            </form>
          </div>
        </Panel>
      </div>

      <Panel title="Recent members" description="최근 등록/조회 회원 cache, 최대 50건">
        {members.length === 0 ? (
          <EmptyState message="아직 등록하거나 조회한 회원이 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">No</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th className="text-right">Point</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId} className="border-b border-slate-100">
                    <td className="py-2">{member.memberNo}</td>
                    <td>{member.memberId}</td>
                    <td>{member.name}</td>
                    <td>{member.email.value}</td>
                    <td>{member.authorities.join(", ")}</td>
                    <td className="text-right font-semibold">{member.point.value}</td>
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
