import type { BaseResponse, ErrorResponse } from "@domain/shared/types/api-response";
import { ApiError, NetworkError } from "@shared/errors/api-error";
import { useRecentCacheStore } from "@shared/recent-cache/recent-cache-store";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;
  const method = options.method?.toUpperCase() ?? "GET";

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    recordApiLog({ method, path, status: 0 });
    throw new NetworkError();
  }

  recordApiLog({ method, path, status: response.status });
  const payload = await parseJsonSafely<BaseResponse<T> | ErrorResponse>(response);

  if (!response.ok) {
    const error = payload as ErrorResponse | undefined;
    throw new ApiError(
      response.status,
      error?.message || `HTTP ${response.status} 요청이 실패했습니다.`,
      error?.code,
      error?.fieldErrors ?? [],
    );
  }

  return (payload as BaseResponse<T>).data;
}

function recordApiLog(log: { method: string; path: string; status: number }) {
  if (typeof window === "undefined") {
    return;
  }
  useRecentCacheStore.getState().addApiLog(log);
}

async function parseJsonSafely<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new NetworkError("백엔드 응답을 JSON으로 해석할 수 없습니다.");
  }
}
