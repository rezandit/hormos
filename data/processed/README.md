# data/processed

Integrated, schema-conforming artifacts derived by the HormOS pipeline
(`ml/pipeline/`). These are the outputs consumed by the Next.js API routes at
runtime (Python does **not** run on Vercel — only these static artifacts do).

## What may live here

- `*.sample.json` / `*.sample.csv` — small, versioned, de-identified samples
  that are safe to commit and are allow-listed in `.gitignore`.
- Larger integrated tables (full `daily_observation` exports) should stay local
  or use Git LFS; they are git-ignored by default.

## Files

- `insights.sample.json` — **precomputed** symptom-to-cycle-phase statistics
  consumed by `app/api/insight`. The version committed now is a clearly-labeled
  **synthetic placeholder** so the demo runs before PhysioNet credentialing is
  complete. It will be regenerated from real integrated data by
  `ml/pipeline/build_insights.py`.

> Research/education only. Not medical advice, not a diagnostic tool.
