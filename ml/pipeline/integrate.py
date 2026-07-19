"""Integrate per-source frames into one unified `daily_observation` table.

Concatenates the schema-conforming outputs of the source loaders, validates
column presence against the unified schema, and writes a local parquet export.
The parquet is git-ignored (may be large / derived from credentialed data);
only small aggregated artifacts (see build_insights.py) are committed.
"""

from __future__ import annotations

import pandas as pd

from . import config, load_mcphases, load_nhanes


def _validate_columns(df: "pd.DataFrame", expected: list[str], name: str) -> None:
    missing = [c for c in expected if c not in df.columns]
    if missing:
        raise ValueError(f"{name} is missing required schema columns: {missing}")


def build_integrated() -> tuple["pd.DataFrame", "pd.DataFrame"]:
    """Load every available source, map to schema, and concatenate.

    Returns (subject_df, daily_observation_df). Sources that are not yet
    available (e.g. mcPHASES pre-credentialing) are skipped with a warning so
    the pipeline still runs on partial data.
    """
    config.ensure_dirs()
    subject_frames: list[pd.DataFrame] = []
    daily_frames: list[pd.DataFrame] = []

    # NHANES (public).
    try:
        nhanes_raw = load_nhanes.download_nhanes()
        nhanes_subject, nhanes_daily = load_nhanes.to_unified_schema(nhanes_raw)
        subject_frames.append(nhanes_subject)
        daily_frames.append(nhanes_daily)
    except NotImplementedError:
        print("[integrate] NHANES mapping not implemented yet — skipping.")
    except Exception as exc:  # network / file errors shouldn't kill the run
        print(f"[integrate] NHANES unavailable: {exc}")

    # mcPHASES (credentialed).
    try:
        mc_subject, mc_daily = load_mcphases.to_unified_schema()
        subject_frames.append(mc_subject)
        daily_frames.append(mc_daily)
    except (NotImplementedError, FileNotFoundError) as exc:
        print(f"[integrate] mcPHASES unavailable: {exc}")

    if not daily_frames:
        raise RuntimeError(
            "No source produced data. Implement at least one loader mapping first."
        )

    subjects = pd.concat(subject_frames, ignore_index=True).reindex(
        columns=config.SUBJECT_COLUMNS
    )
    integrated = pd.concat(daily_frames, ignore_index=True).reindex(
        columns=config.DAILY_OBSERVATION_COLUMNS
    )
    _validate_columns(subjects, config.SUBJECT_COLUMNS, "subject")
    _validate_columns(integrated, config.DAILY_OBSERVATION_COLUMNS, "integrated")
    return subjects, integrated


def main() -> None:
    subjects, df = build_integrated()
    subjects.to_parquet(config.SUBJECT_PARQUET, index=False)
    df.to_parquet(config.INTEGRATED_PARQUET, index=False)
    print(
        f"[integrate] wrote {len(subjects)} subjects -> {config.SUBJECT_PARQUET}\n"
        f"[integrate] wrote {len(df)} daily rows -> {config.INTEGRATED_PARQUET} "
        "(both git-ignored)."
    )


if __name__ == "__main__":
    main()
