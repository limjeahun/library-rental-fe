# Library Rental EDA Frontend

`library-rental-eda` 백엔드의 HTTP API와 Kafka 기반 비동기 흐름을 검증하기 위한 개발자용 콘솔입니다.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Zustand recent cache
- Vitest

## Architecture

이 프론트엔드는 DDD + Hexagonal Architecture를 프론트 환경에 맞게 적용합니다.

- `src/domain`: 순수 도메인 타입, value object, repository port. React, Next.js, fetch import 금지
- `src/application`: use case, command/result 흐름. repository port만 의존
- `src/adapters/driven`: 백엔드 HTTP API 호출, BaseResponse unwrap, DTO mapper
- `src/adapters/driving`: React hook, TanStack Query, form schema
- `src/di`: repository와 use case를 조립하는 composition root
- `src/app`: Next.js route/page, 최외부 UI
- `src/shared`: UI, error, recent cache, 공통 유틸리티

## Backend Ports

- rental-service: `http://localhost:8080`
- book-service: `http://localhost:8081`
- member-service: `http://localhost:8082`
- bestbook-service: `http://localhost:8084`

## Environment

`.env.local.example`을 `.env.local`로 복사합니다.

```env
BOOK_SERVICE_URL=http://localhost:8081
MEMBER_SERVICE_URL=http://localhost:8082
RENTAL_SERVICE_URL=http://localhost:8080
BESTBOOK_SERVICE_URL=http://localhost:8084
```

## Route Handler Proxy

브라우저는 백엔드 포트로 직접 호출하지 않습니다.

- `/api/book/1` -> `http://localhost:8081/api/book/1`
- `/api/member/Member/by-id/jenny` -> `http://localhost:8082/api/Member/by-id/jenny`
- `/api/rental/rental-cards/jenny` -> `http://localhost:8080/api/rental-cards/jenny`
- `/api/bestbook/books` -> `http://localhost:8084/api/books`

route handler는 body, query string, status code, error response를 그대로 전달하며 비즈니스 로직을 갖지 않습니다.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Manual Scenario

1. 회원 등록: `jenny`, `제니`, `1111`, `jenny@example.com`
2. 회원 ID 조회: `jenny`
3. 도서 등록 후 도서를 `AVAILABLE` 상태로 변경
4. 대여카드 생성: `jenny`, `제니`
5. 도서 대여 요청
6. `202 Accepted` 접수 메시지 확인
7. 대여카드, 회원 포인트, 도서 상태, 인기 도서 read model을 refresh로 확인
8. 도서 반납 요청
9. 반납 완료 목록과 도서 `AVAILABLE` 복원을 확인

## Notes

- `book-service`와 `member-service`에는 전체 목록 조회 API가 없습니다.
- 도서/회원 목록 화면은 mock이 아니라 Zustand + localStorage recent cache를 사용합니다.
- `202 Accepted`는 최종 성공이 아니라 요청 접수입니다. Kafka 후속 처리는 관련 조회 API로 확인해야 합니다.
