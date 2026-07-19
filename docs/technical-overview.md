# HormOS — Technical Overview

Stack, architecture, and implementation for HormOS, the Layer 03 (Application
Infrastructure) submission for Hack-Nation Challenge 05 — *Foundation Models for
Women's Hormonal Health*.

> **Non-diagnostic.** HormOS surfaces descriptive statistical patterns for
> research/education only. It is not a medical device. It is scoped to
> non-pregnant, cyclical populations (see [§7](#7-responsible-design--safety-gates)).

---

## 1. Design goals

1. **Not an isolated application.** The app sits on a small but real, reusable
   **data foundation** (a unified schema + an integration pipeline over open
   datasets). That underlying artifact is what gives the project *Foundation
   Value*, per the challenge brief.
2. **Reproducible & transparent.** Every number shown to a user traces back to a
   documented descriptive statistic produced by an open Python pipeline — no
   black box.
3. **Deployable & cheap to run.** The web app is a static-artifact consumer. All
   heavy data work happens offline; the deployed surface never runs Python.
4. **Responsible by default.** No medical/diagnostic claims, a population-scope
   screening gate, and no collection of sensitive data without consent.

---

## 2. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Web framework | **Next.js 16** (App Router) | React Server Components + Route Handlers |
| Language (web) | **TypeScript 5** (strict) | `@/*` path alias to repo root |
| UI runtime | **React 19** | One small client component; rest are server components |
| Styling | **Tailwind CSS v4** | via `@tailwindcss/postcss`; theme tokens in `app/globals.css` |
| Build/deploy | **Vercel** (target) | Turbopack build; workspace root pinned in `next.config.ts` |
| Data/ML pipeline | **Python 3.9+** | `pandas`, `numpy`, `pyarrow`, `requests` (see `ml/requirements.txt`) |
| Data interchange | **JSON** (app), **Parquet** (local integrated tables) | JSON artifacts are the app's only data dependency |

### Why this split

Python cannot be assumed to run at request time on Vercel. So the ML/data code
runs **locally/offline** and emits **static artifacts** (`data/processed/*.json`)
that the Next.js Route Handlers read from disk. This keeps the deployed app
stateless, fast, and dependency-light while preserving a real data backbone.

---

## 3. High-level architecture

```
        OFFLINE (local, Python)                     ONLINE (Vercel, Next.js)
  ────────────────────────────────────      ───────────────────────────────────────
  NHANES (CDC, public) ──► load_nhanes ─┐
                                        ├─► integrate ─► daily_observation.parquet
  mcPHASES (PhysioNet)  ──► load_mcphases┘                (git-ignored, local)
        (placeholder)                    │
                                         ├─► build_nhanes_reference ─► nhanes_reference.json ─┐
                                         └─► build_insights ────────► insights.sample.json ──┤
                                                                                             │
                                                                            data/processed/  │  (committed JSON)
                                                                                             ▼
                                                                       ┌──────────────────────────────────┐
                                                                       │ Next.js Route Handlers            │
                                                                       │  GET/POST /api/insight            │
                                                                       │  GET      /api/reference          │
                                                                       │        (read JSON via fs)         │
                                                                       └──────────────┬───────────────────┘
                                                                                      ▼
                                                                       React UI (app/page.tsx + components)
```

**Data flow contract:** the boundary between the two worlds is the set of JSON
files in `data/processed/`. The pipeline is the only writer; the web app is a
read-only consumer. Swapping synthetic data for real data is just regenerating
those files — no app code changes.

---

## 4. Repository layout

```
app/
  layout.tsx              root layout + metadata
  page.tsx                landing page (server component)
  api/insight/route.ts    POST: symptom → phase match; GET: raw insight artifact
  api/reference/route.ts  GET: real NHANES reference artifact
components/
  SymptomInsight.tsx      client component: screening gate + symptom form + result
  NhanesReference.tsx     server component: renders real NHANES reference
lib/
  insights.ts             types + artifact loader + phase-similarity logic
  reference.ts            types + loader for the NHANES reference artifact
data/
  raw/                    raw datasets — GIT-IGNORED (never committed)
  processed/              committed JSON artifacts consumed by the app
  schema/hormos_schema.json   the unified schema (reusable foundation)
ml/
  pipeline/               reusable Python preprocessing + artifact builders
  requirements.txt
docs/                     dataset-card, model-card, benchmark-methodology, this file
```

---

## 5. The data foundation (unified schema)

Defined in [`../data/schema/hormos_schema.json`](../data/schema/hormos_schema.json)
(`hormos_unified_longitudinal_v0`). It is source-agnostic so heterogeneous
datasets map into one shape.

- **`subject`** — one row per de-identified person: `subject_id`
  (namespaced, e.g. `nhanes:83732`), `source_dataset`, `age_years`,
  `menopausal_status`, `reproductive_notes`.
- **`daily_observation`** — one row per `(subject_id, observation_date)`, sparse
  by design: symptoms (`symptom_*` on an ordinal **0–3** scale), wearable/CGM
  (`sleep_hours`, `steps`, `resting_hr`, `glucose_mean`), cycle (`cycle_day`,
  `cycle_phase`), and hormones (`hormone_estradiol/progesterone/lh/fsh/tsh`).

Harmonization conventions (ordinal 0–3 symptom scale, phase enums, SI units,
`null` for missing) live in the schema file so any new dataset can be onboarded
by writing a single adapter that emits rows in this shape.

---

## 6. Implementation details

### 6.1 Python pipeline (`ml/pipeline/`)

| Module | Responsibility | Status |
|---|---|---|
| `config.py` | Single source of truth: paths, schema column lists, pinned NHANES cycle (`2011-2012`). | ready |
| `load_nhanes.py` | Download CDC `.XPT` files, filter to adult women, map DEMO/RHQ/THYROD → `subject` + `daily_observation`. | **implemented** |
| `load_mcphases.py` | Map credentialed mcPHASES longitudinal data → schema; includes `derive_cycle_phase`. | placeholder (pending PhysioNet) |
| `integrate.py` | Concatenate per-source frames, validate schema columns, write `subject.parquet` + `daily_observation.parquet`. | implemented |
| `build_nhanes_reference.py` | Compute **real** population reference (TSH distribution by age band + reproductive demographics) → `nhanes_reference.json`. | **implemented** |
| `build_insights.py` | Compute symptom-to-cycle-phase means, peaks, correlations → `insights.sample.json`. | needs mcPHASES (NHANES is cross-sectional) |

**NHANES mapping specifics.** Cycle **2011-2012** is pinned because it is the most
recent cycle shipping DEMO + RHQ + THYROD together (thyroid was not collected in
2017-2018). Scope is adult women (`RIAGENDR == 2`, `RIDAGEYR >= 18`). Key
variables: `LBXTSH1` → `hormone_tsh`; `RHQ060` (age at last period) →
`menopausal_status`; `RHQ031`/`RHQ540` → `reproductive_notes`. "Don't know /
refused" sentinel codes are cleaned to `null`. This yields ~2,967 subjects,
~841 with a TSH result.

**Reproducibility.** Deterministic (no training/randomness in this iteration).
`config.py` centralizes constants; `requirements.txt` pins dependency ranges.
Full method definitions are in
[`benchmark-methodology.md`](./benchmark-methodology.md).

### 6.2 Artifacts (the offline→online contract)

- `data/processed/nhanes_reference.json` — **real** data, committed. Consumed by
  `/api/reference` and `NhanesReference.tsx`.
- `data/processed/insights.sample.json` — currently a clearly-labeled
  **synthetic placeholder** (cycle-phase insight needs mcPHASES). Consumed by
  `/api/insight`.
- `data/processed/*.parquet` — integrated tables, git-ignored (may be large or
  derived from credentialed data).

### 6.3 Insight logic (`lib/insights.ts`)

`computeInsight(input, artifact)` compares a user's reported symptoms (0–3) to
each phase's population mean profile using **normalized Euclidean distance** over
only the symptoms actually reported, then converts distance to a 0–100
similarity. It also returns each reported symptom's typical peak phase and
selected correlations. Purely descriptive — **no diagnosis**.

### 6.4 API (Route Handlers, `runtime = "nodejs"`)

- `POST /api/insight` — validates/clamps the `symptoms` body to known keys and
  the 0–3 range, then returns `computeInsight(...)`.
- `GET /api/insight` — returns the raw insight artifact (population patterns).
- `GET /api/reference` — returns the real NHANES reference artifact.

Artifacts are loaded from disk with `fs` and cached in-module. `nodejs` runtime
is required because handlers read the filesystem.

### 6.5 UI

- `app/page.tsx` (server component) — hero, friendly non-clinical disclaimer, the
  core feature, the real-data trust panel, and plain-language trust cards. Copy
  is intentionally **user-centric** (technical provenance lives in `docs/`, not
  on-screen).
- `components/NhanesReference.tsx` (server component) — reads the reference
  artifact directly at render time and shows a simplified by-age visual.
- `components/SymptomInsight.tsx` (client component) — the only stateful piece:
  screening gate, symptom sliders, `fetch('/api/insight')`, and result rendering.

---

## 7. Responsible design & safety gates

- **No medical/diagnostic claims.** A disclaimer is always visible; every result
  is framed as a general pattern.
- **Population-scope screening gate.** Before the symptom form renders, the user
  must answer whether they are pregnant, trying to conceive, or postpartum
  (< 6 months). If **yes**, the form is not rendered and a neutral, empathetic
  message is shown instead. Rationale: mcPHASES/NHANES describe a non-pregnant,
  cyclical population, and pregnancy's non-cyclical hormonal profile does not fit
  the four-phase model. See `model-card.md` §2a and `dataset-card.md` §3a.
- **Ephemeral sensitive state.** The screening answer is React state only — never
  persisted, transmitted, or logged (no consent flow exists to collect it).
- **Data governance.** Raw datasets (`data/raw/`) are git-ignored and never
  committed; only small, de-identified, aggregated artifacts are shared. Secrets
  go in `.env.local` (git-ignored); `.env.example` documents the keys.

---

## 8. Build, run, deploy

```bash
# Web app
npm install
npm run dev            # http://localhost:3000
npm run build          # production build (Turbopack)

# Data pipeline (offline)
cd ml && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m pipeline.integrate               # NHANES → schema → parquet
python -m pipeline.build_nhanes_reference  # → data/processed/nhanes_reference.json
```

**Deploy:** import the repo in Vercel (auto-detects Next.js). Committed
`data/processed/*.json` ships with the build; no Python runtime needed. Add
env vars from `.env.example` when the optional LLM summarization is enabled.

---

## 9. Licensing

- **Code:** MIT (`LICENSE`).
- **Data artifacts / docs:** CC-BY-4.0 (`LICENSE-DATA`).
- Upstream datasets (mcPHASES, NHANES) remain under their own terms and are not
  redistributed here.

---

## 10. Roadmap (post-scaffold)

- Implement `load_mcphases.py` after PhysioNet credentialing → regenerate
  `insights.sample.json` with real longitudinal cycle-phase statistics.
- Add bootstrap confidence intervals to reported means/correlations.
- Optional OpenAI-based natural-language summarization of the computed statistics
  (`OPENAI_API_KEY` already scaffolded in `.env.example`).
- A future, separately-trained model for pregnancy/postpartum populations
  (requires trimester-specific datasets; explicitly out of scope now).
