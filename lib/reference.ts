/**
 * Loader + types for the REAL NHANES population-reference artifact produced by
 * ml/pipeline/build_nhanes_reference.py. Unlike the cycle-phase insight, every
 * number here is derived from public NHANES data.
 */

import fs from "node:fs";
import path from "node:path";

export interface TshSummary {
  n: number;
  mean?: number;
  median?: number;
  p10?: number;
  p25?: number;
  p75?: number;
  p90?: number;
}

export interface NhanesReference {
  artifact: string;
  schema_ref: string;
  version: string;
  source: {
    dataset: string;
    provider: string;
    cycle: string;
    files: string[];
    population: string;
    license: string;
  };
  data_status: string;
  disclaimer: string;
  n_women: number;
  tsh: {
    unit: string;
    reference_interval: { low: number; high: number };
    overall: TshSummary;
    by_age_band: Record<string, TshSummary>;
    distribution_vs_reference: {
      n: number;
      within_pct: number | null;
      below_pct: number | null;
      above_pct: number | null;
    };
  };
  reproductive: {
    menopausal_status: Record<string, number>;
  };
}

let cached: NhanesReference | null = null;

export function loadNhanesReference(): NhanesReference {
  if (cached) return cached;
  const p = path.join(
    process.cwd(),
    "data",
    "processed",
    "nhanes_reference.json",
  );
  cached = JSON.parse(fs.readFileSync(p, "utf-8")) as NhanesReference;
  return cached;
}
