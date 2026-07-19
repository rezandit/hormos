import { NextResponse } from "next/server";

import {
  computeInsight,
  loadInsightArtifact,
  type SymptomInput,
} from "@/lib/insights";

// Reads a static, precomputed artifact from disk — no Python at runtime.
export const runtime = "nodejs";

/** GET: expose the raw insight artifact (population patterns + metadata). */
export function GET() {
  const artifact = loadInsightArtifact();
  return NextResponse.json(artifact);
}

/**
 * POST: given self-reported symptom severities (0-3 per symptom), return the
 * closest population cycle-phase profile plus descriptive context.
 *
 * Body: { symptoms: { fatigue?: number, migraine?: number, ... } }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const symptoms = (body as { symptoms?: unknown })?.symptoms;
  if (typeof symptoms !== "object" || symptoms === null) {
    return NextResponse.json(
      { error: "Body must include a `symptoms` object of {name: 0-3}." },
      { status: 400 },
    );
  }

  const artifact = loadInsightArtifact();
  const clean: SymptomInput = {};
  for (const [key, value] of Object.entries(symptoms as Record<string, unknown>)) {
    if (!artifact.symptoms.includes(key)) continue;
    const n = Number(value);
    if (!Number.isFinite(n)) continue;
    clean[key] = Math.min(artifact.scale.max, Math.max(artifact.scale.min, n));
  }

  if (Object.keys(clean).length === 0) {
    return NextResponse.json(
      {
        error: `Provide at least one known symptom (${artifact.symptoms.join(", ")}) with a 0-3 severity.`,
      },
      { status: 400 },
    );
  }

  const result = computeInsight(clean, artifact);
  return NextResponse.json(result);
}
