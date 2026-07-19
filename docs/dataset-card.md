# Dataset Card — HormOS Unified Longitudinal Dataset

> **Status:** skeleton / work-in-progress. Fields below map directly to the
> challenge success criteria (reproducibility, transparent methodology, open
> license). Fill each `TODO` before submission.

## 1. Overview

- **Name:** HormOS Unified Longitudinal Dataset (`hormos_unified_longitudinal_v0`)
- **Purpose:** Harmonize heterogeneous women's hormonal-health datasets into a
  single reusable schema so symptom-to-cycle-phase insights are reproducible
  and source-independent.
- **Schema definition:** [`../data/schema/hormos_schema.json`](../data/schema/hormos_schema.json)
- **License:** CC-BY-4.0 for the schema + HormOS-derived artifacts. Upstream raw
  data retains its own license (see §4).

## 2. Source datasets

| Source | Provider | Access | Role in HormOS |
|---|---|---|---|
| **mcPHASES** | PhysioNet | Credentialed (DUA + training) | Longitudinal core: wearable, CGM, hormones, cycle, sleep, symptoms |
| **NHANES 2011-2012** | CDC | Public, de-identified | Population reference: thyroid (TSH), reproductive health, demographics |

- **NHANES cycle used: 2011-2012** (files `DEMO_G`, `RHQ_G`, `THYROD_G`). This
  is the most recent cycle shipping DEMO + RHQ + THYROD together; the thyroid
  panel was not collected in 2017-2018. Scope: adult women (age ≥ 18).
  Produces 2,967 subjects; 841 with a TSH lab result.
- mcPHASES version: TODO (pending PhysioNet credentialing).

## 3. Schema summary

- Grain: one row per `(subject_id, observation_date)` in `daily_observation`;
  one row per person in `subject`.
- Symptom severity harmonized to an ordinal **0–3** scale.
- Cycle phase derived; see
  [`benchmark-methodology.md`](./benchmark-methodology.md).

TODO: per-field coverage table (which source populates which field, % non-null).

## 3a. Population scope / Out-of-scope populations

**In scope:** non-pregnant individuals with a menstrual cycle (cyclical hormonal
profile).

**Explicitly out of scope: pregnancy, conception planning, and early postpartum
(< 6 months).** This follows directly from how the source data was collected:

- **mcPHASES** recruits participants who menstruate ("young adults who
  menstruate") — a non-pregnant, cyclical population. It contains no
  pregnancy trimester-specific cohort.
- **NHANES** here contributes cross-sectional reference context (thyroid,
  demographics), not pregnancy longitudinal signals.
- Pregnancy's hormonal profile is **non-cyclical** (sustained high hCG;
  placental progesterone/estrogen rising continuously) and does not map onto the
  four-phase cycle model this dataset supports.

Any downstream model built on this schema therefore **must not** be applied to
pregnant, conceiving, or early-postpartum users. The HormOS app enforces this
with a pre-form screening gate (see `docs/model-card.md` §2a). Supporting these
populations would require separate, trimester-specific datasets.

## 4. Provenance, licensing & ethics

- **Raw data is never redistributed** in this repo (`data/raw/` is git-ignored).
- mcPHASES governed by the PhysioNet Credentialed Health Data Use Agreement.
- NHANES is public domain (US Government work), still treated as
  sensitive-by-default.
- Only small, de-identified, aggregated/sample artifacts are committed.

TODO: link to upstream license texts; confirm redistribution terms for any
derived samples.

## 5. Reproducibility

- Integration pipeline: [`../ml/pipeline/`](../ml/pipeline/) (Python).
- Steps to regenerate from scratch: see `ml/pipeline/README.md`.

TODO: pin exact dependency versions and record the command sequence + checksums
of produced artifacts.

## 6. Known limitations

- mcPHASES mapping pending credentialing (placeholder loader).
- Committed insight artifact is currently a labeled **synthetic placeholder**.
- Cross-sectional NHANES contributes reference context, not cycle-level series.

TODO: sample-size / demographic-coverage limitations once real data is loaded.
