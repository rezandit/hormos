import { loadNhanesReference } from "@/lib/reference";

const AGE_ORDER = ["18-29", "30-39", "40-49", "50-59", "60+"];

export default function NhanesReference() {
  const ref = loadNhanesReference();
  const bands = AGE_ORDER.filter((b) => ref.tsh.by_age_band[b]?.n);
  const maxMedian = Math.max(
    ...bands.map((b) => ref.tsh.by_age_band[b].median ?? 0),
  );

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Population reference — thyroid (TSH)
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Real data · NHANES {ref.source.cycle}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-600">
        Your insights are grounded in anonymized data from a large national
        health study of{" "}
        <span className="font-semibold text-slate-800">
          {ref.n_women.toLocaleString()}
        </span>{" "}
        women — not guesswork. For example, here&apos;s how a key hormonal
        marker (thyroid) tends to look at different ages.
      </p>

      <div className="mt-6 space-y-3">
        {bands.map((b) => {
          const s = ref.tsh.by_age_band[b];
          const width = ((s.median ?? 0) / maxMedian) * 100;
          return (
            <div key={b} className="flex items-center gap-3">
              <span className="w-24 text-sm text-slate-600">
                Ages {b}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${Math.max(width, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Thyroid hormone levels stay fairly steady across ages for most women —
        the kind of real-world pattern HormOS builds on.
      </p>
    </section>
  );
}
