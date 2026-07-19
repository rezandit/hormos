# HormOS data pipeline

Reusable preprocessing that integrates upstream datasets into the
**HormOS unified schema** (`data/schema/hormos_schema.json`) and produces the
static artifacts the Next.js app consumes.

> This pipeline runs **locally / offline**. It never runs on Vercel. Its outputs
> (`data/processed/*.json`) are the only things the deployed app reads.

## Modules

| File | Purpose | Status |
|---|---|---|
| `config.py` | Shared paths, constants, schema field names. | ready |
| `load_nhanes.py` | Download + parse NHANES `.XPT` files (CDC, public), map adult women to the unified schema (demographics, reproductive, TSH). | **implemented** (NHANES 2011-2012) |
| `load_mcphases.py` | Parse mcPHASES (PhysioNet, credentialed), map to unified schema. | placeholder (blocked on PhysioNet credentialing) |
| `integrate.py` | Concatenate per-source frames into `subject` + `daily_observation` tables + write parquet exports. | implemented |
| `build_nhanes_reference.py` | Compute the **real** NHANES population-reference artifact (TSH distribution, reproductive demographics) → `data/processed/nhanes_reference.json`. | **implemented** |
| `build_insights.py` | Compute symptom-to-cycle-phase statistics + correlations → `data/processed/insights.sample.json`. | needs mcPHASES (NHANES has no cycle-phase data) |

## Typical run

```bash
cd ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 1. Download + map public NHANES data (safe: public, de-identified)
python -m pipeline.load_nhanes

# 2. Integrate to the unified schema (subject + daily_observation parquet)
python -m pipeline.integrate

# 3. Build the REAL NHANES reference artifact consumed by the app
python -m pipeline.build_nhanes_reference

# 4. (After PhysioNet approval) place mcPHASES files under data/raw/mcphases/,
#    implement load_mcphases, then compute the cycle-phase insight artifact
python -m pipeline.load_mcphases
python -m pipeline.build_insights
```

> The NHANES steps run today end-to-end and produce
> `data/processed/nhanes_reference.json` with real numbers. The
> symptom-to-cycle-phase `insights.sample.json` remains a labeled synthetic
> sample until mcPHASES is available, because NHANES is cross-sectional and has
> no daily cycle-phase data.

## Data governance

- Raw downloads land in `data/raw/` which is **git-ignored**. Never commit raw
  data. Treat everything as sensitive-by-default even though it is de-identified.
- Only small, de-identified, aggregated/sample artifacts are committed to
  `data/processed/` (allow-listed in `.gitignore`).
