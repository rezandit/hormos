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
| `load_nhanes.py` | Download + parse NHANES `.XPT` files (CDC, public), map to unified schema. | skeleton (download works; mapping = TODO) |
| `load_mcphases.py` | Parse mcPHASES (PhysioNet, credentialed), map to unified schema. | placeholder (blocked on PhysioNet credentialing) |
| `integrate.py` | Concatenate per-source frames into one `daily_observation` table + write processed export. | skeleton |
| `build_insights.py` | Compute symptom-to-cycle-phase statistics + correlations, write `data/processed/insights.sample.json`. | skeleton |

## Typical run

```bash
cd ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 1. Download + map public NHANES data (safe: public, de-identified)
python -m pipeline.load_nhanes

# 2. (After PhysioNet approval) place mcPHASES files under data/raw/mcphases/
python -m pipeline.load_mcphases

# 3. Integrate to the unified schema
python -m pipeline.integrate

# 4. Recompute the insight artifact consumed by the app
python -m pipeline.build_insights
```

## Data governance

- Raw downloads land in `data/raw/` which is **git-ignored**. Never commit raw
  data. Treat everything as sensitive-by-default even though it is de-identified.
- Only small, de-identified, aggregated/sample artifacts are committed to
  `data/processed/` (allow-listed in `.gitignore`).
