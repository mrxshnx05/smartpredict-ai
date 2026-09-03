import React from 'react';
import { History, Clock, ArrowRight, Trash2, Award, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { StudentInput, PerformanceCategory, PredictionResponse } from '../types/student';

export interface HistoryItem {
  id: string;
  timestamp: string;
  input: StudentInput;
  prediction: PerformanceCategory;
  confidence: number;
}

interface PredictionHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
        <Clock className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
        <span>No recent predictions recorded yet. Run a prediction to build your history log.</span>
      </div>
    );
  }

  const getCategoryIcon = (cat: PerformanceCategory) => {
    switch (cat) {
      case 'Excellent':
        return <Award className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Good':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Average':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Needs Improvement':
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getCategoryBadge = (cat: PerformanceCategory) => {
    switch (cat) {
      case 'Excellent':
        return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';
      case 'Good':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      case 'Average':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'Needs Improvement':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Recent Predictions Session Log ({history.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs group"
          >
            <div className="flex items-center space-x-2.5">
              {getCategoryIcon(item.prediction)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{item.prediction}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getCategoryBadge(item.prediction)}`}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.input.study_hours}h study • {item.input.attendance_pct}% att • {item.input.previous_score} pts
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
