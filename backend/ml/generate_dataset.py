"""
SmartPredict AI - Dataset Generator & Validator
Type: Reproducible synthetic demonstration dataset generated for educational ML experimentation.

Dataset Integrity & Provenance Documentation:
1. Generation Methodology:
   - Stratified parameterization using NumPy pseudo-random normal distributions (np.random.seed(42)).
   - Bounded via np.clip to realistic pedagogical metrics across 4 target classes:
     * Needs Improvement (220 samples, 22%)
     * Average (300 samples, 30%)
     * Good (320 samples, 32%)
     * Excellent (160 samples, 16%)
   - Total records: 1,000 samples.

2. Why Synthetic Data Is Used:
   - Actual student academic records, GPA metrics, and course evaluations are strictly protected
     under the Family Educational Rights and Privacy Act (FERPA) and institutional data protection regulations.
   - Genuine student performance records cannot be distributed in open-source demonstration projects
     without institutional review board (IRB) approval and informed student consent.
   - A fully reproducible synthetic dataset enables rigorous algorithmic auditing, deterministic test suites,
     and educational experimentation without violating privacy or ethics standards.

3. Limitations:
   - Relies on idealized Gaussian distributions within performance tiers.
   - Does not capture unobserved real-world confounders such as socio-economic background, health/illness,
     course difficulty variance, teacher pedagogical styles, or grading rubric adjustments.
   - Correlations between habits and outcomes are cleaner than messy real-world classroom settings.

4. Generalization Notice:
   - Model outputs represent simulated statistical boundaries on this synthetic distribution.
   - They MUST NOT be generalized to real students or used for consequential academic admissions,
     probation, or disciplinary decisions.
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)

def generate_dataset(n_samples=1000):
    records = []
    
    # Stratified distribution targets
    class_targets = [
        ('Needs Improvement', 220),
        ('Average', 300),
        ('Good', 320),
        ('Excellent', 160)
    ]
    
    student_id = 1001
    
    for label, count in class_targets:
        for _ in range(count):
            if label == 'Needs Improvement':
                # Higher risk profile: low attendance or low study or missed assignments
                study = np.clip(np.random.normal(loc=1.8, scale=0.9), 0.0, 5.0)
                attendance = np.clip(np.random.normal(loc=58.0, scale=12.0), 20.0, 80.0)
                prev_score = np.clip(np.random.normal(loc=48.0, scale=10.0), 15.0, 68.0)
                assignments = np.clip(np.random.normal(loc=52.0, scale=15.0), 10.0, 75.0)
                sleep = np.clip(np.random.normal(loc=5.8, scale=1.5), 3.0, 10.0)
                part = int(np.clip(np.random.normal(loc=3.2, scale=1.4), 1, 6))
                prev_perf = int(np.clip(np.random.normal(loc=3.5, scale=1.3), 1, 6))
                
            elif label == 'Average':
                # Moderate/borderline profile
                study = np.clip(np.random.normal(loc=3.2, scale=0.9), 1.0, 6.5)
                attendance = np.clip(np.random.normal(loc=74.0, scale=8.0), 55.0, 90.0)
                prev_score = np.clip(np.random.normal(loc=65.0, scale=7.0), 48.0, 78.0)
                assignments = np.clip(np.random.normal(loc=73.0, scale=9.0), 50.0, 88.0)
                sleep = np.clip(np.random.normal(loc=6.6, scale=1.2), 4.0, 9.5)
                part = int(np.clip(np.random.normal(loc=5.4, scale=1.3), 2, 8))
                prev_perf = int(np.clip(np.random.normal(loc=5.5, scale=1.2), 2, 8))
                
            elif label == 'Good':
                # Strong profile: solid attendance, regular study
                study = np.clip(np.random.normal(loc=4.8, scale=1.0), 2.5, 8.5)
                attendance = np.clip(np.random.normal(loc=86.0, scale=6.0), 72.0, 98.0)
                prev_score = np.clip(np.random.normal(loc=78.0, scale=6.0), 65.0, 90.0)
                assignments = np.clip(np.random.normal(loc=87.0, scale=6.5), 70.0, 99.0)
                sleep = np.clip(np.random.normal(loc=7.1, scale=1.0), 5.0, 9.5)
                part = int(np.clip(np.random.normal(loc=7.2, scale=1.2), 4, 10))
                prev_perf = int(np.clip(np.random.normal(loc=7.4, scale=1.1), 4, 10))
                
            else: # Excellent
                # Outstanding achievement: high study, high attendance, high prior score
                study = np.clip(np.random.normal(loc=6.8, scale=1.3), 4.0, 11.5)
                attendance = np.clip(np.random.normal(loc=94.0, scale=4.0), 82.0, 100.0)
                prev_score = np.clip(np.random.normal(loc=90.0, scale=4.5), 80.0, 100.0)
                assignments = np.clip(np.random.normal(loc=95.0, scale=3.5), 85.0, 100.0)
                sleep = np.clip(np.random.normal(loc=7.5, scale=0.9), 5.5, 9.5)
                part = int(np.clip(np.random.normal(loc=8.8, scale=0.9), 6, 10))
                prev_perf = int(np.clip(np.random.normal(loc=8.9, scale=0.9), 6, 10))
            
            records.append({
                'student_id': f'STU-{student_id}',
                'study_hours': round(float(study), 1),
                'attendance_pct': round(float(attendance), 1),
                'previous_score': round(float(prev_score), 1),
                'assignment_completion': round(float(assignments), 1),
                'sleep_hours': round(float(sleep), 1),
                'participation': int(part),
                'previous_performance': int(prev_perf),
                'performance_class': label
            })
            student_id += 1

    df = pd.DataFrame(records)
    # Shuffle randomly with fixed seed
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

if __name__ == '__main__':
    df = generate_dataset(1000)
    out_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'student_data.csv')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
    print("=" * 70)
    print("SmartPredict AI: Dataset Generation Complete")
    print("Type: Reproducible synthetic demonstration dataset generated for educational ML experimentation.")
    print("Notice: Synthetic data used to protect student privacy under FERPA guidelines.")
    print(f"Total Records: {len(df)} saved to {out_path}")
    print("=" * 70)
    print("Class distribution:")
    print(df['performance_class'].value_counts())
    print("\nSummary statistics:")
    print(df.describe())
