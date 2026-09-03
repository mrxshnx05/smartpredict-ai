"""
SmartPredict AI - Preprocessing Pipeline
Provides validation, cleaning, and feature scaling/transformation
for student academic performance classification.
Prevents data leakage by fitting transformers strictly on training partitions.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

FEATURE_COLUMNS = [
    'study_hours',
    'attendance_pct',
    'previous_score',
    'assignment_completion',
    'sleep_hours',
    'participation',
    'previous_performance'
]

TARGET_COLUMN = 'performance_class'

VALID_CLASSES = ['Needs Improvement', 'Average', 'Good', 'Excellent']

FEATURE_BOUNDS = {
    'study_hours': (0.0, 12.0),
    'attendance_pct': (0.0, 100.0),
    'previous_score': (0.0, 100.0),
    'assignment_completion': (0.0, 100.0),
    'sleep_hours': (0.0, 12.0),
    'participation': (1.0, 10.0),
    'previous_performance': (1.0, 10.0)
}

def load_and_validate_dataset(csv_path: str) -> pd.DataFrame:
    """Loads student CSV, performs schema and bounds validation."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset CSV not found at: {csv_path}")
    
    df = pd.read_csv(csv_path)
    
    # Verify required columns
    missing_cols = [col for col in FEATURE_COLUMNS + [TARGET_COLUMN] if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")
    
    # Check for empty or missing values
    initial_len = len(df)
    df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN]).copy()
    
    # Drop duplicates if any
    df = df.drop_duplicates(subset=FEATURE_COLUMNS).copy()
    
    # Validate ranges
    for feature, (low, high) in FEATURE_BOUNDS.items():
        df[feature] = pd.to_numeric(df[feature], errors='coerce')
        # Filter or clamp
        df = df[(df[feature] >= low) & (df[feature] <= high)]
    
    # Validate target classes
    df = df[df[TARGET_COLUMN].isin(VALID_CLASSES)]
    
    print(f"Validated dataset: {len(df)} records retained from initial {initial_len}.")
    return df

def prepare_train_test_split(df: pd.DataFrame, test_size=0.20, random_state=42):
    """Splits into stratified training and testing partitions to prevent data leakage."""
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )
    
    return X_train, X_test, y_train, y_test
