import { loadNhanesReference } from "@/lib/reference";

const AGE_ORDER = ["18-29", "30-39", "40-49", "50-59", "60+"];

export default function NhanesReference() {
  const ref = loadNhanesReference();
  const bands = AGE_ORDER.filter((b) => ref.tsh.by_age_band[b]?.n);
  const maxP90 = Math.max(
    ...bands.map((b) => ref.tsh.by_age_band[b].p90 ?? 0),
    ref.tsh.reference_interval.high,
  );

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Population reference — thyroid (TSH)
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Real data · NHANES {ref.source.cycle}
        </span>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        Computed from {ref.n_women.toLocaleString()} adult women in public
        NHANES data ({ref.tsh.overall.n?.toLocaleString()} with a TSH lab
        result). Median TSH {ref.tsh.overall.median} {ref.tsh.unit}.
      </p>

      {/* Median + IQR bars by age band */}
      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-slate-700">
          TSH by age band ({ref.tsh.unit}) — median with 25th–75th percentile
        </p>
        {bands.map((b) => {
          const s = ref.tsh.by_age_band[b];
          const left = ((s.p25 ?? 0) / maxP90) * 100;
          const width = (((s.p75 ?? 0) - (s.p25 ?? 0)) / maxP90) * 100;
          const medianLeft = ((s.median ?? 0) / maxP90) * 100;
          return (
            <div key={b} className="flex items-center gap-3">
              <span className="w-14 text-xs text-slate-500">{b}</span>
              <div className="relative h-4 flex-1 rounded-full bg-slate-100">
                <div
                  className="absolute top-0 h-4 rounded-full bg-emerald-200"
                  style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                />
                <div
                  className="absolute top-0 h-4 w-0.5 bg-emerald-600"
                  style={{ left: `${medianLeft}%` }}
                  title={`median ${s.median}`}
                />
              </div>
              <span className="w-24 text-right text-xs text-slate-500">
                {s.median} (n={s.n})
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-slate-500">
        {ref.tsh.distribution_vs_reference.within_pct}% of measurements fall
        within the commonly-cited laboratory reference interval (
        {ref.tsh.reference_interval.low}–{ref.tsh.reference_interval.high}{" "}
        {ref.tsh.unit}); {ref.tsh.distribution_vs_reference.above_pct}% above,{" "}
        {ref.tsh.distribution_vs_reference.below_pct}% below. This interval is
        shown as context only, not a clinical threshold.
      </p>

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
        Source: {ref.source.provider}, NHANES {ref.source.cycle} (
        {ref.source.files.join(", ")}). {ref.source.license}. {ref.disclaimer}
      </p>
    </section>
  );
}
