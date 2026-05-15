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
import { Search, TrendingUp } from "lucide-react";
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
  const rankedBooks = [...(bestBooks.data ?? [])].sort((a, b) => b.rentCount - a.rentCount);

  async function record(values: RecordForm) {
    try {
      await recordRent.mutateAsync({ ...values, itemNo: Number(values.itemNo) });
      notifySuccess("집계가 반영되었습니다.");
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
        <p className="text-sm font-medium text-slate-500">인기 도서</p>
        <h1 className="mt-1 text-2xl font-semibold">인기 도서 집계</h1>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="인기 도서 순위">
          {bestBooks.isError ? <ErrorPanel message={getErrorMessage(bestBooks.error)} /> : null}
          {bestBooks.isLoading ? (
            <EmptyState message="인기 도서 목록을 불러오는 중입니다." />
          ) : null}
          {rankedBooks.length === 0 && !bestBooks.isLoading ? (
            <EmptyState message="아직 대여 이벤트가 발생하지 않았습니다." />
          ) : null}
          {rankedBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">순위</th>
                    <th>도서번호</th>
                    <th>도서제목</th>
                    <th className="text-right">대여횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedBooks.map((book, index) => (
                    <tr key={book.id} className="border-b border-slate-100">
                      <td className="py-2 font-semibold">{index + 1}</td>
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

        <aside className="grid content-start gap-4">
          <Panel title="Read Model 조회">
            <form className="grid gap-3" onSubmit={lookupForm.handleSubmit(lookup)}>
              <Field label="ID" error={lookupForm.formState.errors.id?.message}>
                <Input min={1} type="number" {...lookupForm.register("id")} />
              </Field>
              <Button variant="secondary" disabled={findById.isPending}>
                <Search size={16} />
                조회
              </Button>
            </form>
            {findById.data ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="font-semibold text-slate-950">{findById.data.itemTitle}</div>
                <div className="mt-1 text-slate-600">도서번호 {findById.data.itemNo}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {findById.data.rentCount.toLocaleString()}회
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel title="집계 보정">
            <form className="grid gap-3" onSubmit={recordForm.handleSubmit(record)}>
              <Field label="도서번호" error={recordForm.formState.errors.itemNo?.message}>
                <Input min={1} type="number" {...recordForm.register("itemNo")} />
              </Field>
              <Field label="도서제목" error={recordForm.formState.errors.itemTitle?.message}>
                <Input {...recordForm.register("itemTitle")} />
              </Field>
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                수동 테스트용입니다. 실제 대여 없이 rentCount를 증가시킵니다.
              </div>
              <Button disabled={recordRent.isPending}>
                <TrendingUp size={16} />
                집계 반영
              </Button>
            </form>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
