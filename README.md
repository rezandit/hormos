# HormOS

**Your symptoms, in the context of your cycle.**

HormOS is a submission for **Hack-Nation Challenge 05 — "Foundation Models for
Women's Hormonal Health"** (6th Global AI Hackathon, with the MIT Club of
Northern California & MIT Club of Germany).

> **Research & education only. HormOS is not a medical device and does not
> diagnose, treat, or provide medical advice.**

## The problem

Hormones shift continuously — with sleep, stress, nutrition, and age — but a
doctor's appointment only captures a single snapshot. That gap is the core of
the challenge's persona, *Sarah* (fatigue, irregular cycles, migraines, brain
fog). HormOS turns everyday symptom logs into patterns you can see across the
menstrual cycle.

## Why Layer 03 (Application Infrastructure)

The challenge defines three contribution layers. HormOS deliberately targets
**Layer 03 — Application Infrastructure**, because the symptom-tracking /
personalized-insight sub-track maps most directly to the "continuous vs.
snapshot" problem. See the full rationale in
[`design-context-womens-hormonal-health.md`](./design-context-womens-hormonal-health.md)
(§3).

Crucially, HormOS is **not an isolated application**. It is built on a small but
real **data foundation**: mcPHASES (PhysioNet) and NHANES (CDC) are harmonized
into one reusable schema. That underlying, open-licensed artifact is what gives
the project **Foundation Value** rather than being a UI over nothing.

### Focus feature

**Symptom-to-cycle-phase correlation** — log daily symptoms (fatigue, migraine,
mood, brain fog, cramps) and see which cycle phase your day most resembles,
based on population patterns from the integrated datasets.

## Architecture

```
Python pipeline (local/offline)                Next.js app (Vercel)
──────────────────────────────                 ─────────────────────
mcPHASES ─┐                                     app/            UI (App Router)
NHANES  ──┼─► unified schema ─► descriptive ─►  data/processed/ static artifact
          │   (data/schema)     statistics      app/api/insight reads artifact
          └─────────────────────────────────►   (no Python at runtime)
```

Python runs **only locally** to produce static JSON artifacts. Vercel serves the
Next.js app, which reads those artifacts — it never runs Python.

## Repository layout

```
app/                 Next.js App Router (UI + API routes)
  api/insight/       reads the precomputed insight artifact
components/          React UI (symptom form + insight display)
lib/                 shared TS types + insight logic
data/
  raw/               raw datasets — GIT-IGNORED, never committed
  processed/         small committed artifacts consumed by the app
  schema/            unified schema definition (dataset card, short form)
ml/
  pipeline/          reusable Python preprocessing (NHANES + mcPHASES)
  notebooks/         exploration/training (later)
  artifacts/         model checkpoints (git-ignored)
docs/                dataset-card, model-card, benchmark-methodology
```

## Run locally

### App (Next.js)

```bash
npm install
cp .env.example .env.local   # fill in values as needed
npm run dev                  # http://localhost:3000
```

The app works out of the box using the committed sample insight artifact
(`data/processed/insights.sample.json`).

### Data / ML pipeline (Python, optional)

```bash
cd ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python -m pipeline.load_nhanes     # download public NHANES
python -m pipeline.load_mcphases   # placeholder until PhysioNet access
python -m pipeline.integrate       # -> unified schema table
python -m pipeline.build_insights  # -> data/processed insight artifact
```

See [`ml/pipeline/README.md`](./ml/pipeline/README.md) for details.

## Deploy to Vercel

1. Push this repo to GitHub (`https://github.com/rezandit/hormos.git`).
2. In Vercel, **Import Project** and select the repo. It auto-detects Next.js.
3. Add environment variables from `.env.example` (e.g. `OPENAI_API_KEY`) in
   the Vercel dashboard if/when used.
4. Deploy. The committed `data/processed/*.json` artifact ships with the build;
   no Python runtime is required.

## Documentation

- [Technical overview](./docs/technical-overview.md) — stack, architecture, implementation
- [Dataset card](./docs/dataset-card.md)
- [Model card](./docs/model-card.md)
- [Benchmark methodology](./docs/benchmark-methodology.md)
- [Unified schema](./data/schema/hormos_schema.json)

## License

- **Code:** MIT (see [`LICENSE`](./LICENSE)).
- **Data artifacts / docs:** CC-BY-4.0 (see [`LICENSE-DATA`](./LICENSE-DATA)).
- Upstream datasets (mcPHASES, NHANES) remain under their own licenses and are
  not redistributed here.

## Disclaimer

HormOS produces population-level statistical patterns, not medical advice or a
diagnosis. Individual experiences vary. Consult a qualified clinician about your
health.
