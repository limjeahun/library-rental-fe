"use client";

import { useBestBooks } from "@adapters/driving/bestbook/bestbook-hooks";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Panel } from "@shared/ui/panel";
import { BookOpen, ChartBar, IdCard, Library, MoveRight } from "lucide-react";
import Link from "next/link";

const workflow = [
  {
    title: "회원 접수",
    description: "신규 회원 등록과 포인트 확인",
    href: "/members",
    icon: IdCard,
  },
  {
    title: "도서 입고",
    description: "서지 정보 등록과 상태 전환",
    href: "/books",
    icon: BookOpen,
  },
  {
    title: "대여 처리",
    description: "대여카드 기준 대출/반납 처리",
    href: "/rental",
    icon: Library,
  },
  {
    title: "인기 도서 확인",
    description: "대여 이벤트 기반 순위 확인",
    href: "/bestbooks",
    icon: ChartBar,
  },
];

export default function DashboardPage() {
  const books = useRecentCacheStore((store) => store.books);
  const members = useRecentCacheStore((store) => store.members);
  const apiLogs = useRecentCacheStore((store) => store.apiLogs ?? []);
  const bestBooks = useBestBooks();
  const topBooks = [...(bestBooks.data ?? [])]
    .sort((a, b) => b.rentCount - a.rentCount)
    .slice(0, 3);
  const latestMember = members[0];
  const latestBook = books[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
      <section className="grid gap-6">
        <div>
          <p className="text-sm font-medium text-slate-500">업무 시작 화면</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">오늘의 업무</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.href} className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-400">{index + 1}</span>
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-1 min-h-10 text-sm text-slate-600">{item.description}</p>
                <Link
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-950"
                  href={item.href}
                >
                  이동
                  <MoveRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>

        <Panel
          title="최근 API 요청 로그"
          description="이 브라우저에서 실행한 최근 요청 10건입니다."
        >
          {apiLogs.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              아직 기록된 API 요청이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">시간</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500">{formatTime(log.timestamp)}</td>
                      <td className="font-medium">{log.method}</td>
                      <td className="font-mono text-xs text-slate-700">{log.path}</td>
                      <td className="text-right">
                        <span className={statusTone(log.status)}>{log.status || "ERR"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>

      <aside className="grid content-start gap-4">
        <Panel title="빠른 현황">
          <div className="grid gap-3 text-sm">
            <QuickStat label="최근 회원" value={`${members.length}명`} />
            <QuickStat label="최근 도서" value={`${books.length}권`} />
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">인기 도서 Top 3</div>
              {bestBooks.isLoading ? <div className="mt-2 text-slate-500">불러오는 중</div> : null}
              {topBooks.length === 0 && !bestBooks.isLoading ? (
                <div className="mt-2 text-slate-500">아직 집계 없음</div>
              ) : (
                <ol className="mt-2 grid gap-2">
                  {topBooks.map((book, index) => (
                    <li key={book.id} className="flex items-center justify-between gap-3">
                      <span className="truncate">
                        {index + 1}. {book.itemTitle}
                      </span>
                      <span className="font-semibold">{book.rentCount}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="오늘의 작업대">
          <div className="grid gap-3 text-sm">
            <WorkbenchLink
              href="/members"
              label="마지막 회원"
              value={latestMember ? `${latestMember.name} (${latestMember.memberId})` : "아직 없음"}
            />
            <WorkbenchLink
              href="/books"
              label="마지막 도서"
              value={latestBook ? `${latestBook.title} #${latestBook.no}` : "아직 없음"}
            />
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-slate-50 p-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-lg font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function WorkbenchLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50" href={href}>
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 truncate font-semibold text-slate-950">{value}</div>
    </Link>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function statusTone(status: number) {
  if (status >= 200 && status < 300) {
    return "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700";
  }
  if (status >= 400 || status === 0) {
    return "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700";
  }
  return "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700";
}
