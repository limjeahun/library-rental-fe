import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxyToBackend } from "./proxy-request";

function requestFor(pathname: string): NextRequest {
  return {
    method: "GET",
    nextUrl: new URL(`http://localhost:3000${pathname}?q=1`),
    headers: new Headers(),
    arrayBuffer: vi.fn(),
  } as unknown as NextRequest;
}

describe("proxyToBackend", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves a trailing slash required by backend routes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: null }));
    vi.stubGlobal("fetch", fetchMock);

    await proxyToBackend(requestFor("/api/member/Member/"), ["Member"], {
      serviceUrl: "http://localhost:8082",
      backendBasePath: "/api",
    });

    const targetUrl = fetchMock.mock.calls[0][0] as URL;
    expect(targetUrl.toString()).toBe("http://localhost:8082/api/Member/?q=1");
  });

  it("does not add a trailing slash when the incoming request has none", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: null }));
    vi.stubGlobal("fetch", fetchMock);

    await proxyToBackend(requestFor("/api/member/Member"), ["Member"], {
      serviceUrl: "http://localhost:8082",
      backendBasePath: "/api",
    });

    const targetUrl = fetchMock.mock.calls[0][0] as URL;
    expect(targetUrl.toString()).toBe("http://localhost:8082/api/Member?q=1");
  });
});
