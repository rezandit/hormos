import NhanesReference from "@/components/NhanesReference";
import SymptomInsight from "@/components/SymptomInsight";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            HormOS
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
            Understand how you feel, day by day
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Your energy, mood, and symptoms shift with your cycle — but a single
            check-up only sees one moment. Log how you feel today and see the
            bigger picture across your cycle.
          </p>
        </header>

        {/* Gentle, non-clinical note (kept intentionally short and friendly). */}
        <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          HormOS helps you notice patterns and understand your body better. It
          isn&apos;t a doctor and doesn&apos;t diagnose. Its insights reflect
          non-pregnant, cyclical patterns and aren&apos;t applicable during
          pregnancy or postpartum. Always talk to a healthcare professional
          about your health.
        </div>

        {/* Core feature */}
        <SymptomInsight />

        {/* Trust: grounded in real, anonymized health data. */}
        <div className="mt-12">
          <NhanesReference />
        </div>

        {/* Why you can trust it — in plain language. */}
        <section className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Grounded in real research
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your insights are based on real, anonymized health data from
              thousands of women — not guesswork.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Clear, honest patterns
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              We show you general patterns in plain language, so you always know
              what you&apos;re looking at.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Your data, respected
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              What you log stays private. Nothing here is a diagnosis — it&apos;s
              about helping you understand yourself.
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-100 pt-6 text-xs text-slate-400">
          HormOS — helping women understand their hormonal health. Not a medical
          or diagnostic tool.
        </footer>
      </div>
    </main>
  );
}
