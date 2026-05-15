"use client";

import { useFindBook } from "@adapters/driving/book/book-hooks";
import { bestBookKeys } from "@adapters/driving/bestbook/bestbook-hooks";
import { useFindMemberById } from "@adapters/driving/member/member-hooks";
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
import type { Book } from "@domain/book/entities/book";
import type { Member } from "@domain/member/entities/member";
import type { RentItem } from "@domain/rental/entities/rent-item";
import type { RentalCard } from "@domain/rental/entities/rental-card";
import type { ReturnItem } from "@domain/rental/entities/return-item";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Button } from "@shared/ui/button";
import { Field, Input } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { StatusBadge } from "@shared/ui/status-badge";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const memberSchema = z.object({
  userId: z.string().min(1, "회원 ID를 입력하세요."),
  userNm: z.string().min(1, "회원 이름을 입력하세요."),
});

const memberLookupSchema = z.object({
  userId: z.string().min(1, "회원 ID를 입력하세요."),
  userNm: z.string().optional(),
});

const bookLookupSchema = z.object({
  bookNo: z.string().min(1, "도서 번호를 입력하세요."),
});

const itemSchema = memberSchema.extend({
  itemId: z.string().min(1, "도서 번호를 입력하세요."),
  itemTitle: z.string().min(1, "도서 제목을 입력하세요."),
});

const clearSchema = memberSchema.extend({
  point: z.string().min(1, "포인트를 입력하세요."),
});

type MemberLookupForm = z.infer<typeof memberLookupSchema>;
type BookLookupForm = z.infer<typeof bookLookupSchema>;
type MemberForm = z.infer<typeof memberSchema>;
type ItemForm = z.infer<typeof itemSchema>;
type ClearForm = z.infer<typeof clearSchema>;
type ListTab = "rent" | "return";
type WorkTab = "rent" | "clear";

export default function RentalPage() {
  const books = useRecentCacheStore((store) => store.books);
  const members = useRecentCacheStore((store) => store.members);
  const [card, setCard] = useState<RentalCard | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cardMissing, setCardMissing] = useState(false);
  const [acceptedMessage, setAcceptedMessage] = useState<string | null>(null);
  const [listTab, setListTab] = useState<ListTab>("rent");
  const [workTab, setWorkTab] = useState<WorkTab>("rent");
  const queryClient = useQueryClient();
  const createCard = useCreateRentalCard();
  const findCard = useFindRentalCard();
  const findBook = useFindBook();
  const findMember = useFindMemberById();
  const findRentItems = useFindRentItems();
  const findReturnItems = useFindReturnItems();
  const rentItem = useRentItem();
  const returnItem = useReturnItem();
  const overdueItem = useOverdueItem();
  const clearOverdue = useClearOverdue();
  const { notifySuccess, notifyError } = useToast();

  const memberLookupForm = useForm<MemberLookupForm>({
    resolver: zodResolver(memberLookupSchema),
    defaultValues: { userId: "", userNm: "" },
  });
  const bookLookupForm = useForm<BookLookupForm>({
    resolver: zodResolver(bookLookupSchema),
    defaultValues: { bookNo: "" },
  });
  const rentForm = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { userId: "", userNm: "", itemId: "", itemTitle: "" },
  });
  const clearForm = useForm<ClearForm>({
    resolver: zodResolver(clearSchema),
    defaultValues: { userId: "", userNm: "", point: "0" },
  });

  const lookupUserId = useWatch({ control: memberLookupForm.control, name: "userId" });
  const rentItemId = useWatch({ control: rentForm.control, name: "itemId" });
  const selectedMember = members.find((member) => member.memberId === lookupUserId);
  const selectedRecentBook = books.find((book) => book.no === Number(rentItemId));

  function fillMember(values: MemberForm) {
    memberLookupForm.setValue("userId", values.userId, { shouldValidate: true });
    memberLookupForm.setValue("userNm", values.userNm, { shouldValidate: true });
    rentForm.setValue("userId", values.userId, { shouldValidate: true });
    rentForm.setValue("userNm", values.userNm, { shouldValidate: true });
    clearForm.setValue("userId", values.userId, { shouldValidate: true });
    clearForm.setValue("userNm", values.userNm, { shouldValidate: true });
  }

  function fillBook(book: Pick<Book, "no" | "title">) {
    bookLookupForm.setValue("bookNo", String(book.no), { shouldValidate: true });
    rentForm.setValue("itemId", String(book.no), { shouldValidate: true });
    rentForm.setValue("itemTitle", book.title, { shouldValidate: true });
  }

  function selectMember(member: Member) {
    fillMember({ userId: member.memberId, userNm: member.name });
  }

  function selectBook(book: Book) {
    setSelectedBook(book);
    fillBook(book);
  }

  async function lookupCard(values: MemberLookupForm) {
    try {
      const result = await findCard.mutateAsync(values.userId);
      setCard(result);
      setCardMissing(false);
      fillMember({ userId: result.userId, userNm: result.userNm });
      clearForm.setValue("point", String(result.lateFee));
      notifySuccess(`${result.userNm} 회원의 대여카드를 조회했습니다.`);
    } catch (error) {
      const cachedName = selectedMember?.name ?? values.userNm ?? "";
      memberLookupForm.setValue("userNm", cachedName);
      setCard(null);
      setCardMissing(true);
      notifyError(getErrorMessage(error));
    }
  }

  async function prepareCard() {
    const valid = await memberLookupForm.trigger(["userId", "userNm"]);
    if (!valid) return;
    const values = memberLookupForm.getValues();
    if (!values.userNm) {
      memberLookupForm.setError("userNm", { message: "카드 준비를 위해 회원 이름이 필요합니다." });
      return;
    }
    try {
      const result = await createCard.mutateAsync({ userId: values.userId, userNm: values.userNm });
      setCard(result);
      setCardMissing(false);
      fillMember({ userId: result.userId, userNm: result.userNm });
      notifySuccess(`${result.userNm} 회원의 대여카드를 준비했습니다.`);
    } catch (error) {
      if (!applyApiFieldErrors(error, memberLookupForm.setError))
        notifyError(getErrorMessage(error));
    }
  }

  async function lookupBook(values: BookLookupForm) {
    try {
      const found = await findBook.mutateAsync(Number(values.bookNo));
      setSelectedBook(found);
      fillBook(found);
      notifySuccess(`${found.title} 도서를 확인했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function submitRent(values: ItemForm) {
    try {
      const result = await rentItem.mutateAsync({ ...values, itemId: Number(values.itemId) });
      setCard(result);
      setAcceptedMessage(result.message);
      notifySuccess(`${values.itemTitle} 대여 요청을 접수했습니다.`);
    } catch (error) {
      if (!applyApiFieldErrors(error, rentForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function submitRowAction(item: RentItem, action: "return" | "overdue") {
    if (!card) return;
    const command = {
      userId: card.userId,
      userNm: card.userNm,
      itemId: item.itemId,
      itemTitle: item.itemTitle,
    };
    try {
      if (action === "return") {
        const result = await returnItem.mutateAsync(command);
        setCard(result);
        setAcceptedMessage(result.message);
        notifySuccess(`${item.itemTitle} 반납 요청을 접수했습니다.`);
      } else {
        const result = await overdueItem.mutateAsync(command);
        setCard(result);
        setAcceptedMessage(null);
        notifySuccess(`${item.itemTitle} 도서를 연체 표시했습니다.`);
      }
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function clear(values: ClearForm) {
    try {
      const result = await clearOverdue.mutateAsync({ ...values, point: Number(values.point) });
      setCard(result);
      setAcceptedMessage(result.message);
      notifySuccess("연체료 정산 요청을 접수했습니다.");
    } catch (error) {
      if (!applyApiFieldErrors(error, clearForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function refreshRentalCard() {
    const userId = card?.userId ?? memberLookupForm.getValues("userId");
    if (!userId) {
      notifyError("먼저 회원을 선택하세요.");
      return;
    }
    try {
      const result = await findCard.mutateAsync(userId);
      setCard(result);
      fillMember({ userId: result.userId, userNm: result.userNm });
      notifySuccess("대여카드를 새로고침했습니다.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function refreshBook() {
    const itemNo = Number(bookLookupForm.getValues("bookNo") || rentForm.getValues("itemId"));
    if (!itemNo) {
      notifyError("먼저 도서를 선택하세요.");
      return;
    }
    try {
      const found = await findBook.mutateAsync(itemNo);
      setSelectedBook(found);
      fillBook(found);
      notifySuccess("도서를 새로고침했습니다.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function refreshMember() {
    const userId = memberLookupForm.getValues("userId");
    if (!userId) {
      notifyError("먼저 회원을 선택하세요.");
      return;
    }
    try {
      const found = await findMember.mutateAsync(userId);
      fillMember({ userId: found.memberId, userNm: found.name });
      notifySuccess("회원을 새로고침했습니다.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function refreshItems(kind: ListTab) {
    if (!card) {
      notifyError("먼저 대여카드를 조회하세요.");
      return;
    }
    try {
      if (kind === "rent") {
        const rentItems = await findRentItems.mutateAsync(card.userId);
        setCard({ ...card, rentItems });
      } else {
        const returnItems = await findReturnItems.mutateAsync(card.userId);
        setCard({ ...card, returnItems });
      }
      notifySuccess("대여카드 목록을 새로고침했습니다.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-slate-500">핵심 업무 화면</p>
        <h1 className="mt-1 text-2xl font-semibold">대여 창구</h1>
      </section>

      <Panel title="업무 대상 선택">
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="grid gap-3">
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={memberLookupForm.handleSubmit(lookupCard)}
            >
              <Field label="회원 ID" error={memberLookupForm.formState.errors.userId?.message}>
                <Input {...memberLookupForm.register("userId")} />
              </Field>
              <Button className="mt-6" disabled={findCard.isPending}>
                <Search size={16} />
                카드 조회
              </Button>
            </form>
            {card ? (
              <TargetCard>
                <div>
                  <div className="font-semibold">{card.userNm}</div>
                  <div className="text-sm text-slate-500">{card.userId}</div>
                </div>
                <StatusBadge value={card.rentStatus} />
                <div className="text-sm text-slate-600">
                  연체료 {card.lateFee.toLocaleString()}점
                </div>
              </TargetCard>
            ) : (
              <TargetCard>
                <div className="font-semibold">카드 없음</div>
                <div className="text-sm text-slate-500">회원 ID로 카드를 조회하세요.</div>
                {cardMissing ? (
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                    <Field
                      label="회원 이름"
                      error={memberLookupForm.formState.errors.userNm?.message}
                    >
                      <Input {...memberLookupForm.register("userNm")} />
                    </Field>
                    <Button className="mt-6" type="button" onClick={prepareCard}>
                      <CreditCard size={16} />
                      카드 준비
                    </Button>
                  </div>
                ) : null}
              </TargetCard>
            )}
            {members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {members.slice(0, 4).map((member) => (
                  <button
                    key={member.memberId}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50"
                    type="button"
                    onClick={() => selectMember(member)}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={bookLookupForm.handleSubmit(lookupBook)}
            >
              <Field label="도서 번호" error={bookLookupForm.formState.errors.bookNo?.message}>
                <Input min={1} type="number" {...bookLookupForm.register("bookNo")} />
              </Field>
              <Button className="mt-6" disabled={findBook.isPending}>
                <Search size={16} />
                도서 확인
              </Button>
            </form>
            {selectedBook ? (
              <TargetCard>
                <div>
                  <div className="font-semibold">{selectedBook.title}</div>
                  <div className="text-sm text-slate-500">
                    #{selectedBook.no} · {selectedBook.author}
                  </div>
                </div>
                <StatusBadge value={selectedBook.bookStatus} />
              </TargetCard>
            ) : (
              <TargetCard>
                <div className="font-semibold">선택된 도서 없음</div>
                <div className="text-sm text-slate-500">
                  도서 번호로 확인하거나 최근 도서를 선택하세요.
                </div>
              </TargetCard>
            )}
            {books.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {books.slice(0, 4).map((book) => (
                  <button
                    key={book.no}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
                    type="button"
                    disabled={book.bookStatus !== "AVAILABLE"}
                    onClick={() => selectBook(book)}
                  >
                    {book.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,60fr)_minmax(360px,40fr)]">
        <Panel title="대여카드 상태">
          {!card ? (
            <EmptyState message="회원 카드를 조회하거나 준비하면 대여 상태가 표시됩니다." />
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoBox label="대여 상태" value={<StatusBadge value={card.rentStatus} />} />
                <InfoBox label="연체료" value={`${card.lateFee.toLocaleString()}점`} />
                <InfoBox label="대여 중" value={`${card.rentItems.length}권`} />
              </div>
              <div className="inline-flex w-fit rounded-md border border-slate-300 bg-white p-1">
                <TabButton active={listTab === "rent"} onClick={() => setListTab("rent")}>
                  대여 중 ({card.rentItems.length})
                </TabButton>
                <TabButton active={listTab === "return"} onClick={() => setListTab("return")}>
                  반납 완료 ({card.returnItems.length})
                </TabButton>
              </div>
              {listTab === "rent" ? (
                <RentTable items={card.rentItems} onAction={submitRowAction} />
              ) : (
                <ReturnTable items={card.returnItems} />
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => refreshItems("rent")}>
                  <RefreshCw size={16} />
                  대여 중 새로고침
                </Button>
                <Button type="button" variant="secondary" onClick={() => refreshItems("return")}>
                  <RefreshCw size={16} />
                  반납 완료 새로고침
                </Button>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="업무 처리">
          <div className="grid gap-4">
            <div className="inline-flex w-fit rounded-md border border-slate-300 bg-white p-1">
              <TabButton active={workTab === "rent"} onClick={() => setWorkTab("rent")}>
                대여 접수
              </TabButton>
              <TabButton active={workTab === "clear"} onClick={() => setWorkTab("clear")}>
                연체료 정산
              </TabButton>
            </div>

            {workTab === "rent" ? (
              <form className="grid gap-3" onSubmit={rentForm.handleSubmit(submitRent)}>
                <Field label="회원 ID" error={rentForm.formState.errors.userId?.message}>
                  <Input {...rentForm.register("userId")} />
                </Field>
                <Field label="회원 이름" error={rentForm.formState.errors.userNm?.message}>
                  <Input {...rentForm.register("userNm")} />
                </Field>
                <Field label="도서 번호" error={rentForm.formState.errors.itemId?.message}>
                  <Input min={1} type="number" {...rentForm.register("itemId")} />
                </Field>
                <Field label="도서 제목" error={rentForm.formState.errors.itemTitle?.message}>
                  <Input {...rentForm.register("itemTitle")} />
                </Field>
                {selectedRecentBook?.bookStatus && selectedRecentBook.bookStatus !== "AVAILABLE" ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    선택한 도서는 현재 {selectedRecentBook.bookStatus} 상태입니다.
                  </div>
                ) : null}
                <Button variant="success" disabled={rentItem.isPending}>
                  <BookOpenCheck size={16} />
                  대여 접수
                </Button>
              </form>
            ) : (
              <form className="grid gap-3" onSubmit={clearForm.handleSubmit(clear)}>
                <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  현재 연체료:{" "}
                  <span className="font-semibold">{card?.lateFee.toLocaleString() ?? 0}점</span>
                </div>
                <Field label="회원 ID" error={clearForm.formState.errors.userId?.message}>
                  <Input {...clearForm.register("userId")} />
                </Field>
                <Field label="회원 이름" error={clearForm.formState.errors.userNm?.message}>
                  <Input {...clearForm.register("userNm")} />
                </Field>
                <Field label="정산 포인트" error={clearForm.formState.errors.point?.message}>
                  <Input min={0} type="number" {...clearForm.register("point")} />
                </Field>
                <Button disabled={clearOverdue.isPending}>
                  <CheckCircle2 size={16} />
                  정산 접수
                </Button>
              </form>
            )}

            {acceptedMessage ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="font-medium">요청 접수됨</div>
                <p className="mt-1">
                  {acceptedMessage} 관련 조회를 새로고침해 후속 처리를 확인하세요.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={refreshRentalCard}>
                    대여카드 새로고침
                  </Button>
                  <Button type="button" variant="secondary" onClick={refreshBook}>
                    도서 새로고침
                  </Button>
                  <Button type="button" variant="secondary" onClick={refreshMember}>
                    회원 새로고침
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => queryClient.invalidateQueries({ queryKey: bestBookKeys.list })}
                  >
                    인기 도서 새로고침
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TargetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4">{children}</div>
  );
}

function InfoBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded px-3 py-1.5 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RentTable({
  items,
  onAction,
}: {
  items: RentItem[];
  onAction: (item: RentItem, action: "return" | "overdue") => void;
}) {
  if (items.length === 0) {
    return <EmptyState message="대여 중인 도서가 없습니다." />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">도서번호</th>
            <th>제목</th>
            <th>대여일</th>
            <th>반납예정일</th>
            <th>연체여부</th>
            <th className="text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={`${item.itemId}-${item.itemTitle}`}
              className={`border-b border-slate-100 ${item.overdue ? "bg-amber-50" : ""}`}
            >
              <td className="px-3 py-2">{item.itemId}</td>
              <td>{item.itemTitle}</td>
              <td>{item.rentDate}</td>
              <td>{item.overdueDate}</td>
              <td>
                <StatusBadge value={item.overdue ? "OVERDUE" : "정상"} />
              </td>
              <td className="flex justify-end gap-2 px-3 py-2">
                <Button type="button" variant="secondary" onClick={() => onAction(item, "return")}>
                  <RotateCcw size={16} />
                  반납 접수
                </Button>
                <Button type="button" variant="danger" onClick={() => onAction(item, "overdue")}>
                  <Clock size={16} />
                  연체 표시
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReturnTable({ items }: { items: ReturnItem[] }) {
  if (items.length === 0) {
    return <EmptyState message="반납 완료 도서가 없습니다." />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">도서번호</th>
            <th>제목</th>
            <th>대여일</th>
            <th>반납일</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.itemId}-${item.returnDate}`} className="border-b border-slate-100">
              <td className="px-3 py-2">{item.itemId}</td>
              <td>{item.itemTitle}</td>
              <td>{item.rentDate}</td>
              <td>{item.returnDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
