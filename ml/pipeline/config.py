"""Shared configuration for the HormOS pipeline.

Centralizes paths, schema field names, and constants so every module writes to
the same locations and speaks the same schema. Keep this the single source of
truth to preserve reproducibility.
"""

from __future__ import annotations

import os
from pathlib import Path

# --- Paths -----------------------------------------------------------------
# Repo root = two levels up from this file (ml/pipeline/config.py -> repo root).
REPO_ROOT = Path(__file__).resolve().parents[2]

RAW_DIR = Path(os.environ.get("HORMOS_RAW_DATA_DIR", REPO_ROOT / "data" / "raw"))
PROCESSED_DIR = Path(
    os.environ.get("HORMOS_PROCESSED_DATA_DIR", REPO_ROOT / "data" / "processed")
)
SCHEMA_PATH = REPO_ROOT / "data" / "schema" / "hormos_schema.json"

RAW_NHANES_DIR = RAW_DIR / "nhanes"
RAW_MCPHASES_DIR = RAW_DIR / "mcphases"

# Integrated table (local/large — git-ignored) and the small app artifacts.
INTEGRATED_PARQUET = PROCESSED_DIR / "daily_observation.parquet"
SUBJECT_PARQUET = PROCESSED_DIR / "subject.parquet"
INSIGHTS_ARTIFACT = PROCESSED_DIR / "insights.sample.json"
# Real, committed reference artifact derived from public NHANES.
NHANES_REFERENCE_ARTIFACT = PROCESSED_DIR / "nhanes_reference.json"

# NHANES survey cycle used. 2011-2012 (suffix "G") is chosen because it is the
# most recent cycle that ships DEMO + RHQ + THYROD together (the thyroid panel
# was not collected in 2017-2018). Pinning the cycle keeps results reproducible.
NHANES_CYCLE = "2011-2012"
NHANES_CYCLE_SUFFIX = "G"
NHANES_CYCLE_YEAR = "2011"  # first year, used in the CDC public download path

# --- Schema constants ------------------------------------------------------
SCHEMA_NAME = "hormos_unified_longitudinal_v0"

CYCLE_PHASES = ["menstrual", "follicular", "ovulatory", "luteal"]

# Symptom columns tracked in the current iteration (0-3 ordinal scale).
SYMPTOM_FIELDS = [
    "symptom_fatigue",
    "symptom_migraine",
    "symptom_mood",
    "symptom_brain_fog",
    "symptom_cramps",
]

# Short symptom keys used in the app artifact (strip the "symptom_" prefix).
SYMPTOM_KEYS = [f.replace("symptom_", "") for f in SYMPTOM_FIELDS]

DAILY_OBSERVATION_COLUMNS = [
    "subject_id",
    "observation_date",
    "cycle_day",
    "cycle_phase",
    *SYMPTOM_FIELDS,
    "sleep_hours",
    "sleep_quality",
    "stress_level",
    "steps",
    "resting_hr",
    "glucose_mean",
    "hormone_estradiol",
    "hormone_progesterone",
    "hormone_lh",
    "hormone_fsh",
    "hormone_tsh",
]

SUBJECT_COLUMNS = [
    "subject_id",
    "source_dataset",
    "age_years",
    "menopausal_status",
    "reproductive_notes",
]


def ensure_dirs() -> None:
    """Create the working directories if they do not exist."""
    for d in (RAW_NHANES_DIR, RAW_MCPHASES_DIR, PROCESSED_DIR):
        d.mkdir(parents=True, exist_ok=True)
