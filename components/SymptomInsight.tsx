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

const PHASE_DESCRIPTION: Record<string, string> = {
  menstrual: "the days of your period, when energy is often lower",
  follicular: "the days after your period, when energy often rises",
  ovulatory: "around mid-cycle",
  luteal: "the week or so before your period, when PMS-type symptoms are common",
};

type Screening = "yes" | "no" | null;

export default function SymptomInsight() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(SYMPTOMS.map((s) => [s.key, 0])),
  );
  const [result, setResult] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ephemeral client-side only. Not persisted, not sent anywhere, resets on
  // refresh — we intentionally do not collect/store pregnancy information.
  const [screening, setScreening] = useState<Screening>(null);

  function chooseScreening(choice: Screening) {
    setScreening(choice);
    // Clear any previously computed insight when the answer changes.
    setResult(null);
    setError(null);
  }

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
    <div className="space-y-8">
      {/* Screening gate — shown before the symptom form. */}
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <legend className="px-1 text-sm font-semibold text-slate-800">
          One quick question first
        </legend>
        <p className="mt-1 text-sm text-slate-600">
          Are you currently pregnant, trying to conceive, or postpartum (less
          than 6 months)?
        </p>
        <div className="mt-4 flex gap-3" role="radiogroup" aria-label="Are you currently pregnant, trying to conceive, or postpartum (less than 6 months)?">
          {([
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ] as const).map((opt) => {
            const active = screening === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => chooseScreening(opt.value)}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Exclusion path: replace the form area with a neutral, empathetic note. */}
      {screening === "yes" && (
        <div
          role="status"
          className="rounded-2xl border border-sky-200 bg-sky-50 p-6"
        >
          <h2 className="text-base font-semibold text-sky-900">
            HormOS isn&apos;t the right fit for this stage — and that&apos;s
            okay
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-sky-900/90">
            HormOS&apos;s current insights are based on non-pregnant, cyclical
            patterns and aren&apos;t applicable during pregnancy, conception
            planning, or early postpartum. Your body follows a very different
            hormonal rhythm during this time. Please consult your care provider
            for guidance specific to this stage. We hope to support this
            community with an appropriately designed model in the future.
          </p>
        </div>
      )}

      {/* Prompt shown until a choice is made. */}
      {screening === null && (
        <p className="text-sm text-slate-500">
          Choose an answer above to continue.
        </p>
      )}

      {/* Normal path: symptom form + insight (only when not excluded). */}
      {screening === "no" && (
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
              Rate each from none to severe, and we&apos;ll show you how your
              day compares across your cycle.
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
                      setValues((v) => ({
                        ...v,
                        [s.key]: Number(e.target.value),
                      }))
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
            Log your symptoms to see how your day compares across your cycle.
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-6">
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Your day looks most like
              </p>
              <p className="mt-1 text-2xl font-bold text-rose-700">
                Your {PHASE_LABEL[result.bestMatch.phase].toLowerCase()} phase
              </p>
              <p className="mt-1 text-sm text-slate-600">
                How you feel today is most similar to{" "}
                {PHASE_DESCRIPTION[result.bestMatch.phase]}.
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                How your day compares to each phase
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
                  </div>
                ))}
              </div>
            </div>

            {result.reportedSymptomPeaks.filter((p) => p.peak).length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Good to know
                </p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  {result.reportedSymptomPeaks
                    .filter((p) => p.peak)
                    .map((p) => (
                      <li key={p.symptom} className="flex gap-2">
                        <span className="text-rose-400">•</span>
                        <span>
                          <span className="capitalize">
                            {p.symptom.replace("_", " ")}
                          </span>{" "}
                          is often most noticeable during the{" "}
                          {PHASE_LABEL[p.peak!.phase].toLowerCase()} phase.
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              These are general patterns to help you reflect — not a diagnosis.
              Everyone is different.
            </p>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
}
