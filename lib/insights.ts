/**
 * Shared types + loader for the precomputed symptom-to-cycle-phase insight
 * artifact produced by the Python pipeline (ml/pipeline/build_insights.py).
 *
 * The deployed app reads ONLY this static artifact — no Python runs on Vercel.
 */

import fs from "node:fs";
import path from "node:path";

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export type PhaseSymptomMeans = Record<CyclePhase, Record<string, number>>;

export interface SymptomPeak {
  phase: CyclePhase;
  mean: number;
}

export interface Correlation {
  a: string;
  b: string;
  pearson_r: number;
  n: number;
  note: string;
}

export interface InsightArtifact {
  artifact: string;
  schema_ref: string;
  version: string;
  data_status: string;
  disclaimer: string;
  n_subjects: number;
  n_observations: number;
  phases: CyclePhase[];
  symptoms: string[];
  scale: { min: number; max: number; labels: string[] };
  phase_symptom_means: PhaseSymptomMeans;
  symptom_peak_phase: Record<string, SymptomPeak>;
  correlations: Correlation[];
}

/** A user's self-reported symptom severities, keyed by symptom (0-3). */
export type SymptomInput = Record<string, number>;

export interface PhaseMatch {
  phase: CyclePhase;
  /** 0-100 similarity score (higher = closer to that phase's population profile). */
  similarity: number;
  distance: number;
}

export interface InsightResult {
  bestMatch: PhaseMatch;
  ranked: PhaseMatch[];
  /** For each reported symptom, the phase where the population tends to peak. */
  reportedSymptomPeaks: Array<{ symptom: string; peak: SymptomPeak | null; userValue: number }>;
  correlations: Correlation[];
  meta: {
    n_subjects: number;
    n_observations: number;
    data_status: string;
    disclaimer: string;
    schema_ref: string;
    version: string;
  };
}

let cached: InsightArtifact | null = null;

/** Load and cache the insight artifact from data/processed. */
export function loadInsightArtifact(): InsightArtifact {
  if (cached) return cached;
  const artifactPath = path.join(
    process.cwd(),
    "data",
    "processed",
    "insights.sample.json",
  );
  const raw = fs.readFileSync(artifactPath, "utf-8");
  cached = JSON.parse(raw) as InsightArtifact;
  return cached;
}

/**
 * Compare a user's reported symptoms against each phase's population mean
 * profile using Euclidean distance over the symptoms the user actually
 * reported. Purely descriptive similarity — NOT a diagnosis.
 */
export function computeInsight(
  input: SymptomInput,
  artifact: InsightArtifact = loadInsightArtifact(),
): InsightResult {
  const reported = Object.keys(input).filter((k) =>
    artifact.symptoms.includes(k),
  );

  const maxPerSymptom = artifact.scale.max - artifact.scale.min; // e.g. 3

  const ranked: PhaseMatch[] = artifact.phases
    .map((phase) => {
      const means = artifact.phase_symptom_means[phase] ?? {};
      let sumSq = 0;
      let count = 0;
      for (const s of reported) {
        const mean = means[s];
        if (typeof mean !== "number") continue;
        const diff = input[s] - mean;
        sumSq += diff * diff;
        count += 1;
      }
      const distance = count > 0 ? Math.sqrt(sumSq / count) : Number.POSITIVE_INFINITY;
      // Normalize distance to a 0-100 similarity.
      const similarity =
        count > 0
          ? Math.max(0, Math.round((1 - distance / maxPerSymptom) * 100))
          : 0;
      return { phase, distance, similarity };
    })
    .sort((a, b) => a.distance - b.distance);

  const reportedSymptomPeaks = reported.map((symptom) => ({
    symptom,
    userValue: input[symptom],
    peak: artifact.symptom_peak_phase[symptom] ?? null,
  }));

  return {
    bestMatch: ranked[0],
    ranked,
    reportedSymptomPeaks,
    correlations: artifact.correlations,
    meta: {
      n_subjects: artifact.n_subjects,
      n_observations: artifact.n_observations,
      data_status: artifact.data_status,
      disclaimer: artifact.disclaimer,
      schema_ref: artifact.schema_ref,
      version: artifact.version,
    },
  };
}
