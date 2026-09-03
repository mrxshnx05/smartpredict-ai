import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  UserCheck, 
  Award, 
  FileCheck2, 
  Moon, 
  MessageSquare, 
  TrendingUp, 
  RotateCcw, 
  Flame, 
  BookOpen,
  GraduationCap,
  HeartPulse,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { StudentInput, PresetProfile } from '../types/student';
import { PRESET_PROFILES } from '../lib/dataset';

interface PredictionFormProps {
  input: StudentInput;
  setInput: React.Dispatch<React.SetStateAction<StudentInput>>;
  onSubmit: (customInput?: StudentInput) => void;
  isLoading: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  input,
  setInput,
  onSubmit,
  isLoading,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('Balanced Achiever');

  const handleInputChange = (field: keyof StudentInput, val: number) => {
    setInput((prev) => ({
      ...prev,
      [field]: val,
    }));
    setSelectedPreset(null);
  };

  const handleStep = (field: keyof StudentInput, delta: number, min: number, max: number, decimals = 1) => {
    setInput((prev) => {
      const current = prev[field];
      const next = Math.min(max, Math.max(min, Math.round((current + delta) * 10) / 10));
      return {
        ...prev,
        [field]: decimals === 0 ? Math.round(next) : next,
      };
    });
    setSelectedPreset(null);
  };

  const applyPreset = (preset: PresetProfile) => {
    setInput(preset.data);
    setSelectedPreset(preset.name);
  };

  const handleReset = () => {
    const defaultData = PRESET_PROFILES[1].data; // Balanced Achiever
    setInput(defaultData);
    setSelectedPreset('Balanced Achiever');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Presets */}
      <div className="relative z-10 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Student Profile Parameters
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the 7 key metrics to run Scikit-Learn multi-class classification and personalized guidance.
            </p>
          </div>

          <button
            type="button"
            id="reset-form-btn"
            onClick={handleReset}
            className="self-start sm:self-auto flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Quick Presets Pills */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Quick Student Persona Preset:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROFILES.map((preset) => {
              const isSelected = selectedPreset === preset.name;
              return (
                <button
                  key={preset.name}
                  type="button"
                  id={`preset-${preset.tag.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => applyPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-800/50 text-slate-300 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        
        {/* =================================================================== */}
        {/* GROUP 1: ACADEMIC PERFORMANCE */}
        {/* =================================================================== */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              1. Academic Baseline & Coursework
            </h3>
          </div>

          {/* Metric 1: Previous Score */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="previous_score" className="text-sm font-semibold text-slate-200">
                    Previous Exam Score
                  </label>
                  <span className="text-[11px] text-slate-400 block">Baseline midterm or last semester test (0 – 100)</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('previous_score', -1, 0, 100, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Decrease by 1"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="previous_score_num"
                  step="0.5"
                  min="0"
                  max="100"
                  value={input.previous_score}
                  onChange={(e) => handleInputChange('previous_score', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-purple-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">pts</span>
                <button
                  type="button"
                  onClick={() => handleStep('previous_score', 1, 0, 100, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Increase by 1"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="previous_score"
              min="0"
              max="100"
              step="0.5"
              value={input.previous_score}
              onChange={(e) => handleInputChange('previous_score', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            {input.previous_score < 60 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Foundational gap: Previous exam below 60 pts indicates high need for prerequisite review.</span>
              </div>
            )}
          </div>

          {/* Metric 2: Assignment Completion */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="assignment_completion" className="text-sm font-semibold text-slate-200">
                    Assignment Completion Rate (%)
                  </label>
                  <span className="text-[11px] text-slate-400 block">Percentage of homework & labs submitted on time</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('assignment_completion', -2, 0, 100, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="assignment_completion_num"
                  step="1"
                  min="0"
                  max="100"
                  value={input.assignment_completion}
                  onChange={(e) => handleInputChange('assignment_completion', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-indigo-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">%</span>
                <button
                  type="button"
                  onClick={() => handleStep('assignment_completion', 2, 0, 100, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="assignment_completion"
              min="0"
              max="100"
              step="1"
              value={input.assignment_completion}
              onChange={(e) => handleInputChange('assignment_completion', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            {input.assignment_completion < 70 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Coursework risk: Incomplete assignments directly lower final grade safety buffer.</span>
              </div>
            )}
          </div>

          {/* Metric 3: Previous Performance Rating (1-10) */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="previous_performance" className="text-sm font-semibold text-slate-200">
                    Historical Academic Rating (1–10)
                  </label>
                  <span className="text-[11px] text-slate-400 block">Long-term GPA quartile or instructor assessment</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('previous_performance', -1, 1, 10, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="previous_performance_num"
                  step="1"
                  min="1"
                  max="10"
                  value={input.previous_performance}
                  onChange={(e) => handleInputChange('previous_performance', Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-10 bg-transparent text-right font-mono font-bold text-rose-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">/10</span>
                <button
                  type="button"
                  onClick={() => handleStep('previous_performance', 1, 1, 10, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="previous_performance"
              min="1"
              max="10"
              step="1"
              value={input.previous_performance}
              onChange={(e) => handleInputChange('previous_performance', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* GROUP 2: ENGAGEMENT & DISCIPLINE */}
        {/* =================================================================== */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              2. Engagement & Active Discipline
            </h3>
          </div>

          {/* Metric 4: Study Hours */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="study_hours" className="text-sm font-semibold text-slate-200">
                    Daily Study Hours
                  </label>
                  <span className="text-[11px] text-slate-400 block">Focused independent study & problem sets (0 – 12 hrs)</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('study_hours', -0.5, 0, 12, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="study_hours_num"
                  step="0.1"
                  min="0"
                  max="12"
                  value={input.study_hours}
                  onChange={(e) => handleInputChange('study_hours', Math.min(12, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-cyan-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">hrs</span>
                <button
                  type="button"
                  onClick={() => handleStep('study_hours', 0.5, 0, 12, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="study_hours"
              min="0"
              max="12"
              step="0.1"
              value={input.study_hours}
              onChange={(e) => handleInputChange('study_hours', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {input.study_hours < 2.0 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Low study volume: Less than 2 hrs/day correlates strongly with knowledge decay.</span>
              </div>
            )}
          </div>

          {/* Metric 5: Attendance % */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="attendance_pct" className="text-sm font-semibold text-slate-200">
                    Attendance Rate (%)
                  </label>
                  <span className="text-[11px] text-slate-400 block">Classroom & lecture attendance (0 – 100%)</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('attendance_pct', -2, 0, 100, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="attendance_pct_num"
                  step="0.5"
                  min="0"
                  max="100"
                  value={input.attendance_pct}
                  onChange={(e) => handleInputChange('attendance_pct', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-emerald-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">%</span>
                <button
                  type="button"
                  onClick={() => handleStep('attendance_pct', 2, 0, 100, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="attendance_pct"
              min="0"
              max="100"
              step="0.5"
              value={input.attendance_pct}
              onChange={(e) => handleInputChange('attendance_pct', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            {input.attendance_pct < 75.0 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Attendance alert: Below 75% attendance triggers critical risk penalties in Decision Tree splits.</span>
              </div>
            )}
          </div>

          {/* Metric 6: Class Participation */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="participation" className="text-sm font-semibold text-slate-200">
                    Class Participation (1–10)
                  </label>
                  <span className="text-[11px] text-slate-400 block">Seminar engagement, questions & office hours</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('participation', -1, 1, 10, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="participation_num"
                  step="1"
                  min="1"
                  max="10"
                  value={input.participation}
                  onChange={(e) => handleInputChange('participation', Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-10 bg-transparent text-right font-mono font-bold text-amber-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">/10</span>
                <button
                  type="button"
                  onClick={() => handleStep('participation', 1, 1, 10, 0)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="participation"
              min="1"
              max="10"
              step="1"
              value={input.participation}
              onChange={(e) => handleInputChange('participation', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* =================================================================== */}
        {/* GROUP 3: COGNITIVE HYGIENE & RECOVERY */}
        {/* =================================================================== */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-1.5">
            <HeartPulse className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300">
              3. Cognitive Well-Being & Recovery
            </h3>
          </div>

          {/* Metric 7: Sleep Hours */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <label htmlFor="sleep_hours" className="text-sm font-semibold text-slate-200">
                    Sleep Duration
                  </label>
                  <span className="text-[11px] text-slate-400 block">Nightly sleep duration (0 – 12 hrs; 7–8h optimal)</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => handleStep('sleep_hours', -0.5, 0, 12, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  id="sleep_hours_num"
                  step="0.5"
                  min="0"
                  max="12"
                  value={input.sleep_hours}
                  onChange={(e) => handleInputChange('sleep_hours', Math.min(12, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-12 bg-transparent text-right font-mono font-bold text-sky-400 focus:outline-none text-sm"
                />
                <span className="text-xs text-slate-400">hrs</span>
                <button
                  type="button"
                  onClick={() => handleStep('sleep_hours', 0.5, 0, 12, 1)}
                  className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              id="sleep_hours"
              min="0"
              max="12"
              step="0.5"
              value={input.sleep_hours}
              onChange={(e) => handleInputChange('sleep_hours', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            {input.sleep_hours < 6.0 && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sleep deficit warning: Less than 6 hrs nightly causes cognitive fatigue and impairs memory consolidation.</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="predict-submit-btn"
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-full bg-slate-950 group-hover:bg-transparent py-3.5 px-6 rounded-[11px] transition-all duration-200 flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-cyan-300">Executing Scikit-Learn Model Inference...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold text-white tracking-wide">
                  Predict Academic Performance
                </span>
                <span className="text-[11px] font-normal text-cyan-300/80 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 ml-2 hidden sm:inline">
                  POST /predict
                </span>
              </>
            )}
          </div>
        </button>

      </form>
    </div>
  );
};
