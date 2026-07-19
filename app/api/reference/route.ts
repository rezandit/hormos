import { NextResponse } from "next/server";

import { loadNhanesReference } from "@/lib/reference";

// Serves a precomputed, real NHANES-derived artifact. No Python at runtime.
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(loadNhanesReference());
}
