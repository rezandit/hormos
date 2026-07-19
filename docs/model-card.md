# Model Card — HormOS Symptom-to-Cycle-Phase Insight

> **Status:** skeleton. The current iteration ships a **statistical insight
> engine**, not a trained ML model. This card documents that method now and
> reserves sections for a future model iteration.

## 1. What it is (current iteration)

- **Not a model** in the ML sense — a transparent, descriptive-statistics engine.
- Given self-reported daily symptom severities (0–3), it computes Euclidean
  similarity to each cycle phase's population mean symptom profile and returns a
  ranked match plus each symptom's typical peak phase and selected correlations.
- Fully deterministic and inspectable; every output traces to a documented
  statistic in the insight artifact.

## 2. Intended use & users

- **Intended:** research/education demonstration of turning longitudinal symptom
  logs into cycle-phase context; a reusable app layer over open data.
- **Out of scope:** diagnosis, treatment, clinical decision-making, or any
  individual medical claim.

## 3. Inputs / outputs

- **Input:** `{ symptoms: { fatigue|migraine|mood|brain_fog|cramps: 0-3 } }`
- **Output:** best-match phase + similarity, ranked phases, per-symptom peak
  phase, correlations, and provenance metadata.
- **Artifact consumed:** `data/processed/insights.sample.json`.

## 4. Methodology & reproducibility

- Statistics computed by [`../ml/pipeline/build_insights.py`](../ml/pipeline/build_insights.py).
- Similarity logic in [`../lib/insights.ts`](../lib/insights.ts).
- See [`benchmark-methodology.md`](./benchmark-methodology.md) for definitions,
  splits, and baselines.

TODO (future model iteration): algorithm, training data split, hyperparameters,
checkpoint location, evaluation metrics vs. baseline.

## 5. Limitations & risks

- Population-level patterns do **not** predict any individual's phase or health.
- Current artifact is a labeled **synthetic placeholder** pending real data.
- Self-reported symptoms are noisy and subjective.

## 6. Ethical considerations & disclaimer

- **Not a medical device. Not diagnostic.** Always shown with an in-app
  disclaimer.
- No PII stored or transmitted; inputs are processed transiently.

## 7. License

- Code: MIT. Cards/artifacts: CC-BY-4.0.
