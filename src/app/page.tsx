"use client";

import Link from "next/link";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";
import { Panel } from "@shared/ui/panel";
import { StatusBadge } from "@shared/ui/status-badge";

const serviceCards = [
  { name: "rental-service", port: 8080, path: "/api/rental-cards" },
  { name: "book-service", port: 8081, path: "/api/book" },
  { name: "member-service", port: 8082, path: "/api/Member" },
  { name: "bestbook-service", port: 8084, path: "/api/books" },
];

const workflow = [
  "회원 등록",
  "도서 등록",
  "도서 AVAILABLE 변경",
  "대여카드 생성",
  "도서 대여 요청",
  "상태 refresh로 후속 이벤트 확인",
];

export default function DashboardPage() {
  const books = useRecentCacheStore((store) => store.books);
  const members = useRecentCacheStore((store) => store.members);

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-950">Library Rental EDA Test Console</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          백엔드 HTTP API와 Kafka 기반 비동기 흐름을 검증하는 개발자용 콘솔입니다. 202 Accepted
          응답은 최종 성공이 아니라 요청 접수이며, 각 서비스의 조회 API를 다시 호출해 후속 처리를
          확인합니다.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {serviceCards.map((service) => (
          <Panel key={service.name} title={service.name} description={service.path}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">localhost:{service.port}</span>
              <StatusBadge value="READY" />
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Quick workflow" description="첫 연동 테스트는 이 순서로 진행하세요.">
          <ol className="grid gap-3">
            {workflow.map((item, index) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white" href="/members">
              회원부터 시작
            </Link>
            <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium" href="/event-flow">
              이벤트 흐름 보기
            </Link>
          </div>
        </Panel>

        <Panel title="Recent cache" description="목록 API가 없는 리소스는 최근 등록/조회 cache로 표시합니다.">
          <div className="grid gap-3 text-sm">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">최근 도서</div>
              <div className="mt-1 text-xl font-semibold">{books.length}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-slate-500">최근 회원</div>
              <div className="mt-1 text-xl font-semibold">{members.length}</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
