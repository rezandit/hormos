# Benchmark Methodology — HormOS

> **Status:** skeleton. Defines how HormOS computes and (later) evaluates its
> symptom-to-cycle-phase insight so results are transparent and reproducible —
> directly addressing the challenge's Technical Excellence criterion.

## 1. Problem statement

Hormones shift continuously, but clinical visits capture only snapshots. HormOS
addresses **symptom-to-cycle-phase association**: given daily self-reported
symptoms, characterize how they relate to menstrual cycle phases using
population data.

## 2. Cycle-phase derivation

First-iteration rule-based mapping from day-in-cycle (see
`ml/pipeline/load_mcphases.py::derive_cycle_phase`), assuming a nominal 28-day
cycle:

| Phase | Cycle day |
|---|---|
| Menstrual | 1–5 |
| Follicular | 6–13 |
| Ovulatory | 14–16 |
| Luteal | 17–end |

TODO: refine with hormone-confirmed ovulation (LH/progesterone from mcPHASES)
and variable cycle lengths; document the improvement and its effect.

## 3. Metrics (descriptive, current iteration)

- **Per-phase mean symptom severity** (0–3 scale) — central tendency per phase.
- **Symptom peak phase** — `argmax` over phase means per symptom.
- **Pearson correlations** — selected pairs (e.g. sleep vs. fatigue) with `n`.
- **Phase similarity** — Euclidean distance between a user's reported symptoms
  and each phase's mean profile, normalized to a 0–100 similarity.

TODO: add confidence intervals / bootstrap for the reported means & r values.

## 4. Train / val / test split (future model iteration)

TODO: define subject-level (not row-level) splits to prevent leakage across a
subject's longitudinal records; report split sizes and seed.

## 5. Baselines (future model iteration)

TODO: compare any predictive model against:
- majority-phase baseline,
- symptom-mean nearest-phase (the current descriptive engine),
- and document metric deltas.

## 6. Reproducibility checklist

- [ ] Exact dataset versions/cycles pinned (dataset card §2).
- [ ] Dependency versions frozen (`ml/requirements.txt`).
- [ ] Deterministic seeds recorded.
- [ ] Command sequence + output artifact checksums documented.
- [ ] Open license on code (MIT) and artifacts (CC-BY-4.0).

## 7. Limitations

- Rule-based phase labels are approximate.
- Self-report is noisy/subjective.
- Committed artifact is currently a labeled synthetic placeholder.
