"use client";

import { useState } from "react";

import type { InsightResult } from "@/lib/insights";

const SYMPTOMS: Array<{ key: string; label: string }> = [
  { key: "fatigue", label: "Fatigue" },
  { key: "migraine", label: "Migraine / headache" },
  { key: "mood", label: "Low mood / irritability" },
  { key: "brain_fog", label: "Brain fog" },
  { key: "cramps", label: "Cramps" },
];

const SEVERITY = ["None", "Mild", "Moderate", "Severe"];

const PHASE_LABEL: Record<string, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export default function SymptomInsight() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(SYMPTOMS.map((s) => [s.key, 0])),
  );
  const [result, setResult] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as InsightResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-800">
          Log today&apos;s symptoms
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Rate each from none to severe. We&apos;ll compare your day to
          population patterns across cycle phases.
        </p>

        <div className="mt-6 space-y-5">
          {SYMPTOMS.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between">
                <label
                  htmlFor={s.key}
                  className="text-sm font-medium text-slate-700"
                >
                  {s.label}
                </label>
                <span className="text-xs font-medium text-rose-600">
                  {SEVERITY[values[s.key]]}
                </span>
              </div>
              <input
                id={s.key}
                type="range"
                min={0}
                max={3}
                step={1}
                value={values[s.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))
                }
                className="mt-2 w-full accent-rose-500"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "See my insight"}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>

      {/* Result */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Your insight</h2>

        {!result && (
          <p className="mt-3 text-sm text-slate-500">
            Log your symptoms to see which cycle phase your day most resembles,
            based on integrated open datasets.
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-6">
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Closest population profile
              </p>
              <p className="mt-1 text-2xl font-bold text-rose-700">
                {PHASE_LABEL[result.bestMatch.phase]} phase
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {result.bestMatch.similarity}% similarity to the average{" "}
                {PHASE_LABEL[result.bestMatch.phase].toLowerCase()}-phase day.
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                All phases ranked
              </p>
              <div className="space-y-2">
                {result.ranked.map((r) => (
                  <div key={r.phase} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-slate-600">
                      {PHASE_LABEL[r.phase]}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-rose-400"
                        style={{ width: `${r.similarity}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-slate-500">
                      {r.similarity}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {result.reportedSymptomPeaks.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  When these symptoms typically peak
                </p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {result.reportedSymptomPeaks
                    .filter((p) => p.peak)
                    .map((p) => (
                      <li key={p.symptom} className="flex justify-between">
                        <span className="capitalize">
                          {p.symptom.replace("_", " ")}
                        </span>
                        <span className="text-slate-500">
                          peaks in {PHASE_LABEL[p.peak!.phase].toLowerCase()}{" "}
                          phase
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              Based on {result.meta.n_observations.toLocaleString()} daily
              records from {result.meta.n_subjects} subjects. Data status:{" "}
              {result.meta.data_status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
