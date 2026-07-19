"""HormOS data pipeline package.

Integrates heterogeneous women's hormonal-health datasets (mcPHASES, NHANES)
into the HormOS unified longitudinal schema and produces static artifacts
consumed by the Next.js app. Runs locally/offline only.
"""

__all__ = [
    "config",
    "load_nhanes",
    "load_mcphases",
    "integrate",
    "build_insights",
    "build_nhanes_reference",
]
