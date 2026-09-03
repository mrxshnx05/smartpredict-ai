# SmartPredict AI — Student Performance Predictor

> **Academic ML Classification & Explainable Educational Intelligence Platform**

SmartPredict AI is a full-stack educational machine learning platform designed to forecast student academic performance tiering using supervised classification algorithms. Built for educational self-assessment, advising simulations, and pedagogical ML demonstration, it pairs a white-box Scikit-Learn Decision Tree classifier with interactive counterfactual simulation, sensitivity analysis, and associative explainability.

---

## 1. Dataset Provenance & Ethical Disclosure

### Reproducible Synthetic Demonstration Dataset
All training data (`backend/data/student_data.csv`) and demonstration records represent a **reproducible synthetic demonstration dataset generated for educational ML experimentation**.

* **Why Synthetic Data?** Real student academic records, transcripts, and attendance rosters are protected under the **Family Educational Rights and Privacy Act (FERPA)** and international data protection standards (GDPR). To enable open educational exploration without compromising student privacy or violating statutory compliance, a domain-grounded synthetic dataset was synthesized.
* **Generation Methodology:** Generated via `backend/ml/generate_dataset.py` using truncated Gaussian distributions, academic behavioral correlations, and noise injection across four target tiers:
  * Tier 1: *Excellent* (High study hours, high attendance, strong historical scores)
  * Tier 2: *Good* (Consistent study habits, solid attendance)
  * Tier 3: *Average* (Moderate study and attendance, passing baseline)
  * Tier 4: *Needs Improvement* (Attendance challenges, low study hours, high academic risk)
* **Limitations & Non-Generalizability:** The statistical patterns in this synthetic dataset reflect educational heuristics. **Results demonstrate machine learning modeling mechanics and cannot be generalized to real students.** Real-world academic performance involves unobserved socio-economic, pedagogical, health, and institutional factors not captured in tabular behavioral features.

---

## 2. Machine Learning Architecture

### Model Specification
* **Primary Classifier:** Scikit-Learn `DecisionTreeClassifier`
  * `criterion`: `gini`
  * `max_depth`: `5` (constrained to prevent overfitting and guarantee interpretable decision paths)
  * `min_samples_leaf`: `5`
  * `min_samples_split`: `10`
  * `random_state`: `42`
* **Performance Evaluation (Stratified 80/20 Train/Test Split):**
  * **Test Accuracy:** `86.5%` (on 200 held-out samples)
  * **5-Fold Stratified Cross-Validation:** `86.8% ± 1.8%` (demonstrating minimal variance across folds)
  * **Macro F1-Score:** `86.3%` (balanced performance across all 4 categories)
* **Baseline Comparator:**
  * Multinomial Logistic Regression (`StandardScaler` + `LogisticRegression(max_iter=1000)`)
  * Demonstrates linear decision boundary performance alongside non-linear tree partitions.

### Uncertainty & Borderline Handling
When leaf node class probability falls below `0.50` (`50%`), the inference engine assigns `is_uncertain: true` and attaches a warning note. This communicates to students and advisors that the individual profile sits close to a decision boundary and small behavioral adjustments could shift the classification.

### Associative vs. Causal Explainability
Contributing factors derived from feature importance and path traversal are reported with associative terminology:
* `"Associated with higher standing"` (instead of claiming causal uplift)
* `"Associated with lower standing"` (identifying relative deficit areas)
* `"Aligned with cohort baseline"`

---

## 3. Full-Stack System Architecture

### Dual-Path Serving Architecture
1. **Primary Worker (Python Scikit-Learn):** The Express API invokes `backend/ml/predict.py`, executing the native serialized `joblib` artifact (`backend/models/smartpredict_model.pkl`).
2. **Isomorphic Fallback (TypeScript Tree):** If the Python execution environment is unavailable or encounters a runtime fault, the engine seamlessly fails over to `src/lib/mlEngine.ts`, which evaluates the identical serialized Scikit-Learn decision rules client- or server-side.
3. **Auditability & Security:**
   * Unique `requestId` generated per inference transaction (`req-timestamp-random`).
   * Strict payload limits (1MB) and JSON schema verification.
   * Runtime probing (`probePythonRuntime`) during startup.

---

## 4. Input Features & Normalized Bounds

| Feature | Type | Range | Description |
| :--- | :--- | :--- | :--- |
| `study_hours` | float | 0.0 – 12.0 | Weekly self-directed academic study hours |
| `attendance_pct` | float | 0.0 – 100.0 | Course attendance & lecture presence percentage |
| `previous_score` | float | 0.0 – 100.0 | Historical exam or midterm score |
| `assignment_completion` | float | 0.0 – 100.0 | Percentage of coursework assignments submitted |
| `sleep_hours` | float | 3.0 – 12.0 | Average nightly rest duration (hours) |
| `participation` | integer | 1 – 10 | Seminar engagement & discussion rating |
| `previous_performance` | integer | 1 – 10 | Prior academic standing composite score |

---

## 5. Reproduction & Execution

### Regenerate Dataset
```bash
python3 backend/ml/generate_dataset.py
```

### Train and Validate Scikit-Learn Model
```bash
python3 backend/ml/train_model.py
```
Outputs:
* Serialized Model: `backend/models/smartpredict_model.pkl`
* Tree Rules JSON: `backend/models/decision_tree_rules.json`
* Evaluation Metrics: `backend/models/model_metrics.json`

### Run Application
```bash
# Install dependencies
npm install

# Start Express & Vite server
npm run dev

# Compile for production
npm run build
```

---

## 6. API Reference

### `POST /predict`
Predict performance for a single student.
```json
{
  "study_hours": 6.5,
  "attendance_pct": 88.0,
  "previous_score": 82.0,
  "assignment_completion": 90.0,
  "sleep_hours": 7.5,
  "participation": 8,
  "previous_performance": 8
}
```

**Response:**
```json
{
  "prediction": "Good",
  "confidence": 0.88,
  "probabilities": {
    "Excellent": 0.08,
    "Good": 0.88,
    "Average": 0.04,
    "Needs Improvement": 0.00
  },
  "is_uncertain": false,
  "requestId": "req-1725350400000-abcd",
  "contributing_factors": [...],
  "recommendations": [...],
  "model_metadata": {
    "executionMode": "Python Scikit-learn (joblib)",
    "accuracy": 0.865,
    "cvAccuracyMean": 0.868,
    "datasetHonesty": "Reproducible synthetic demonstration dataset generated for educational ML experimentation."
  }
}
```

### `POST /api/batch-predict`
Execute predictions over an array of student records (up to 500 items).
