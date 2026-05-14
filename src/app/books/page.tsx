"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { classifications } from "@domain/book/enums/classification";
import { locations } from "@domain/book/enums/location";
import { sources } from "@domain/book/enums/source";
import {
  useFindBook,
  useMakeBookAvailable,
  useMakeBookUnavailable,
  useRegisterBook,
} from "@adapters/driving/book/book-hooks";
import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Button } from "@shared/ui/button";
import { Field, Input, Select } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState } from "@shared/ui/state";
import { StatusBadge } from "@shared/ui/status-badge";
import { useToast } from "@shared/ui/toast";
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

type BookForm = z.infer<typeof bookSchema>;

const lookupSchema = z.object({
  no: z.string().min(1, "도서 번호를 입력하세요."),
});

type LookupForm = z.infer<typeof lookupSchema>;

export default function BooksPage() {
  const books = useRecentCacheStore((store) => store.books);
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

  async function submitBook(values: BookForm) {
    try {
      const created = await registerBook.mutateAsync(values);
      notifySuccess(`도서 ${created.no}번이 등록되었습니다.`);
      bookForm.reset({ ...values, title: "", isbn: "" });
    } catch (error) {
      if (!applyApiFieldErrors(error, bookForm.setError)) {
        notifyError(getErrorMessage(error));
      }
    }
  }

  async function lookup(values: LookupForm) {
    try {
      const found = await findBook.mutateAsync(Number(values.no));
      notifySuccess(`${found.no}번 도서를 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  async function changeStatus(no: number, next: "AVAILABLE" | "UNAVAILABLE") {
    try {
      if (next === "AVAILABLE") {
        await makeAvailable.mutateAsync(no);
      } else {
        await makeUnavailable.mutateAsync(no);
      }
      notifySuccess(`도서 ${no}번 상태를 ${next}로 변경했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold">도서 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          book-service API를 호출합니다. 전체 목록 API가 없으므로 최근 등록/조회한 도서만 테이블에 표시합니다.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="도서 등록" description="POST /api/book">
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
                      {source}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="분류" error={bookForm.formState.errors.classification?.message}>
                <Select {...bookForm.register("classification")}>
                  {classifications.map((classification) => (
                    <option key={classification} value={classification}>
                      {classification}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="소장 지점" error={bookForm.formState.errors.location?.message}>
                <Select {...bookForm.register("location")}>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="설명" error={bookForm.formState.errors.description?.message}>
              <Input {...bookForm.register("description")} />
            </Field>
            <Button disabled={registerBook.isPending}>등록</Button>
          </form>
        </Panel>

        <Panel title="도서 조회" description="GET /api/book/{no}">
          <form className="flex gap-2" onSubmit={lookupForm.handleSubmit(lookup)}>
            <Field label="도서 번호" error={lookupForm.formState.errors.no?.message}>
              <Input type="number" {...lookupForm.register("no")} />
            </Field>
            <Button className="mt-6" disabled={findBook.isPending}>
              조회
            </Button>
          </form>
        </Panel>
      </div>

      <Panel title="Recent books" description="최근 등록/조회 도서 cache, 최대 50건">
        {books.length === 0 ? (
          <EmptyState message="아직 등록하거나 조회한 도서가 없습니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">No</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.no} className="border-b border-slate-100">
                    <td className="py-2">{book.no}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <StatusBadge value={book.bookStatus} />
                    </td>
                    <td>{book.location}</td>
                    <td className="flex justify-end gap-2 py-2">
                      <Button variant="secondary" onClick={() => changeStatus(book.no, "AVAILABLE")}>
                        AVAILABLE
                      </Button>
                      <Button variant="secondary" onClick={() => changeStatus(book.no, "UNAVAILABLE")}>
                        UNAVAILABLE
                      </Button>
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
