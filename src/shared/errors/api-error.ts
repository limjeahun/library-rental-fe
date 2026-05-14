import type { FieldError } from "@domain/shared/types/api-response";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string | number,
    readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "백엔드 서비스에 연결할 수 없습니다.") {
    super(message);
    this.name = "NetworkError";
  }
}
