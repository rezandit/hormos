"""Load mcPHASES (PhysioNet) data and map it into the HormOS unified schema.

PLACEHOLDER — blocked on PhysioNet credentialing.

mcPHASES is a *credentialed* PhysioNet dataset (requires a completed data use
agreement + training). It CANNOT be downloaded programmatically without
authentication and MUST NOT be committed to this repo. Once access is granted,
place the extracted files under `data/raw/mcphases/` (git-ignored) and implement
the mapping below.

mcPHASES is the longitudinal core of HormOS: Fitbit wearable data, continuous
glucose monitoring, hormone measurements, menstrual-cycle data, sleep, and
symptoms. This is what powers the per-day, per-phase symptom insight.
"""

from __future__ import annotations

import pandas as pd

from . import config


def load_raw() -> dict[str, "pd.DataFrame"]:
    """Read mcPHASES files from data/raw/mcphases/.

    TODO: implement once the on-disk file layout is known (after credentialing).
    """
    if not any(config.RAW_MCPHASES_DIR.glob("*")):
        raise FileNotFoundError(
            f"No mcPHASES files found in {config.RAW_MCPHASES_DIR}. "
            "Complete PhysioNet credentialing, then extract the dataset there. "
            "Do NOT commit these files."
        )
    raise NotImplementedError("mcPHASES raw loader not yet implemented.")


def derive_cycle_phase(cycle_day: int, cycle_length: int = 28) -> str:
    """Map a day-in-cycle to a coarse phase label.

    Simple rule-based derivation used for the first iteration; documented in
    docs/benchmark-methodology.md. Refined (hormone-confirmed ovulation) labels
    are a later iteration.
    """
    if cycle_day <= 5:
        return "menstrual"
    if cycle_day <= 13:
        return "follicular"
    if cycle_day <= 16:
        return "ovulatory"
    return "luteal"


def to_unified_schema() -> tuple["pd.DataFrame", "pd.DataFrame"]:
    """Map raw mcPHASES frames into (subject_df, daily_observation_df).

    TODO after credentialing:
      - subject_id  -> 'mcphases:<id>'
      - align wearable/CGM/hormone/symptom streams onto one row per (subject, day)
      - derive cycle_day + cycle_phase (see derive_cycle_phase)
      - harmonize symptom severities to the 0-3 ordinal scale
    """
    raise NotImplementedError(
        "mcPHASES -> unified schema mapping is a placeholder pending PhysioNet access."
    )


def main() -> None:
    print(
        "[mcphases] PLACEHOLDER — pending PhysioNet credentialing. "
        f"Expected raw files under: {config.RAW_MCPHASES_DIR}"
    )


if __name__ == "__main__":
    main()
