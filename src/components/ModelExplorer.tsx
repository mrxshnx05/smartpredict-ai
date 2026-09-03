import React, { useState } from 'react';
import { 
  BrainCircuit, 
  GitCommit, 
  CheckCircle, 
  BarChart2, 
  Cpu, 
  FileCode2, 
  Layers,
  Scale,
  ShieldAlert,
  Terminal,
  BookOpen,
  Info
} from 'lucide-react';
import { MODEL_METRICS } from '../lib/dataset';

export const ModelExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'evaluation' | 'comparator' | 'modelcard'>('architecture');

  const pipelineSteps = [
    { num: 1, title: 'Dataset Ingestion', desc: '1,000 reproducible synthetic demonstration student records generated for educational ML experimentation (backend/data/student_data.csv).' },
    { num: 2, title: 'Validation & Cleaning', desc: 'Validates bounded numerical ranges, checks missing values, and enforces student schema.' },
    { num: 3, title: 'Stratified 80/20 Split', desc: '800 training samples and 200 test samples preserving target class balance (random_state=42).' },
    { num: 4, title: 'Decision Tree Training', desc: 'Scikit-Learn DecisionTreeClassifier fitted with Gini criterion, max_depth=5, min_samples_leaf=5.' },
    { num: 5, title: '5-Fold Cross-Validation', desc: `StratifiedKFold cross-validation confirms generalization stability (Mean: ${(MODEL_METRICS.cvAccuracyMean * 100).toFixed(1)}%, Std: ${(MODEL_METRICS.cvAccuracyStd * 100).toFixed(1)}%).` },
    { num: 6, title: 'Comparator Modeling', desc: 'StandardScaler + Multinomial Logistic Regression fitted as an empirical accuracy baseline.' },
    { num: 7, title: 'Model Serialization', desc: 'Serialized to backend/models/smartpredict_model.pkl via joblib with JSON metadata.' },
    { num: 8, title: 'Hybrid REST Serving', desc: 'Served through Express.js with direct Python Scikit-Learn worker execution & fallback.' },
  ];

  const confusionClasses = MODEL_METRICS.confusionMatrix.classes;
  const matrix = MODEL_METRICS.confusionMatrix.matrix;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Scikit-Learn ML Model Architecture & Audit
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent white-box inspection of training pipeline, hyperparameters, and cross-validated metrics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'architecture'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipeline & Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evaluation')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'evaluation'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Confusion & Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparator')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'comparator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Comparator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('modelcard')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'modelcard'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Card
          </button>
        </div>
      </div>

      {/* Model High-Level Metrics Badges (Calculated directly from Scikit-Learn audit) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Test Accuracy</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {(MODEL_METRICS.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">200 Test Samples</span>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">5-Fold CV Mean</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {(MODEL_METRICS.cvAccuracyMean * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">± {(MODEL_METRICS.cvAccuracyStd * 100).toFixed(1)}% Variance</span>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Macro F1 Score</span>
          <span className="text-2xl font-black text-purple-400 font-mono">
            {(MODEL_METRICS.f1Score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Balanced Performance</span>
        </div>

        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tree Complexity</span>
          <span className="text-2xl font-black text-indigo-400 font-mono">
            {MODEL_METRICS.treeDepth} Levels
          </span>
          <span className="text-[10px] text-slate-500 block">{MODEL_METRICS.numberOfLeaves} Terminal Leaves</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PIPELINE & FLOW */}
      {/* =================================================================== */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* 8-Step ML Pipeline Flow */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-cyan-400" />
              Scikit-Learn Machine Learning Pipeline Architecture
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {pipelineSteps.map((step) => (
                <div
                  key={step.num}
                  className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors relative"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-[11px] font-bold font-mono">
                      {step.num}
                    </span>
                    <span className="font-semibold text-xs text-white truncate">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hyperparameter Configuration */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Hyperparameter Specification
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">criterion</span>
                <span className="text-cyan-300 font-mono font-bold">gini</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">max_depth</span>
                <span className="text-cyan-300 font-mono font-bold">5</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">min_samples_leaf</span>
                <span className="text-cyan-300 font-mono font-bold">5</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">random_state</span>
                <span className="text-cyan-300 font-mono font-bold">42 (reproducible)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: EVALUATION & CONFUSION MATRIX */}
      {/* =================================================================== */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {/* 2 Columns: Feature Importances & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Feature Importance Breakdown */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Scikit-Learn Gini Feature Importance
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">Σ = 1.0</span>
              </div>

              <div className="space-y-2.5">
                {MODEL_METRICS.features.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{f.name}</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                        style={{ width: `${Math.max(3, f.importance * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confusion Matrix Table */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Test Confusion Matrix (20% Holdout Partition)
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">N = 200</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="py-2 text-left font-sans text-[11px]">Actual \ Pred</th>
                      {confusionClasses.map((c) => (
                        <th key={c} className="py-2 px-1.5 text-[10px] text-slate-400">{c.split(' ')[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="py-2 text-left font-sans text-slate-300 text-[11px] font-medium">
                          {confusionClasses[rIdx]}
                        </td>
                        {row.map((cellVal, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          return (
                            <td
                              key={cIdx}
                              className={`py-2 px-1.5 font-bold rounded ${
                                isDiagonal
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : cellVal > 0
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'text-slate-600'
                              }`}
                            >
                              {cellVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 italic">
                Diagonal values indicate correct classifications. Off-diagonal non-zero cells demonstrate expected boundary transitions between adjacent classes.
              </p>
            </div>

          </div>

          {/* Per-Class Classification Report Table */}
          {MODEL_METRICS.perClassMetrics && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                Per-Class Precision, Recall & F1-Score Breakdown
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
                      <th className="py-2">Class</th>
                      <th className="py-2">Precision</th>
                      <th className="py-2">Recall</th>
                      <th className="py-2">F1-Score</th>
                      <th className="py-2">Support (Test)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {Object.entries(MODEL_METRICS.perClassMetrics).map(([cls, metrics]) => (
                      <tr key={cls} className="text-slate-300">
                        <td className="py-2 font-sans font-semibold text-white">{cls}</td>
                        <td className="py-2 text-cyan-300">{(metrics.precision * 100).toFixed(1)}%</td>
                        <td className="py-2 text-emerald-300">{(metrics.recall * 100).toFixed(1)}%</td>
                        <td className="py-2 text-purple-300">{(metrics.f1Score * 100).toFixed(1)}%</td>
                        <td className="py-2 text-slate-400">{metrics.support} samples</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MODEL COMPARATOR */}
      {/* =================================================================== */}
      {activeTab === 'comparator' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              Decision Tree vs. Logistic Regression Baseline Comparator
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary: Decision Tree */}
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">DecisionTreeClassifier</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Primary Production Model
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Test Accuracy:</span>
                    <span className="font-mono text-cyan-300 font-bold">{(MODEL_METRICS.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">5-Fold CV Accuracy:</span>
                    <span className="font-mono text-cyan-300 font-bold">{(MODEL_METRICS.cvAccuracyMean * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Explainability:</span>
                    <span className="text-emerald-400 font-semibold">100% White-Box (Exact Splits)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Threshold Rules:</span>
                    <span className="text-slate-200">Non-linear, step-wise partitions</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  Best suited for student advising: enables step-by-step counterfactual questions and precise threshold guidance.
                </p>
              </div>

              {/* Baseline: Logistic Regression */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Multinomial Logistic Regression</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Baseline Comparator
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Test Accuracy:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {((MODEL_METRICS.comparatorModel?.accuracy || 0.97) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">5-Fold CV Accuracy:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {((MODEL_METRICS.comparatorModel?.cvAccuracyMean || 0.97) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Explainability:</span>
                    <span className="text-amber-400 font-semibold">Linear Weights (Log-Odds)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Threshold Rules:</span>
                    <span className="text-slate-200">Linear hyperplane boundaries</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  High linear classification accuracy on scaled continuous vectors, but lacks rule-based interpretable decision branches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: MODEL CARD */}
      {/* =================================================================== */}
      {activeTab === 'modelcard' && (
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Academic Model Card Specification
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="font-bold text-white block">Intended Use:</span>
                <p className="text-slate-400 text-[11px]">
                  SmartPredict AI is designed strictly as a formative educational self-assessment and ML demonstration tool. It enables university students, teaching assistants, and academic counselors to simulate how adjustments in study schedules and attendance affect projected outcomes.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block">Dataset Provenance & Privacy:</span>
                <p className="text-slate-400 text-[11px]">
                  Reproducible synthetic demonstration dataset generated for educational ML experimentation. Real student transcript records cannot be publicly distributed due to FERPA compliance and privacy mandates.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block">Limitations & Generalizability:</span>
                <p className="text-slate-400 text-[11px]">
                  Results demonstrate machine learning modeling mechanics and cannot be generalized to real students. Individual exam performance in real institutions is influenced by unobserved factors including health events, instructor grading subjectivity, and curriculum variations.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white block">Algorithmic Fairness & Ethics:</span>
                <p className="text-slate-400 text-[11px]">
                  The model strictly excludes demographic attributes (e.g. race, gender, socio-economic status). All 7 features represent student-directed behavioral and academic habits.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Reproduce training:</span>
              <span className="bg-slate-900 px-2 py-1 rounded text-cyan-300 border border-slate-800">
                python3 backend/ml/train_model.py
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
