"use client";

import {
  useBooks,
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
import { Button } from "@shared/ui/button";
import { Field, Input, Select, Textarea } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState, ErrorPanel } from "@shared/ui/state";
import { StatusBadge } from "@shared/ui/status-badge";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookMarked, BookPlus, CheckCircle2, RefreshCw, Search, Wrench } from "lucide-react";
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const allBooks = useBooks();
  const registerBook = useRegisterBook();
  const findBook = useFindBook();
  const makeAvailable = useMakeBookAvailable();
  const makeUnavailable = useMakeBookUnavailable();
  const { notifySuccess, notifyError } = useToast();
  const sortedBooks = [...(allBooks.data ?? [])].sort((a, b) => a.no - b.no);
  const availableCount = sortedBooks.filter((book) => book.bookStatus === "AVAILABLE").length;
  const enteredCount = sortedBooks.filter((book) => book.bookStatus === "ENTERED").length;
  const unavailableCount = sortedBooks.filter((book) => book.bookStatus === "UNAVAILABLE").length;

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
      <section className="rounded-md border border-emerald-100 bg-white px-5 py-4 shadow-sm shadow-stone-200/60">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">서가 관리</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">도서 관리</h1>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-4">
            <CatalogStat label="전체" value={sortedBooks.length} />
            <CatalogStat label="대여 가능" value={availableCount} />
            <CatalogStat label="입고" value={enteredCount} />
            <CatalogStat label="대여 불가" value={unavailableCount} />
          </div>
        </div>
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
              <div className="rounded-md border border-stone-200 bg-lime-50/50 p-4">
                <div className="grid gap-4 sm:grid-cols-[84px_1fr]">
                  <BookCover book={selectedBook} />
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-stone-950">
                          {selectedBook.title}
                        </div>
                        <div className="mt-1 text-sm text-stone-600">{selectedBook.author}</div>
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
                  </div>
                </div>
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
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

      <Panel title="전체 도서 목록">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-stone-600">
            총 <span className="font-semibold text-stone-950">{sortedBooks.length}</span>권
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={allBooks.isFetching}
            onClick={() => allBooks.refetch()}
          >
            <RefreshCw size={16} />
            새로고침
          </Button>
        </div>
        {allBooks.isError ? <ErrorPanel message={getErrorMessage(allBooks.error)} /> : null}
        {allBooks.isLoading ? <EmptyState message="전체 도서 목록을 불러오는 중입니다." /> : null}
        {sortedBooks.length === 0 && !allBooks.isLoading ? (
          <EmptyState message="등록된 도서가 없습니다." />
        ) : null}
        {sortedBooks.length > 0 ? <BookCatalog books={sortedBooks} onSelect={loadBook} /> : null}
      </Panel>
    </div>
  );
}

function CatalogStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-stone-200 bg-lime-50 px-3 py-2">
      <div className="text-xs font-medium text-stone-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-stone-950">{value.toLocaleString()}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-stone-500">{label}</span>
      <span className="text-right font-medium text-stone-950">{value}</span>
    </div>
  );
}

function BookCatalog({
  books,
  onSelect,
}: {
  books: Book[];
  onSelect: (book: Book) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {books.map((book) => (
        <button
          key={book.no}
          type="button"
          className="grid min-h-[236px] grid-cols-[82px_1fr] gap-3 rounded-md border border-stone-200 bg-white p-3 text-left shadow-sm shadow-stone-200/50 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
          onClick={() => onSelect(book)}
        >
          <BookCover book={book} />
          <span className="grid min-w-0 content-start gap-2">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-stone-950" title={book.title}>
                  {book.title}
                </span>
                <span className="mt-1 block truncate text-sm text-stone-600" title={book.author}>
                  {book.author}
                </span>
              </span>
              <StatusBadge value={book.bookStatus} />
            </span>
            <span className="grid gap-1 text-xs text-stone-600">
              <MetaLine label="번호" value={String(book.no)} />
              <MetaLine label="ISBN" value={book.isbn} />
              <MetaLine label="발행일" value={book.publicationDate} />
            </span>
            <span className="flex flex-wrap gap-1.5">
              <Chip>{sourceLabels[book.source]}</Chip>
              <Chip>{classificationLabels[book.classification]}</Chip>
              <Chip>{locationLabels[book.location]}</Chip>
            </span>
            <span className="line-clamp-3 text-xs leading-5 text-stone-500" title={book.description}>
              {book.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function BookCover({ book }: { book: Book }) {
  return (
    <span
      className={`flex aspect-[3/4] w-full flex-col justify-between rounded-md border p-2 shadow-inner ${coverTone(book.classification)}`}
    >
      <BookMarked size={18} />
      <span>
        <span className="block text-xs font-semibold opacity-70">#{book.no}</span>
        <span className="mt-1 block text-lg font-semibold leading-tight">
          {book.title.slice(0, 2)}
        </span>
      </span>
    </span>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex justify-between gap-2">
      <span className="shrink-0 text-stone-400">{label}</span>
      <span className="truncate font-medium text-stone-700">{value}</span>
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-stone-200 bg-lime-50 px-2 py-0.5 text-xs font-medium text-stone-700">
      {children}
    </span>
  );
}

function coverTone(classification: Book["classification"]) {
  const tones = {
    ARTS: "border-rose-200 bg-rose-100 text-rose-800",
    COMPUTER: "border-sky-200 bg-sky-100 text-sky-800",
    LITERATURE: "border-emerald-200 bg-emerald-100 text-emerald-800",
  } satisfies Record<Book["classification"], string>;

  return tones[classification];
}
