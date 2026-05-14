import type { TopicFlow } from "@domain/event-flow/entities/topic-flow";

const topicFlows: TopicFlow[] = [
  {
    topic: "rental_rent",
    messageType: "ItemRented",
    producers: ["rental-service RentalKafkaEventProducer#publishRentalEvent"],
    consumers: [
      "book-service BookEventConsumer#consumeRent",
      "member-service MemberEventConsumer#consumeRent",
      "bestbook-service BestBookEventConsumer#consumeRent",
    ],
    meaning: "도서 대여 요청 후 도서 상태 변경, 회원 포인트 적립, 인기 도서 집계가 이어집니다.",
  },
  {
    topic: "rental_return",
    messageType: "ItemReturned",
    producers: ["rental-service RentalKafkaEventProducer#publishReturnEvent"],
    consumers: [
      "book-service BookEventConsumer#consumeReturn",
      "member-service MemberEventConsumer#consumeReturn",
    ],
    meaning: "도서 반납 요청 후 도서 상태 복구와 회원 포인트 적립이 이어집니다.",
  },
  {
    topic: "overdue_clear",
    messageType: "OverdueCleared",
    producers: ["rental-service RentalKafkaEventProducer#publishOverdueClearEvent"],
    consumers: ["member-service MemberEventConsumer#consumeClear"],
    meaning: "연체료 정산 요청 후 회원 포인트 차감이 이어집니다.",
  },
  {
    topic: "rental_result",
    messageType: "EventResult",
    producers: [
      "book-service BookKafkaEventProducer#publish",
      "member-service MemberKafkaEventProducer#publish",
    ],
    consumers: ["rental-service RentalEventConsumer#consumeRentalResult"],
    meaning: "참여 서비스 처리 결과를 rental-service가 받아 보상 여부를 판단합니다.",
  },
  {
    topic: "point_use",
    messageType: "PointUseCommand",
    producers: ["rental-service RentalKafkaEventProducer#publishPointUseCommand"],
    consumers: ["member-service MemberEventConsumer#consumeUsePoint"],
    meaning: "보상 흐름에서 이미 적립된 회원 포인트를 되돌립니다.",
  },
  {
    topic: "rent_cancel",
    messageType: "ItemRentCanceled",
    producers: ["rental-service RentalKafkaEventProducer#publishRentCanceledEvent"],
    consumers: [
      "book-service BookEventConsumer#consumeRentCanceled",
      "bestbook-service BestBookEventConsumer#consumeRentCanceled",
    ],
    meaning: "대여 실패 보상으로 도서 상태와 인기 도서 집계를 되돌립니다.",
  },
  {
    topic: "return_cancel",
    messageType: "ItemReturnCanceled",
    producers: ["rental-service RentalKafkaEventProducer#publishReturnCanceledEvent"],
    consumers: ["book-service BookEventConsumer#consumeReturnCanceled"],
    meaning: "반납 실패 보상으로 도서 상태를 대여 불가로 되돌립니다.",
  },
];

export class GetTopicFlowsUseCase {
  execute(): TopicFlow[] {
    return topicFlows;
  }
}
