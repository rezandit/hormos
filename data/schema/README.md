# HormOS Unified Schema (Dataset Card — short form)

This folder defines the **reusable foundation artifact** of HormOS: a single,
source-agnostic longitudinal schema that heterogeneous women's hormonal-health
datasets are harmonized into. It is what keeps HormOS from being an "isolated
application" and gives it **Foundation Value** (see the challenge design
context, §3).

- Machine-readable definition: [`hormos_schema.json`](./hormos_schema.json)
- Human dataset card: [`../../docs/dataset-card.md`](../../docs/dataset-card.md)

## Why a unified schema?

mcPHASES (PhysioNet) and NHANES (CDC) encode overlapping concepts very
differently (wearable time series vs. cross-sectional lab panels; different
symptom scales; different identifiers). The HormOS pipeline maps both into one
shape so that a symptom-to-cycle-phase insight can be computed the same way
regardless of source. Any future dataset can be onboarded by writing one adapter
that emits rows in this schema.

## Grain & shape

- `subject` — one de-identified row per person (provenance + demographics).
- `daily_observation` — one row per `(subject_id, observation_date)`, sparse:
  each source fills only the fields it actually measures.

Symptom severities are harmonized to an ordinal **0–3** scale
(0=none, 1=mild, 2=moderate, 3=severe). Cycle phase is a derived label; the
derivation rules live in
[`../../docs/benchmark-methodology.md`](../../docs/benchmark-methodology.md).

## Licensing / provenance

- The schema and any HormOS-derived artifacts: **CC-BY-4.0** (see `LICENSE-DATA`).
- Upstream raw data is **never redistributed** here; it stays under PhysioNet /
  CDC terms and is git-ignored (`data/raw/`).

> Research/education only. Not medical advice, not a diagnostic tool.
