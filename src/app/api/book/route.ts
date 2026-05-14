import { proxyToBackend } from "@adapters/driven/http/proxy-request";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const config = {
  serviceUrl: process.env.BOOK_SERVICE_URL,
  backendBasePath: "/api/book",
};

export function GET(request: NextRequest) {
  return proxyToBackend(request, [], config);
}

export function POST(request: NextRequest) {
  return proxyToBackend(request, [], config);
}
