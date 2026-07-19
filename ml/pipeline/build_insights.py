"""Compute the symptom-to-cycle-phase insight artifact consumed by the app.

Reads the integrated `daily_observation` table, computes transparent,
reproducible statistics (per-phase mean symptom severity, each symptom's peak
phase, and a few Pearson correlations), and writes a small JSON artifact to
`data/processed/insights.sample.json`.

No black-box modeling in this iteration — every number is a documented
descriptive statistic (see docs/benchmark-methodology.md). This is deliberately
simple so results are fully reproducible and defensible for the hackathon.
"""

from __future__ import annotations

import json

import pandas as pd

from . import config

# Correlation pairs to report (column_a, column_b, human note).
CORRELATION_PAIRS = [
    ("sleep_hours", "symptom_fatigue", "Sleep hours vs. fatigue."),
    ("stress_level", "symptom_mood", "Stress vs. mood severity."),
    ("sleep_quality", "symptom_brain_fog", "Sleep quality vs. brain fog."),
]


def compute_insights(df: "pd.DataFrame") -> dict:
    """Compute descriptive statistics from the integrated daily table."""
    df = df[df["cycle_phase"].isin(config.CYCLE_PHASES)].copy()

    phase_symptom_means: dict[str, dict[str, float]] = {}
    for phase in config.CYCLE_PHASES:
        sub = df[df["cycle_phase"] == phase]
        phase_symptom_means[phase] = {
            key: round(float(sub[field].mean()), 2)
            for key, field in zip(config.SYMPTOM_KEYS, config.SYMPTOM_FIELDS)
            if sub[field].notna().any()
        }

    symptom_peak_phase: dict[str, dict] = {}
    for key, field in zip(config.SYMPTOM_KEYS, config.SYMPTOM_FIELDS):
        per_phase = {
            phase: phase_symptom_means[phase].get(key)
            for phase in config.CYCLE_PHASES
            if phase_symptom_means[phase].get(key) is not None
        }
        if per_phase:
            peak = max(per_phase, key=per_phase.get)
            symptom_peak_phase[key] = {"phase": peak, "mean": per_phase[peak]}

    correlations = []
    for a, b, note in CORRELATION_PAIRS:
        pair = df[[a, b]].dropna()
        if len(pair) > 2:
            r = pair[a].corr(pair[b])
            correlations.append(
                {"a": a, "b": b, "pearson_r": round(float(r), 2), "n": int(len(pair)), "note": note}
            )

    return {
        "artifact": "hormos_symptom_phase_insight",
        "schema_ref": config.SCHEMA_NAME,
        "version": "0.1.0",
        "generated_by": "ml/pipeline/build_insights.py",
        "data_status": "Derived from integrated data.",
        "disclaimer": (
            "Research/education only. These are population-level statistical "
            "patterns, not medical advice and not a diagnosis. Individual "
            "experiences vary."
        ),
        "n_subjects": int(df["subject_id"].nunique()),
        "n_observations": int(len(df)),
        "phases": config.CYCLE_PHASES,
        "symptoms": config.SYMPTOM_KEYS,
        "scale": {"min": 0, "max": 3, "labels": ["none", "mild", "moderate", "severe"]},
        "phase_symptom_means": phase_symptom_means,
        "symptom_peak_phase": symptom_peak_phase,
        "correlations": correlations,
    }


def main() -> None:
    if not config.INTEGRATED_PARQUET.exists():
        raise FileNotFoundError(
            f"Missing {config.INTEGRATED_PARQUET}. Run `python -m pipeline.integrate` first."
        )
    df = pd.read_parquet(config.INTEGRATED_PARQUET)
    insights = compute_insights(df)
    config.INSIGHTS_ARTIFACT.write_text(json.dumps(insights, indent=2))
    print(f"[insights] wrote {config.INSIGHTS_ARTIFACT}")


if __name__ == "__main__":
    main()
