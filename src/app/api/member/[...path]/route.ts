import { proxyToBackend } from "@adapters/driven/http/proxy-request";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

const config = {
  serviceUrl: process.env.MEMBER_SERVICE_URL,
  backendBasePath: "/api",
};

async function handle(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  return proxyToBackend(request, path, config);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
