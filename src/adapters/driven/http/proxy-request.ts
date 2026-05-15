import type { NextRequest } from "next/server";

type ProxyConfig = {
  serviceUrl: string | undefined;
  backendBasePath: string;
};

export async function proxyToBackend(
  request: NextRequest,
  path: string[],
  config: ProxyConfig,
): Promise<Response> {
  if (!config.serviceUrl) {
    return Response.json(
      { message: "백엔드 서비스 URL 환경 변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const targetPath = [config.backendBasePath, ...path]
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  const trailingSlash = request.nextUrl.pathname.endsWith("/") ? "/" : "";
  const targetUrl = new URL(
    `/${targetPath}${trailingSlash}${request.nextUrl.search}`,
    config.serviceUrl,
  );

  const headers = copyProxyHeaders(request.headers);
  const canHaveBody = !["GET", "HEAD"].includes(request.method);
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: canHaveBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function copyProxyHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const [key, value] of source.entries()) {
    if (["host", "connection", "content-length"].includes(key.toLowerCase())) {
      continue;
    }
    headers.set(key, value);
  }
  return headers;
}
