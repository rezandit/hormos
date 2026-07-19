"""Load NHANES (CDC) data and map it into the HormOS unified schema.

NHANES is public and de-identified. We download the SAS transport (`.XPT`)
files directly from CDC, then map the relevant reproductive-health / hormone /
demographic columns into `subject` + `daily_observation` frames.

NHANES is cross-sectional (one exam per participant), so each participant
contributes a single `daily_observation` row with `cycle_phase = "unknown"`.
Its value here is population-level reference context (e.g. thyroid TSH,
reproductive demographics) rather than longitudinal cycle tracking.

Status: download works; the column mapping is intentionally left as a
documented TODO so the mapping is reviewed against the exact NHANES cycle/year
chosen for the submission (reproducibility matters — see
docs/benchmark-methodology.md).
"""

from __future__ import annotations

import pandas as pd
import requests

from . import config

# NHANES public file base. Each survey cycle (e.g. 2017-2018 = "J" suffix)
# hosts component files as .XPT. Pick the cycle explicitly for reproducibility.
NHANES_BASE = "https://wwwn.cdc.gov/Nchs/Nhanes"

# Example components relevant to hormonal health. Confirm exact filenames for
# the chosen cycle before relying on these.
NHANES_FILES = {
    "demographics": "2017-2018/DEMO_J.XPT",
    "thyroid": "2017-2018/THYROD_J.XPT",
    "reproductive": "2017-2018/RHQ_J.XPT",
}


def download_nhanes(force: bool = False) -> dict[str, "pd.DataFrame"]:
    """Download the configured NHANES .XPT components into data/raw/nhanes/.

    Returns a dict of {component_name: DataFrame}. Public data, safe to fetch.
    """
    config.ensure_dirs()
    frames: dict[str, pd.DataFrame] = {}
    for name, rel_path in NHANES_FILES.items():
        dest = config.RAW_NHANES_DIR / rel_path.split("/")[-1]
        if force or not dest.exists():
            url = f"{NHANES_BASE}/{rel_path}"
            print(f"[nhanes] downloading {url}")
            resp = requests.get(url, timeout=120)
            resp.raise_for_status()
            dest.write_bytes(resp.content)
        # pandas reads SAS xport directly.
        frames[name] = pd.read_sas(dest, format="xport")
        print(f"[nhanes] {name}: {frames[name].shape[0]} rows")
    return frames


def to_unified_schema(frames: dict[str, "pd.DataFrame"]) -> tuple["pd.DataFrame", "pd.DataFrame"]:
    """Map raw NHANES frames into (subject_df, daily_observation_df).

    TODO: implement the concrete column mapping once the survey cycle is fixed.
    Reference NHANES variables to map:
      - SEQN               -> subject_id (namespaced 'nhanes:<SEQN>')
      - RIDAGEYR           -> age_years
      - RHQ031 / RHD143 …  -> reproductive_notes / menopausal_status
      - LBXTSH             -> hormone_tsh
    Female-only filter (RIAGENDR == 2) should be applied.
    """
    raise NotImplementedError(
        "NHANES -> unified schema mapping not yet implemented. "
        "Fill in once the survey cycle and target variables are finalized."
    )


def main() -> None:
    frames = download_nhanes()
    print(
        "[nhanes] downloaded components:",
        {k: v.shape for k, v in frames.items()},
    )
    print("[nhanes] mapping to unified schema is a TODO — see to_unified_schema().")


if __name__ == "__main__":
    main()
