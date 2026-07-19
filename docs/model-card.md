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

## 2a. Population scope / Out-of-scope populations

**In scope:** non-pregnant individuals with a menstrual cycle. The engine
characterizes symptoms relative to four cyclical phases
(menstrual / follicular / ovulatory / luteal).

**Explicitly out of scope: pregnancy, active conception planning, and early
postpartum (< 6 months).** This is a deliberate, documented limitation:

- The underlying reference data (mcPHASES) recruits participants who menstruate
  — i.e. a non-pregnant, cyclical population. NHANES contributes cross-sectional
  reference context, not pregnancy-specific longitudinal signals.
- Pregnancy has a fundamentally different, **non-cyclical** hormonal profile
  (sustained high hCG; progesterone/estrogen rising continuously from the
  placenta). It does not fit the four-phase model at all.
- Pregnancy symptoms (fatigue, nausea, brain fog) overlap heavily with luteal/PMS
  symptoms, so the model would produce a technically valid but **substantively
  misleading** phase match.

**Mitigation (this iteration):** a pre-form **screening gate** in the app asks
whether the user is pregnant, trying to conceive, or postpartum (< 6 months).
If yes, the symptom form is not shown and a neutral, empathetic message directs
them to their care provider. The answer is ephemeral client-side state — it is
**not stored, transmitted, or logged** (no consent flow exists to collect
pregnancy status). Building a pregnancy-appropriate model would require
trimester-specific datasets and is out of scope for this iteration.

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
