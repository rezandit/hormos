"""Load NHANES (CDC) data and map it into the HormOS unified schema.

NHANES is public and de-identified. We download the SAS transport (`.XPT`)
files directly from CDC, then map the relevant demographic / reproductive /
thyroid columns into `subject` + `daily_observation` frames.

NHANES is cross-sectional (one exam per participant), so each participant
contributes a single `daily_observation` row with `cycle_phase = "unknown"`.
Its value here is population-level reference context (thyroid TSH, reproductive
demographics), not longitudinal cycle tracking — that comes from mcPHASES.

Cycle used: NHANES 2011-2012 (suffix "G"). It is the most recent cycle that
ships DEMO + RHQ + THYROD together; the thyroid panel was not collected in
2017-2018. Pinned in `config.py` for reproducibility.

Key variables (2011-2012):
  DEMO_G:   SEQN, RIAGENDR (1=male, 2=female), RIDAGEYR (age years),
            RIDEXPRG (pregnancy status at exam)
  THYROD_G: LBXTSH1 (thyroid stimulating hormone, mIU/L)
  RHQ_G:    RHQ031 (had regular periods in past 12 months: 1=yes, 2=no),
            RHQ060 (age at last menstrual period; present => post-menopausal),
            RHQ540 (ever used female hormones: 1=yes, 2=no)
"""

from __future__ import annotations

import io

import pandas as pd
import requests

from . import config

# CDC public data files. Path pattern (post-2024 site layout):
#   https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/<year>/DataFiles/<FILE>.xpt
NHANES_BASE = (
    f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{config.NHANES_CYCLE_YEAR}/DataFiles"
)

_S = config.NHANES_CYCLE_SUFFIX  # "G"
NHANES_FILES = {
    "demographics": f"DEMO_{_S}.xpt",
    "reproductive": f"RHQ_{_S}.xpt",
    "thyroid": f"THYROD_{_S}.xpt",
}

# NHANES "don't know / refused" sentinel codes to treat as missing.
_MISSING_CODES = {7, 9, 77, 99, 777, 999, 7777, 9999}


def download_nhanes(force: bool = False) -> dict[str, "pd.DataFrame"]:
    """Download the configured NHANES .XPT components into data/raw/nhanes/.

    Returns a dict of {component_name: DataFrame}. Public data, safe to fetch.
    """
    config.ensure_dirs()
    frames: dict[str, pd.DataFrame] = {}
    for name, filename in NHANES_FILES.items():
        dest = config.RAW_NHANES_DIR / filename
        if force or not dest.exists():
            url = f"{NHANES_BASE}/{filename}"
            print(f"[nhanes] downloading {url}")
            resp = requests.get(url, timeout=180)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
        frames[name] = pd.read_sas(io.BytesIO(dest.read_bytes()), format="xport")
        print(f"[nhanes] {name}: {frames[name].shape[0]} rows")
    return frames


def _menopausal_status(row: "pd.Series") -> str:
    """Coarse, documented derivation of menopausal status from RHQ variables."""
    last_period_age = row.get("RHQ060")
    if pd.notna(last_period_age) and 20 <= last_period_age <= 80:
        return "post"
    regular = row.get("RHQ031")
    if regular in (1.0, 2.0):
        return "pre"
    return "unknown"


def _reproductive_notes(row: "pd.Series") -> str:
    parts = []
    regular = row.get("RHQ031")
    if regular == 1.0:
        parts.append("regular_periods_past_year")
    elif regular == 2.0:
        parts.append("irregular_or_no_periods_past_year")
    hormones = row.get("RHQ540")
    if hormones == 1.0:
        parts.append("ever_used_female_hormones")
    return ";".join(parts)


def to_unified_schema(
    frames: dict[str, "pd.DataFrame"],
) -> tuple["pd.DataFrame", "pd.DataFrame"]:
    """Map raw NHANES frames into (subject_df, daily_observation_df).

    Scope: adult women (RIAGENDR == 2, RIDAGEYR >= 18). Each contributes one
    cross-sectional daily_observation row (cycle_phase = "unknown").
    """
    demo = frames["demographics"]
    thy = frames["thyroid"][["SEQN", "LBXTSH1"]].copy()
    rhq = frames["reproductive"][["SEQN", "RHQ031", "RHQ060", "RHQ540"]].copy()

    # Clean sentinel "don't know / refused" codes to NaN on coded columns.
    for col in ["RHQ031", "RHQ540"]:
        rhq[col] = rhq[col].where(~rhq[col].isin(_MISSING_CODES))

    women = demo[(demo["RIAGENDR"] == 2) & (demo["RIDAGEYR"] >= 18)].copy()
    women = women.merge(thy, on="SEQN", how="left").merge(rhq, on="SEQN", how="left")

    women["subject_id"] = "nhanes:" + women["SEQN"].astype("int64").astype(str)

    subject = pd.DataFrame(
        {
            "subject_id": women["subject_id"],
            "source_dataset": "nhanes",
            "age_years": women["RIDAGEYR"].astype("Int64"),
            "menopausal_status": women.apply(_menopausal_status, axis=1),
            "reproductive_notes": women.apply(_reproductive_notes, axis=1),
        }
    ).reindex(columns=config.SUBJECT_COLUMNS)

    daily = pd.DataFrame({"subject_id": women["subject_id"]})
    daily["observation_date"] = config.NHANES_CYCLE  # cross-sectional label
    daily["cycle_day"] = pd.NA
    daily["cycle_phase"] = "unknown"
    for field in config.SYMPTOM_FIELDS:
        daily[field] = pd.NA
    for field in [
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
    ]:
        daily[field] = pd.NA
    daily["hormone_tsh"] = women["LBXTSH1"].values
    daily = daily.reindex(columns=config.DAILY_OBSERVATION_COLUMNS)

    print(
        f"[nhanes] mapped {len(subject)} adult women; "
        f"{int(daily['hormone_tsh'].notna().sum())} with TSH measurements."
    )
    return subject, daily


def main() -> None:
    frames = download_nhanes()
    subject, daily = to_unified_schema(frames)
    print("[nhanes] subject head:\n", subject.head().to_string(index=False))
    print("[nhanes] daily_observation columns:", list(daily.columns))


if __name__ == "__main__":
    main()
