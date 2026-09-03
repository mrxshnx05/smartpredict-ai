import React, { useState } from 'react';
import { 
  GitCompare, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { StudentInput, PerformanceCategory, PredictionResponse } from '../types/student';
import { PRESET_PROFILES } from '../lib/dataset';
import { predictStudentPerformance } from '../lib/mlEngine';

interface Scenario {
  id: string;
  name: string;
  input: StudentInput;
  prediction: PredictionResponse;
}

interface ScenarioComparatorProps {
  currentInput: StudentInput;
}

export const ScenarioComparator: React.FC<ScenarioComparatorProps> = ({ currentInput }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'sc-1',
      name: 'Scenario A: Current Profile',
      input: { ...currentInput },
      prediction: predictStudentPerformance(currentInput),
    },
    {
      id: 'sc-2',
      name: 'Scenario B: Study Boost (+2h/day)',
      input: {
        ...currentInput,
        study_hours: Math.min(12, currentInput.study_hours + 2),
        attendance_pct: Math.min(100, currentInput.attendance_pct + 10),
      },
      prediction: predictStudentPerformance({
        ...currentInput,
        study_hours: Math.min(12, currentInput.study_hours + 2),
        attendance_pct: Math.min(100, currentInput.attendance_pct + 10),
      }),
    },
  ]);

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const preset = PRESET_PROFILES[scenarios.length];
    const newSc: Scenario = {
      id: `sc-${Date.now()}`,
      name: `Scenario ${String.fromCharCode(65 + scenarios.length)}: ${preset.name}`,
      input: { ...preset.data },
      prediction: predictStudentPerformance(preset.data),
    };
    setScenarios([...scenarios, newSc]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const updateScenarioMetric = (scId: string, field: keyof StudentInput, val: number) => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== scId) return sc;
        const updatedInput = { ...sc.input, [field]: val };
        return {
          ...sc,
          input: updatedInput,
          prediction: predictStudentPerformance(updatedInput),
        };
      })
    );
  };

  const getCategoryBadge = (cat: PerformanceCategory) => {
    switch (cat) {
      case 'Excellent':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40';
      case 'Good':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
      case 'Average':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/40';
      case 'Needs Improvement':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Side-by-Side Scenario Comparator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare up to 3 student scenarios simultaneously to evaluate policy interventions, study changes, and outcome shifts.
          </p>
        </div>

        {scenarios.length < 3 && (
          <button
            type="button"
            onClick={addScenario}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scenario ({scenarios.length}/3)</span>
          </button>
        )}
      </div>

      {/* Comparison Grid */}
      <div className={`grid grid-cols-1 ${scenarios.length === 2 ? 'md:grid-cols-2' : scenarios.length === 3 ? 'md:grid-cols-3' : ''} gap-5`}>
        {scenarios.map((sc, idx) => {
          return (
            <div
              key={sc.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4 relative flex flex-col justify-between"
            >
              {/* Scenario Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white tracking-tight">{sc.name}</span>
                  {scenarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScenario(sc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Outcome Badge */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Classification
                    </span>
                    <span className="text-lg font-black text-white">
                      {sc.prediction.prediction}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(sc.prediction.prediction)}`}>
                      {(sc.prediction.confidence * 100).toFixed(1)}% Conf
                    </span>
                  </div>
                </div>

                {/* Interactive Sliders for this scenario */}
                <div className="space-y-3 text-xs">
                  {/* Study Hours */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Study Hours:</span>
                      <span className="font-mono text-cyan-400 font-bold">{sc.input.study_hours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={sc.input.study_hours}
                      onChange={(e) => updateScenarioMetric(sc.id, 'study_hours', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Attendance:</span>
                      <span className="font-mono text-emerald-400 font-bold">{sc.input.attendance_pct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={sc.input.attendance_pct}
                      onChange={(e) => updateScenarioMetric(sc.id, 'attendance_pct', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  {/* Previous Score */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Previous Score:</span>
                      <span className="font-mono text-purple-400 font-bold">{sc.input.previous_score} pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={sc.input.previous_score}
                      onChange={(e) => updateScenarioMetric(sc.id, 'previous_score', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>

                  {/* Assignment Completion */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Assignment Turn-In:</span>
                      <span className="font-mono text-indigo-400 font-bold">{sc.input.assignment_completion}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={sc.input.assignment_completion}
                      onChange={(e) => updateScenarioMetric(sc.id, 'assignment_completion', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Sleep Hours */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Sleep Duration:</span>
                      <span className="font-mono text-sky-400 font-bold">{sc.input.sleep_hours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={sc.input.sleep_hours}
                      onChange={(e) => updateScenarioMetric(sc.id, 'sleep_hours', parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Class Probabilities Distribution Mini Bar */}
              <div className="border-t border-slate-800/80 pt-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Probability Mix
                </span>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
                  <div
                    style={{ width: `${(sc.prediction.probabilities.Excellent || 0) * 100}%` }}
                    className="bg-cyan-500"
                    title={`Excellent: ${((sc.prediction.probabilities.Excellent || 0) * 100).toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${(sc.prediction.probabilities.Good || 0) * 100}%` }}
                    className="bg-emerald-500"
                    title={`Good: ${((sc.prediction.probabilities.Good || 0) * 100).toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${(sc.prediction.probabilities.Average || 0) * 100}%` }}
                    className="bg-amber-500"
                    title={`Average: ${((sc.prediction.probabilities.Average || 0) * 100).toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${(sc.prediction.probabilities['Needs Improvement'] || 0) * 100}%` }}
                    className="bg-rose-500"
                    title={`Needs Improvement: ${((sc.prediction.probabilities['Needs Improvement'] || 0) * 100).toFixed(1)}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span className="text-cyan-400">Exc: {((sc.prediction.probabilities.Excellent || 0) * 100).toFixed(0)}%</span>
                  <span className="text-emerald-400">Good: {((sc.prediction.probabilities.Good || 0) * 100).toFixed(0)}%</span>
                  <span className="text-amber-400">Avg: {((sc.prediction.probabilities.Average || 0) * 100).toFixed(0)}%</span>
                  <span className="text-rose-400">NI: {((sc.prediction.probabilities['Needs Improvement'] || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
