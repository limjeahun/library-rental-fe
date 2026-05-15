"use client";

import { useTopicFlows } from "@adapters/driving/event-flow/event-flow-hooks";
import { Panel } from "@shared/ui/panel";

const timeline = [
  {
    title: "도서 대여",
    steps: [
      {
        api: "POST /api/rental-cards/rent",
        event: "ItemRented",
        consumer: "rental-service producer",
      },
      { api: "-", event: "ItemRented", consumer: "book-service consumer" },
      { api: "-", event: "ItemRented", consumer: "member-service, bestbook-service consumer" },
      {
        api: "GET /api/rental-cards/{memberId}",
        event: "EventResult",
        consumer: "rental-service consumer",
      },
    ],
  },
  {
    title: "도서 반납",
    steps: [
      {
        api: "POST /api/rental-cards/return",
        event: "ItemReturned",
        consumer: "rental-service producer",
      },
      { api: "-", event: "ItemReturned", consumer: "book-service consumer" },
      { api: "-", event: "ItemReturned", consumer: "member-service consumer" },
      {
        api: "GET /api/rental-cards/{memberId}",
        event: "EventResult",
        consumer: "rental-service consumer",
      },
    ],
  },
  {
    title: "연체료 정산",
    steps: [
      {
        api: "POST /api/rental-cards/clear-overdue",
        event: "OverdueCleared",
        consumer: "rental-service producer",
      },
      { api: "-", event: "OverdueCleared", consumer: "member-service consumer" },
      {
        api: "GET /api/Member/{memberId}",
        event: "PointUseCommand",
        consumer: "member-service consumer",
      },
      {
        api: "GET /api/rental-cards/{memberId}",
        event: "EventResult",
        consumer: "rental-service consumer",
      },
    ],
  },
];

export default function EventFlowPage() {
  const flows = useTopicFlows();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm font-medium text-slate-500">정적 참조</p>
        <h1 className="mt-1 text-2xl font-semibold">Kafka Event Flow</h1>
        <p className="mt-2 text-sm text-slate-600">
          프론트는 Kafka를 직접 구독하지 않습니다. 이 화면은 API 호출 후 기대되는 producer/consumer
          흐름을 설명하고, 관련 조회 화면으로 검증하도록 돕습니다.
        </p>
      </section>

      <Panel title="Topic producer/consumer map">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Topic</th>
                <th>Message</th>
                <th>Producer</th>
                <th>Consumer</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {flows.map((flow) => (
                <tr key={flow.topic} className="border-b border-slate-100 align-top">
                  <td className="py-3 font-semibold">{flow.topic}</td>
                  <td>{flow.messageType}</td>
                  <td>{flow.producers.join(", ")}</td>
                  <td>
                    <ul className="grid gap-1">
                      {flow.consumers.map((consumer) => (
                        <li key={consumer}>{consumer}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{flow.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {timeline.map((flow) => (
          <Panel key={flow.title} title={flow.title}>
            <ol className="grid gap-3">
              {flow.steps.map((step, index) => (
                <li key={`${flow.title}-${index}`} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-slate-950">{step.event}</div>
                    <div className="mt-1 text-slate-600">{step.api}</div>
                    <div className="mt-1 text-xs text-slate-500">{step.consumer}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        ))}
      </div>
    </div>
  );
}
