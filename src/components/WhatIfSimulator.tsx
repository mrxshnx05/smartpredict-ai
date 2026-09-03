import React, { useState, useMemo } from 'react';
import { Sliders, Sparkles, ArrowRight, TrendingUp, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { StudentInput, PerformanceCategory } from '../types/student';
import { predictStudentPerformance, calculateAcademicIndex } from '../lib/mlEngine';

interface WhatIfSimulatorProps {
  initialInput: StudentInput;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ initialInput }) => {
  const [simInput, setSimInput] = useState<StudentInput>({ ...initialInput });

  const baselinePrediction = useMemo(() => {
    return predictStudentPerformance(initialInput);
  }, [initialInput]);

  const simulatedPrediction = useMemo(() => {
    return predictStudentPerformance(simInput);
  }, [simInput]);

  const baselineScore = useMemo(() => calculateAcademicIndex(initialInput), [initialInput]);
  const simulatedScore = useMemo(() => calculateAcademicIndex(simInput), [simInput]);
  const scoreDelta = +(simulatedScore - baselineScore).toFixed(1);

  const handleSliderChange = (field: keyof StudentInput, val: number) => {
    setSimInput((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const resetToBaseline = () => {
    setSimInput({ ...initialInput });
  };

  // Find minimum intervention to reach next class
  const optimizationTips = useMemo(() => {
    if (simulatedPrediction.prediction === 'Excellent') {
      return 'You are currently in the Honors (Excellent) tier. Maintain study consistency to prevent score degradation.';
    }
    if (simulatedPrediction.prediction === 'Good') {
      return 'To jump to Excellent: Push daily study hours past 5.5h and sustain attendance >= 85% with 90%+ assignment turn-in.';
    }
    if (simulatedPrediction.prediction === 'Average') {
      return 'To jump to Good: Increase attendance above 80% and raise study hours to 4.0h/day.';
    }
    return 'Urgent Lift: Raising attendance above 75% and daily study to 3.5h moves you out of Needs Improvement into passing standing.';
  }, [simulatedPrediction.prediction]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Real-Time What-If Scenario Lab
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Slide any metric to observe how immediate interventions dynamically impact ML classification and probabilities.
          </p>
        </div>

        <button
          onClick={resetToBaseline}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Current Student</span>
        </button>
      </div>

      {/* Comparison Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Baseline Card */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Current Baseline
          </span>
          <div className="text-2xl font-black text-slate-200">
            {baselinePrediction.prediction}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Academic Index: {baselineScore}/100
          </div>
        </div>

        {/* Transition Arrow / Score Delta */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Projected Shift
          </span>
          <div className={`text-xl font-bold font-mono flex items-center gap-1 ${scoreDelta > 0 ? 'text-emerald-400' : scoreDelta < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span>{scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">
            {scoreDelta > 0 ? 'Positive Academic Lift' : scoreDelta < 0 ? 'Performance Decline' : 'No Net Variance'}
          </span>
        </div>

        {/* Simulated Outcome Card */}
        <div className={`p-4 rounded-xl border text-center transition-all ${
          simulatedPrediction.prediction === 'Excellent'
            ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : simulatedPrediction.prediction === 'Good'
            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : simulatedPrediction.prediction === 'Average'
            ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
            : 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
        }`}>
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Simulated Outcome
          </span>
          <div className="text-2xl font-black text-white">
            {simulatedPrediction.prediction}
          </div>
          <div className="text-xs text-cyan-300 font-mono mt-1">
            Confidence: {(simulatedPrediction.confidence * 100).toFixed(1)}% (Index: {simulatedScore}/100)
          </div>
        </div>

      </div>

      {/* Target Intervention Advice */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-6 flex items-start space-x-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">Target Intervention Roadmap: </span>
          {optimizationTips}
        </div>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Study Hours */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Daily Study Hours</span>
            <span className="font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.study_hours} hrs
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.2"
            value={simInput.study_hours}
            onChange={(e) => handleSliderChange('study_hours', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0h</span>
            <span className="text-slate-400">Baseline: {initialInput.study_hours}h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Attendance % */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Attendance Rate</span>
            <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.attendance_pct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={simInput.attendance_pct}
            onChange={(e) => handleSliderChange('attendance_pct', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0%</span>
            <span className="text-slate-400">Baseline: {initialInput.attendance_pct}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Previous Score */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Previous Score</span>
            <span className="font-mono font-bold text-purple-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.previous_score} pts
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={simInput.previous_score}
            onChange={(e) => handleSliderChange('previous_score', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0</span>
            <span className="text-slate-400">Baseline: {initialInput.previous_score}</span>
            <span>100</span>
          </div>
        </div>

        {/* Assignment Completion */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Assignment Completion</span>
            <span className="font-mono font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.assignment_completion}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={simInput.assignment_completion}
            onChange={(e) => handleSliderChange('assignment_completion', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0%</span>
            <span className="text-slate-400">Baseline: {initialInput.assignment_completion}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Sleep Hours */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Sleep Hours</span>
            <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.sleep_hours}h
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={simInput.sleep_hours}
            onChange={(e) => handleSliderChange('sleep_hours', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0h</span>
            <span className="text-cyan-400">7–8h Optimal</span>
            <span>12h</span>
          </div>
        </div>

        {/* Participation */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-200">Class Participation</span>
            <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {simInput.participation}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={simInput.participation}
            onChange={(e) => handleSliderChange('participation', parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>1 (Passive)</span>
            <span className="text-slate-400">Baseline: {initialInput.participation}</span>
            <span>10 (Active)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
