import { NextRequest, NextResponse } from "next/server";
import { authenticateIngestApiKey } from "@/server/ingest/service";

export async function requireIngestAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: { code: "invalid_api_key", message: "Missing bearer token" } },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const auth = await authenticateIngestApiKey(token);

  if (!auth) {
    return {
      error: NextResponse.json(
        { error: { code: "invalid_api_key", message: "Invalid or revoked API key" } },
        { status: 401 }
      ),
    };
  }

  return { auth };
}
