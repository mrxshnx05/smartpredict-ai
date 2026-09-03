import React from 'react';
import { BrainCircuit, GitCommit, CheckCircle, BarChart2, Cpu, FileCode2, Layers } from 'lucide-react';
import { MODEL_METRICS } from '../lib/dataset';

export const ModelExplorer: React.FC = () => {
  const pipelineSteps = [
    { num: 1, title: 'Load Dataset', desc: 'Ingest student_data.csv with historical student semester data' },
    { num: 2, title: 'Clean & Preprocess', desc: 'Impute missing values, clamp outliers, and validate feature bounds' },
    { num: 3, title: 'Encode Categorical', desc: 'Convert categorical ratings & ordinal scales into numeric vectors' },
    { num: 4, title: 'Feature Selection', desc: 'Identify top 7 predictive features with Gini importance' },
    { num: 5, title: 'Train / Test Split', desc: '80% stratified training set and 20% test validation partition' },
    { num: 6, title: 'Train Decision Tree', desc: 'Fit Scikit-learn DecisionTreeClassifier with max_depth=5' },
    { num: 7, title: 'Evaluate Accuracy', desc: 'Cross-validated 94.2% test accuracy and confusion matrix audit' },
    { num: 8, title: 'Save Model (.pkl)', desc: 'Serialize smartpredict_model.pkl for fast REST API inference' },
  ];

  const confusionClasses = MODEL_METRICS.confusionMatrix.classes;
  const matrix = MODEL_METRICS.confusionMatrix.matrix;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Machine Learning Pipeline & Model Architecture
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end specifications for the Scikit-learn multi-class Decision Tree Classifier.
        </p>
      </div>

      {/* Model High-Level Metrics Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Model Accuracy</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {(MODEL_METRICS.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Stratified 5-Fold</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Precision (Macro)</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {(MODEL_METRICS.precision * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Low False Positives</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recall (Sensitivity)</span>
          <span className="text-2xl font-black text-purple-400 font-mono">
            {(MODEL_METRICS.recall * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Flags At-Risk Early</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">F1 Harmonic Mean</span>
          <span className="text-2xl font-black text-indigo-400 font-mono">
            {(MODEL_METRICS.f1Score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Max Tree Depth: 5</span>
        </div>
      </div>

      {/* 8-Step ML Pipeline Flow (Document Page 6) */}
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <GitCommit className="w-4 h-4 text-cyan-400" />
          ML Training & Deployment Pipeline (Scikit-Learn)
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

      {/* 2 Columns: Feature Importances & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Feature Importance Breakdown */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Gini Feature Importance Rankings
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Σ = 1.0</span>
          </div>

          <div className="space-y-2.5">
            {MODEL_METRICS.features.map((f) => (
              <div key={f.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{f.name}</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {(f.importance * 100).toFixed(0)}% weight
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${f.importance * 100 * 2.8}%` }}
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
              Test Confusion Matrix (20% Holdout)
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">Predicted vs Ground Truth</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="py-2 text-left font-sans text-[11px]">Actual \ Predicted</th>
                  {confusionClasses.map((c) => (
                    <th key={c} className="py-2 px-2 text-[10px] text-slate-400">{c.split(' ')[0]}</th>
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
                          className={`py-2 px-2 font-bold rounded ${
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

          <p className="text-[11px] text-slate-500 mt-3 italic">
            Diagonal cells represent accurate class predictions; minimal misclassification occurred strictly along adjacent borderline thresholds.
          </p>
        </div>

      </div>

    </div>
  );
};
