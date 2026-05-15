"use client";

import {
  useFindBook,
  useMakeBookAvailable,
  useMakeBookUnavailable,
  useRegisterBook,
} from "@adapters/driving/book/book-hooks";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import type { Book } from "@domain/book/entities/book";
import { classifications } from "@domain/book/enums/classification";
import { locations } from "@domain/book/enums/location";
import { sources } from "@domain/book/enums/source";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Button } from "@shared/ui/button";
import { Field, Input, Select, Textarea } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { StatusBadge } from "@shared/ui/status-badge";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookPlus, CheckCircle2, Search, Wrench } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요."),
  description: z.string().min(1, "설명을 입력하세요."),
  author: z.string().min(1, "저자를 입력하세요."),
  isbn: z.string().min(1, "ISBN을 입력하세요."),
  publicationDate: z.string().min(1, "발행일을 입력하세요."),
  source: z.enum(sources),
  classification: z.enum(classifications),
  location: z.enum(locations),
});

const lookupSchema = z.object({
  no: z.string().min(1, "도서 번호를 입력하세요."),
});

type BookForm = z.infer<typeof bookSchema>;
type LookupForm = z.infer<typeof lookupSchema>;

const classificationLabels = {
  ARTS: "예술",
  COMPUTER: "컴퓨터",
  LITERATURE: "문학",
} satisfies Record<(typeof classifications)[number], string>;

const locationLabels = {
  JEONGJA: "정자점",
  PANGYO: "판교점",
} satisfies Record<(typeof locations)[number], string>;

const sourceLabels = {
  DONATION: "기증",
  SUPPLY: "구입",
} satisfies Record<(typeof sources)[number], string>;

export default function BooksPage() {
  const books = useRecentCacheStore((store) => store.books);
  const touchedAt = useRecentCacheStore((store) => store.bookTouchedAtByNo ?? {});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const registerBook = useRegisterBook();
  const findBook = useFindBook();
  const makeAvailable = useMakeBookAvailable();
  const makeUnavailable = useMakeBookUnavailable();
  const { notifySuccess, notifyError } = useToast();

  const bookForm = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      isbn: "",
      publicationDate: new Date().toISOString().slice(0, 10),
      source: "SUPPLY",
      classification: "COMPUTER",
      location: "PANGYO",
    },
  });
  const lookupForm = useForm<LookupForm>({ resolver: zodResolver(lookupSchema) });

  function loadBook(book: Book) {
    setSelectedBook(book);
    lookupForm.setValue("no", String(book.no));
  }

  async function submitBook(values: BookForm) {
    try {
      const created = await registerBook.mutateAsync(values);
      loadBook(created);
      notifySuccess(`도서 ${created.no}번이 등록되었습니다.`);
      bookForm.reset({ ...values, title: "", isbn: "", description: "" });
    } catch (error) {
      if (!applyApiFieldErrors(error, bookForm.setError)) {
        notifyError(getErrorMessage(error));
      }
    }
  }

  async function lookup(values: LookupForm) {
    try {
      const found = await findBook.mutateAsync(Number(values.no));
      loadBook(found);
      notifySuccess(`${found.no}번 도서를 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function changeStatus(no: number, next: "AVAILABLE" | "UNAVAILABLE") {
    try {
      const updated =
        next === "AVAILABLE"
          ? await makeAvailable.mutateAsync(no)
          : await makeUnavailable.mutateAsync(no);
      loadBook(updated);
      notifySuccess(`도서 ${no}번 상태를 ${next}로 변경했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-slate-500">서가 관리</p>
        <h1 className="mt-1 text-2xl font-semibold">도서 관리</h1>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="도서 입고 등록">
          <form className="grid gap-3" onSubmit={bookForm.handleSubmit(submitBook)}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="제목" error={bookForm.formState.errors.title?.message}>
                <Input {...bookForm.register("title")} />
              </Field>
              <Field label="저자" error={bookForm.formState.errors.author?.message}>
                <Input {...bookForm.register("author")} />
              </Field>
              <Field label="ISBN" error={bookForm.formState.errors.isbn?.message}>
                <Input {...bookForm.register("isbn")} />
              </Field>
              <Field label="발행일" error={bookForm.formState.errors.publicationDate?.message}>
                <Input type="date" {...bookForm.register("publicationDate")} />
              </Field>
              <Field label="입수 경로" error={bookForm.formState.errors.source?.message}>
                <Select {...bookForm.register("source")}>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {sourceLabels[source]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="분류" error={bookForm.formState.errors.classification?.message}>
                <Select {...bookForm.register("classification")}>
                  {classifications.map((classification) => (
                    <option key={classification} value={classification}>
                      {classificationLabels[classification]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="소장 지점" error={bookForm.formState.errors.location?.message}>
                <Select {...bookForm.register("location")}>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {locationLabels[location]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="설명" error={bookForm.formState.errors.description?.message}>
              <Textarea {...bookForm.register("description")} />
            </Field>
            <Button disabled={registerBook.isPending}>
              <BookPlus size={16} />
              등록
            </Button>
          </form>
        </Panel>

        <Panel title="도서 조회">
          <div className="grid gap-4">
            <form
              className="grid gap-2 md:grid-cols-[1fr_auto]"
              onSubmit={lookupForm.handleSubmit(lookup)}
            >
              <Field label="도서 번호" error={lookupForm.formState.errors.no?.message}>
                <Input min={1} type="number" {...lookupForm.register("no")} />
              </Field>
              <Button className="mt-6" disabled={findBook.isPending}>
                <Search size={16} />
                조회
              </Button>
            </form>

            {selectedBook ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">{selectedBook.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{selectedBook.author}</div>
                  </div>
                  <StatusBadge value={selectedBook.bookStatus} />
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <InfoLine label="도서 번호" value={String(selectedBook.no)} />
                  <InfoLine label="ISBN" value={selectedBook.isbn} />
                  <InfoLine label="발행일" value={selectedBook.publicationDate} />
                  <InfoLine label="입수 경로" value={sourceLabels[selectedBook.source]} />
                  <InfoLine
                    label="분류"
                    value={classificationLabels[selectedBook.classification]}
                  />
                  <InfoLine label="소장 지점" value={locationLabels[selectedBook.location]} />
                  <InfoLine label="설명" value={selectedBook.description} />
                </div>
                <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  등록 직후 도서는 ENTERED 상태입니다. 대여하려면 AVAILABLE로 변경하세요.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedBook.bookStatus !== "AVAILABLE" ? (
                    <Button
                      variant="success"
                      onClick={() => changeStatus(selectedBook.no, "AVAILABLE")}
                    >
                      <CheckCircle2 size={16} />
                      대여 가능으로 변경
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() => changeStatus(selectedBook.no, "UNAVAILABLE")}
                    >
                      <Wrench size={16} />
                      대여 불가로 변경
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState message="도서 번호를 입력하고 조회하세요." />
            )}
          </div>
        </Panel>
      </div>

      <Panel title="최근 서가">
        {books.length === 0 ? (
          <EmptyState message="아직 등록하거나 조회한 도서가 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">번호</th>
                  <th>제목</th>
                  <th>저자</th>
                  <th>분류</th>
                  <th>소장</th>
                  <th>상태</th>
                  <th className="text-right">조회 시각</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr
                    key={book.no}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => loadBook(book)}
                  >
                    <td className="py-2">{book.no}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{classificationLabels[book.classification]}</td>
                    <td>{locationLabels[book.location]}</td>
                    <td>
                      <StatusBadge value={book.bookStatus} />
                    </td>
                    <td className="text-right text-slate-500">
                      {formatDateTime(touchedAt[book.no])}
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
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
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
