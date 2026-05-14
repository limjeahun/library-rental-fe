"use client";

import {
  useClearOverdue,
  useCreateRentalCard,
  useFindRentalCard,
  useFindRentItems,
  useFindReturnItems,
  useOverdueItem,
  useRentItem,
  useReturnItem,
} from "@adapters/driving/rental/rental-hooks";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import type { RentalCard } from "@domain/rental/entities/rental-card";
import { Button } from "@shared/ui/button";
import { Field, Input } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { StatusBadge } from "@shared/ui/status-badge";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const memberSchema = z.object({
  userId: z.string().min(1, "회원 ID를 입력하세요."),
  userNm: z.string().min(1, "회원 이름을 입력하세요."),
});

const itemSchema = memberSchema.extend({
  itemId: z.string().min(1, "도서 번호를 입력하세요."),
  itemTitle: z.string().min(1, "도서 제목을 입력하세요."),
});

const clearSchema = memberSchema.extend({
  point: z.string().min(1, "포인트를 입력하세요."),
});

type MemberForm = z.infer<typeof memberSchema>;
type ItemForm = z.infer<typeof itemSchema>;
type ClearForm = z.infer<typeof clearSchema>;

export default function RentalPage() {
  const [card, setCard] = useState<RentalCard | null>(null);
  const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null);
  const createCard = useCreateRentalCard();
  const findCard = useFindRentalCard();
  const findRentItems = useFindRentItems();
  const findReturnItems = useFindReturnItems();
  const rentItem = useRentItem();
  const returnItem = useReturnItem();
  const overdueItem = useOverdueItem();
  const clearOverdue = useClearOverdue();
  const { notifySuccess, notifyError } = useToast();

  const cardForm = useForm<MemberForm>({ resolver: zodResolver(memberSchema) });
  const itemForm = useForm<ItemForm>({ resolver: zodResolver(itemSchema) });
  const clearForm = useForm<ClearForm>({ resolver: zodResolver(clearSchema) });

  async function create(values: MemberForm) {
    try {
      const result = await createCard.mutateAsync(values);
      setCard(result);
      notifySuccess("대여카드를 생성하거나 조회했습니다.");
    } catch (error) {
      if (!applyApiFieldErrors(error, cardForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function lookup(values: MemberForm) {
    try {
      const result = await findCard.mutateAsync(values.userId);
      setCard(result);
      notifySuccess("대여카드를 조회했습니다.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function submitItem(values: ItemForm, action: "rent" | "return" | "overdue") {
    try {
      if (action === "rent") {
        const result = await rentItem.mutateAsync({ ...values, itemId: Number(values.itemId) });
        setCard(result);
        setAcceptedMessage(result.message);
      }
      if (action === "return") {
        const result = await returnItem.mutateAsync({ ...values, itemId: Number(values.itemId) });
        setCard(result);
        setAcceptedMessage(result.message);
      }
      if (action === "overdue") {
        setCard(await overdueItem.mutateAsync({ ...values, itemId: Number(values.itemId) }));
        setAcceptedMessage(null);
      }
      notifySuccess("요청이 처리되었습니다. 관련 조회를 새로고침해 후속 처리 결과를 확인하세요.");
    } catch (error) {
      if (!applyApiFieldErrors(error, itemForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function clear(values: ClearForm) {
    try {
      const result = await clearOverdue.mutateAsync({ ...values, point: Number(values.point) });
      setCard(result);
      setAcceptedMessage(result.message);
      notifySuccess("연체료 정산 요청이 접수되었습니다.");
    } catch (error) {
      if (!applyApiFieldErrors(error, clearForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function refreshItems(kind: "rent" | "return") {
    if (!card) {
      notifyError("먼저 대여카드를 조회하세요.");
      return;
    }
    try {
      if (kind === "rent") {
        const rentItems = await findRentItems.mutateAsync(card.userId);
        setCard({ ...card, rentItems });
        notifySuccess("대여 중 도서 목록을 새로고침했습니다.");
      } else {
        const returnItems = await findReturnItems.mutateAsync(card.userId);
        setCard({ ...card, returnItems });
        notifySuccess("반납 완료 도서 목록을 새로고침했습니다.");
      }
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold">대여 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          rental-service의 대여카드, 대여, 반납, 연체, 연체료 정산 API를 실행합니다. 대여/반납/정산은
          비동기 EDA 흐름을 시작합니다.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="대여카드 생성 / 조회" description="POST, GET /api/rental-cards">
          <form className="grid gap-3" onSubmit={cardForm.handleSubmit(create)}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="회원 ID" error={cardForm.formState.errors.userId?.message}>
                <Input {...cardForm.register("userId")} />
              </Field>
              <Field label="회원 이름" error={cardForm.formState.errors.userNm?.message}>
                <Input {...cardForm.register("userNm")} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Button disabled={createCard.isPending}>생성</Button>
              <Button
                type="button"
                variant="secondary"
                disabled={findCard.isPending}
                onClick={cardForm.handleSubmit(lookup)}
              >
                조회
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="대여 / 반납 / 연체" description="POST /rent, /return, /overdue">
          <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="회원 ID" error={itemForm.formState.errors.userId?.message}>
                <Input {...itemForm.register("userId")} />
              </Field>
              <Field label="회원 이름" error={itemForm.formState.errors.userNm?.message}>
                <Input {...itemForm.register("userNm")} />
              </Field>
              <Field label="도서 번호" error={itemForm.formState.errors.itemId?.message}>
                <Input type="number" {...itemForm.register("itemId")} />
              </Field>
              <Field label="도서 제목" error={itemForm.formState.errors.itemTitle?.message}>
                <Input {...itemForm.register("itemTitle")} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={itemForm.handleSubmit((values) => submitItem(values, "rent"))}>
                대여 요청
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={itemForm.handleSubmit((values) => submitItem(values, "return"))}
              >
                반납 요청
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={itemForm.handleSubmit((values) => submitItem(values, "overdue"))}
              >
                연체 표시
              </Button>
            </div>
          </form>
        </Panel>
      </div>

      <Panel title="연체료 정산" description="POST /api/rental-cards/clear-overdue">
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={clearForm.handleSubmit(clear)}>
          <Field label="회원 ID" error={clearForm.formState.errors.userId?.message}>
            <Input {...clearForm.register("userId")} />
          </Field>
          <Field label="회원 이름" error={clearForm.formState.errors.userNm?.message}>
            <Input {...clearForm.register("userNm")} />
          </Field>
          <Field label="정산 포인트" error={clearForm.formState.errors.point?.message}>
            <Input type="number" {...clearForm.register("point")} />
          </Field>
          <Button className="mt-6" disabled={clearOverdue.isPending}>
            정산 요청
          </Button>
        </form>
      </Panel>

      {acceptedMessage ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {acceptedMessage} 후속 이벤트 처리 결과는 관련 서비스 조회로 확인하세요.
        </div>
      ) : null}

      <Panel title="대여카드 상태" description="최신 응답 기준입니다. 후속 이벤트 처리는 refresh로 확인하세요.">
        {!card ? (
          <EmptyState message="대여카드를 생성하거나 조회하면 이곳에 표시됩니다." />
        ) : (
          <div className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-5">
              <Info label="Card No" value={card.rentalCardNo} />
              <Info label="Member" value={`${card.userId} / ${card.userNm}`} />
              <Info label="Status" value={<StatusBadge value={card.rentStatus} />} />
              <Info label="Late fee" value={card.lateFee.toString()} />
              <Info label="Rent items" value={card.rentItems.length.toString()} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => refreshItems("rent")}>
                대여 목록 새로고침
              </Button>
              <Button variant="secondary" onClick={() => refreshItems("return")}>
                반납 목록 새로고침
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ItemTable title="대여 중 도서" items={card.rentItems} kind="rent" />
              <ItemTable title="반납 완료 도서" items={card.returnItems} kind="return" />
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function ItemTable({
  title,
  items,
  kind,
}: {
  title: string;
  items: Array<Record<string, unknown>>;
  kind: "rent" | "return";
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <EmptyState message="표시할 도서가 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th>Title</th>
                <th>Date</th>
                {kind === "rent" ? <th>Overdue</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.itemId}-${item.itemTitle}`} className="border-b border-slate-100">
                  <td className="px-3 py-2">{String(item.itemId)}</td>
                  <td>{String(item.itemTitle)}</td>
                  <td>{String(kind === "rent" ? item.rentDate : item.returnDate)}</td>
                  {kind === "rent" ? <td>{item.overdue ? "Y" : "N"}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
