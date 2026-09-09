# Machine Learning & Risk Engine Directory

This directory is designated for heavy datasets, feature engineering scripts, model artifacts, and inference engines.

### Subdirectories:
- `ml/data/`: Raw and intermediate training datasets (e.g. `rainfall_manual_daily_assam_as_2021_2025.csv`, weather station logs, elevation rasters).
- `ml/features/`: Feature engineering scripts (1-day, 3-day, 7-day rainfall accumulation, road vulnerability calculations, spatial joins).
- `ml/models/`: Serialized models (`.joblib`, `.pkl`, XGBoost/RandomForest weights).
- `ml/notebooks/`: Jupyter exploratory data analysis and model prototyping notebooks.
- `ml/inference/`: Batch or real-time inference scripts producing risk scores.
- `ml/risk_engine/`: The explainable prototype risk engine combining:
  - 60% Rainfall Risk
  - 25% Static Vulnerability
  - 15% Historical Risk
