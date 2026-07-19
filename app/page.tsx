import SymptomInsight from "@/components/SymptomInsight";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            HormOS · Layer 03 — Application Infrastructure
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Your symptoms, in the context of your cycle
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Hormones shift continuously, but a doctor&apos;s visit only captures
            a single snapshot. HormOS turns day-to-day symptom logs into
            patterns, comparing your day to integrated open datasets
            (mcPHASES + NHANES) mapped to one reusable schema.
          </p>
        </header>

        {/* Disclaimer banner — required by challenge (no medical claims). */}
        <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Research &amp; education only.</strong> HormOS is not a medical
          device and does not diagnose, treat, or provide medical advice. The
          insights below are descriptive statistical patterns from population
          data. Talk to a qualified clinician about your health.
        </div>

        {/* Core feature */}
        <SymptomInsight />

        {/* Foundation / provenance section */}
        <section className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Built on a reusable schema
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              mcPHASES and NHANES are harmonized into one unified longitudinal
              schema — the reusable foundation, not an isolated app.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Transparent methodology
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Every number is a documented descriptive statistic computed by an
              open Python pipeline — reproducible, no black box.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Open license
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Code under MIT, data/docs under CC-BY-4.0, so the community can
              build on it.
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-100 pt-6 text-xs text-slate-400">
          HormOS — Hack-Nation Challenge 05 · Foundation Models for Women&apos;s
          Hormonal Health. Not a medical or diagnostic tool.
        </footer>
      </div>
    </main>
  );
}
