"use client";

import {
  useBestBooks,
  useFindBestBookById,
  useRecordBestBookRent,
} from "@adapters/driving/bestbook/bestbook-hooks";
import { getErrorMessage } from "@adapters/driving/shared/error-message";
import { applyApiFieldErrors } from "@adapters/driving/shared/form-errors";
import { Button } from "@shared/ui/button";
import { Field, Input } from "@shared/ui/form-controls";
import { Panel } from "@shared/ui/panel";
import { EmptyState, ErrorPanel } from "@shared/ui/state";
import { useToast } from "@shared/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const recordSchema = z.object({
  itemNo: z.string().min(1, "도서 번호를 입력하세요."),
  itemTitle: z.string().min(1, "도서 제목을 입력하세요."),
});

const lookupSchema = z.object({
  id: z.string().min(1, "read model ID를 입력하세요."),
});

type RecordForm = z.infer<typeof recordSchema>;
type LookupForm = z.infer<typeof lookupSchema>;

export default function BestBooksPage() {
  const bestBooks = useBestBooks();
  const findById = useFindBestBookById();
  const recordRent = useRecordBestBookRent();
  const { notifySuccess, notifyError } = useToast();
  const recordForm = useForm<RecordForm>({ resolver: zodResolver(recordSchema) });
  const lookupForm = useForm<LookupForm>({ resolver: zodResolver(lookupSchema) });

  async function record(values: RecordForm) {
    try {
      await recordRent.mutateAsync({ ...values, itemNo: Number(values.itemNo) });
      notifySuccess("수동 인기 도서 집계가 반영되었습니다.");
      recordForm.reset();
    } catch (error) {
      if (!applyApiFieldErrors(error, recordForm.setError)) notifyError(getErrorMessage(error));
    }
  }

  async function lookup(values: LookupForm) {
    try {
      const found = await findById.mutateAsync(Number(values.id));
      notifySuccess(`${found.itemTitle} read model을 조회했습니다.`);
    } catch (error) {
      notifyError(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold">인기 도서</h1>
        <p className="mt-2 text-sm text-slate-600">
          bestbook-service의 MongoDB read model을 조회합니다. 대여 이벤트로 rentCount가 증가합니다.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="수동 집계 테스트" description="POST /api/books">
          <form className="grid gap-3" onSubmit={recordForm.handleSubmit(record)}>
            <Field label="도서 번호" error={recordForm.formState.errors.itemNo?.message}>
              <Input type="number" {...recordForm.register("itemNo")} />
            </Field>
            <Field label="도서 제목" error={recordForm.formState.errors.itemTitle?.message}>
              <Input {...recordForm.register("itemTitle")} />
            </Field>
            <Button disabled={recordRent.isPending}>집계 반영</Button>
          </form>
        </Panel>

        <Panel title="단건 조회" description="GET /api/books/{id}">
          <form className="flex gap-2" onSubmit={lookupForm.handleSubmit(lookup)}>
            <Field label="Read model ID" error={lookupForm.formState.errors.id?.message}>
              <Input type="number" {...lookupForm.register("id")} />
            </Field>
            <Button className="mt-6" variant="secondary" disabled={findById.isPending}>
              조회
            </Button>
          </form>
          {findById.data ? (
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
              {findById.data.itemTitle} / rentCount {findById.data.rentCount}
            </div>
          ) : null}
        </Panel>
      </div>

      <Panel title="Best book read model" description="GET /api/books">
        {bestBooks.isError ? <ErrorPanel message={getErrorMessage(bestBooks.error)} /> : null}
        {bestBooks.isLoading ? <EmptyState message="인기 도서 목록을 불러오는 중입니다." /> : null}
        {bestBooks.data && bestBooks.data.length === 0 ? (
          <EmptyState message="아직 인기 도서 집계가 없습니다." />
        ) : null}
        {bestBooks.data && bestBooks.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">ID</th>
                  <th>Item No</th>
                  <th>Title</th>
                  <th className="text-right">Rent Count</th>
                </tr>
              </thead>
              <tbody>
                {[...bestBooks.data]
                  .sort((a, b) => b.rentCount - a.rentCount)
                  .map((book) => (
                    <tr key={book.id} className="border-b border-slate-100">
                      <td className="py-2">{book.id}</td>
                      <td>{book.itemNo}</td>
                      <td>{book.itemTitle}</td>
                      <td className="text-right font-semibold">{book.rentCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
