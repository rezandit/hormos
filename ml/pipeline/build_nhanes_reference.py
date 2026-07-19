"""Build the REAL NHANES population-reference artifact consumed by the app.

Unlike the symptom-to-cycle-phase insight (which needs mcPHASES longitudinal
data), this artifact is computed entirely from public NHANES and therefore
contains real numbers today. It provides population reference context for
adult women: thyroid TSH distribution (overall + by age band) and reproductive
demographics.

Every value is a plain descriptive statistic. No modeling, no diagnosis.
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd

from . import config, load_nhanes

# Commonly-cited laboratory reference interval for TSH, shown as descriptive
# CONTEXT ONLY (not a clinical threshold and not a diagnosis).
TSH_REF_LOW = 0.4
TSH_REF_HIGH = 4.0

AGE_BANDS = [(18, 29), (30, 39), (40, 49), (50, 59), (60, 120)]


def _summ(series: "pd.Series") -> dict:
    s = series.dropna()
    if s.empty:
        return {"n": 0}
    return {
        "n": int(s.size),
        "mean": round(float(s.mean()), 2),
        "median": round(float(s.median()), 2),
        "p10": round(float(np.percentile(s, 10)), 2),
        "p25": round(float(np.percentile(s, 25)), 2),
        "p75": round(float(np.percentile(s, 75)), 2),
        "p90": round(float(np.percentile(s, 90)), 2),
    }


def build_reference(subject: "pd.DataFrame", daily: "pd.DataFrame") -> dict:
    df = subject.merge(
        daily[["subject_id", "hormone_tsh"]], on="subject_id", how="left"
    )
    df = df[df["source_dataset"] == "nhanes"].copy()
    df["age_years"] = pd.to_numeric(df["age_years"], errors="coerce")

    tsh = df["hormone_tsh"].dropna()
    within = int(((tsh >= TSH_REF_LOW) & (tsh <= TSH_REF_HIGH)).sum())
    below = int((tsh < TSH_REF_LOW).sum())
    above = int((tsh > TSH_REF_HIGH).sum())
    total_tsh = int(tsh.size)

    tsh_by_age = {}
    for lo, hi in AGE_BANDS:
        band = df[(df["age_years"] >= lo) & (df["age_years"] <= hi)]["hormone_tsh"]
        label = f"{lo}-{hi}" if hi < 120 else f"{lo}+"
        tsh_by_age[label] = _summ(band)

    def _count(col: str) -> dict:
        return {
            str(k): int(v)
            for k, v in df[col].value_counts(dropna=False).items()
            if str(k) != "nan" and str(k) != ""
        }

    return {
        "artifact": "hormos_nhanes_reference",
        "schema_ref": config.SCHEMA_NAME,
        "version": "0.1.0",
        "generated_by": "ml/pipeline/build_nhanes_reference.py",
        "source": {
            "dataset": "NHANES",
            "provider": "CDC / National Center for Health Statistics",
            "cycle": config.NHANES_CYCLE,
            "files": ["DEMO_G", "RHQ_G", "THYROD_G"],
            "population": "Adult women (age >= 18) with an examination record.",
            "license": "Public domain (US Government work).",
        },
        "data_status": "REAL — derived from public NHANES data.",
        "disclaimer": (
            "Descriptive population statistics for research/education only. "
            "The TSH reference interval shown is generic laboratory context, "
            "not a clinical threshold, and this is not a diagnosis."
        ),
        "n_women": int(len(df)),
        "tsh": {
            "unit": "mIU/L",
            "reference_interval": {"low": TSH_REF_LOW, "high": TSH_REF_HIGH},
            "overall": _summ(df["hormone_tsh"]),
            "by_age_band": tsh_by_age,
            "distribution_vs_reference": {
                "n": total_tsh,
                "within_pct": round(100 * within / total_tsh, 1) if total_tsh else None,
                "below_pct": round(100 * below / total_tsh, 1) if total_tsh else None,
                "above_pct": round(100 * above / total_tsh, 1) if total_tsh else None,
            },
        },
        "reproductive": {
            "menopausal_status": _count("menopausal_status"),
        },
    }


def main() -> None:
    frames = load_nhanes.download_nhanes()
    subject, daily = load_nhanes.to_unified_schema(frames)
    ref = build_reference(subject, daily)
    config.NHANES_REFERENCE_ARTIFACT.write_text(json.dumps(ref, indent=2))
    print(f"[nhanes-ref] wrote {config.NHANES_REFERENCE_ARTIFACT}")
    print(json.dumps(ref["tsh"]["overall"], indent=2))


if __name__ == "__main__":
    main()
