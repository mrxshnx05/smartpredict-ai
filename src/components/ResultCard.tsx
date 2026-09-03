import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  FileText, 
  Bot, 
  Share2, 
  Check, 
  ChevronRight,
  GitBranch,
  Gauge,
  HelpCircle
} from 'lucide-react';
import { PredictionResponse, PerformanceCategory, StudentInput } from '../types/student';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  result: PredictionResponse | null;
  input: StudentInput;
  isLoading: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  input,
  isLoading,
}) => {
  const [showAiRoadmap, setShowAiRoadmap] = useState(false);
  const [aiRoadmapLoading, setAiRoadmapLoading] = useState(false);
  const [aiRoadmapContent, setAiRoadmapContent] = useState<string | null>(null);
  const [aiRoadmapProvider, setAiRoadmapProvider] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showDecisionTreePath, setShowDecisionTreePath] = useState(false);

  // Trigger celebration confetti when result is Excellent
  React.useEffect(() => {
    if (result && result.prediction === 'Excellent') {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [result?.prediction, result?.timestamp]);

  const fetchAiRoadmap = async () => {
    if (aiRoadmapContent) {
      setShowAiRoadmap(!showAiRoadmap);
      return;
    }

    setAiRoadmapLoading(true);
    setShowAiRoadmap(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      setAiRoadmapContent(data.insights);
      setAiRoadmapProvider(data.provider || 'SmartPredict Pedagogical AI');
    } catch (err) {
      console.error(err);
      setAiRoadmapContent('Unable to fetch detailed pedagogical advice at this moment.');
    } finally {
      setAiRoadmapLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summaryText = `SmartPredict AI Evaluation Report
Outcome: ${result.prediction} (${(result.confidence * 100).toFixed(1)}% Confidence)
Metrics:
- Study Hours: ${input.study_hours} hrs/day
- Attendance: ${input.attendance_pct}%
- Previous Score: ${input.previous_score} pts
- Assignment Turn-in: ${input.assignment_completion}%
- Sleep: ${input.sleep_hours} hrs
- Participation: ${input.participation}/10

Key Recommendations:
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Evaluating Decision Tree...</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Processing 7 input parameters through multi-class classification boundaries and generating actionable threshold recommendations.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
          <Award className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-200 mb-1">Awaiting Student Parameters</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Adjust the sliders on the left or select a persona preset, then click &quot;Predict Performance&quot; to inspect ML classification and personalized recommendations.
        </p>
      </div>
    );
  }

  // Category Configuration (Color Palette & Badges matching Page 5 & 10)
  const categoryConfig: Record<
    PerformanceCategory,
    {
      badgeClass: string;
      glowClass: string;
      barClass: string;
      accentColor: string;
      icon: React.ReactNode;
      headline: string;
      description: string;
    }
  > = {
    Excellent: {
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40',
      glowClass: 'shadow-[0_0_30px_rgba(6,182,212,0.18)] border-cyan-500/30',
      barClass: 'bg-cyan-400',
      accentColor: '#06b6d4',
      icon: <Award className="w-6 h-6 text-cyan-400" />,
      headline: 'Honors Performance Band',
      description: 'Outstanding study discipline, strong lecture attendance, and robust exam retention.',
    },
    Good: {
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
      glowClass: 'shadow-[0_0_30px_rgba(16,185,129,0.18)] border-emerald-500/30',
      barClass: 'bg-emerald-400',
      accentColor: '#10b981',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      headline: 'Proficient Performance Band',
      description: 'Solid continuous assessment marks and dependable study schedule with slight room for honors elevation.',
    },
    Average: {
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
      glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.18)] border-amber-500/30',
      barClass: 'bg-amber-400',
      accentColor: '#f59e0b',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      headline: 'Satisfactory / Passing Band',
      description: 'Meets core passing criteria but vulnerable to midterm drops without targeted revision and attendance.',
    },
    'Needs Improvement': {
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
      glowClass: 'shadow-[0_0_30px_rgba(239,68,68,0.18)] border-rose-500/30',
      barClass: 'bg-rose-400',
      accentColor: '#ef4444',
      icon: <XCircle className="w-6 h-6 text-rose-400" />,
      headline: 'High-Priority Academic Support Required',
      description: 'Immediate intervention needed to improve attendance, structured study routines, and submission rates.',
    },
  };

  const currentTheme = categoryConfig[result.prediction];
  const confidencePct = Math.round(result.confidence * 1000) / 10;

  return (
    <div
      id="prediction-result-card"
      className={`bg-slate-900/90 border rounded-2xl p-5 sm:p-6 transition-all duration-300 backdrop-blur-md relative ${currentTheme.glowClass}`}
    >
      {/* Top Banner: Predicted Category & Confidence Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Predicted Academic Standing
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              {currentTheme.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {result.prediction}
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${currentTheme.badgeClass}`}>
                  Tier {result.prediction === 'Excellent' ? '1' : result.prediction === 'Good' ? '2' : result.prediction === 'Average' ? '3' : '4'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentTheme.headline}</p>
            </div>
          </div>
        </div>

        {/* Confidence Gauge Box */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-4 min-w-[180px]">
          <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * confidencePct) / 100}
                strokeLinecap="round"
                className={`${currentTheme.badgeClass.includes('cyan') ? 'text-cyan-400' : currentTheme.badgeClass.includes('emerald') ? 'text-emerald-400' : currentTheme.badgeClass.includes('amber') ? 'text-amber-400' : 'text-rose-400'}`}
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-bold text-white">
              {Math.round(confidencePct)}%
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              Confidence Score
            </span>
            <span className="text-lg font-bold font-mono text-white">
              {confidencePct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 block">Decision Tree node certainty</span>
          </div>
        </div>
      </div>

      {/* Probability Distribution Across All 4 Classes */}
      <div className="py-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Multi-Class Probability Distribution</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">Softmax Ensemble Probabilities</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Excellent', 'Good', 'Average', 'Needs Improvement'] as PerformanceCategory[]).map((cat) => {
            const prob = (result.probabilities[cat] || 0) * 100;
            const isWinner = result.prediction === cat;
            const colors = {
              Excellent: 'from-cyan-500 to-blue-500 text-cyan-300',
              Good: 'from-emerald-500 to-teal-500 text-emerald-300',
              Average: 'from-amber-500 to-yellow-500 text-amber-300',
              'Needs Improvement': 'from-rose-500 to-red-500 text-rose-300',
            };

            return (
              <div
                key={cat}
                className={`bg-slate-950/70 p-2.5 rounded-xl border transition-all ${
                  isWinner
                    ? 'border-slate-600 bg-slate-950 shadow-inner'
                    : 'border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-medium ${isWinner ? colors[cat].split(' ')[1] : 'text-slate-400'}`}>
                    {cat}
                  </span>
                  <span className="font-mono font-bold text-white text-[11px]">
                    {prob.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors[cat].split(' ')[0]}`}
                    style={{ width: `${Math.max(4, Math.min(100, prob))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI-Driven Dynamic Recommendations (Page 9) */}
      <div className="py-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Actionable AI Recommendations
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Threshold Engine
          </span>
        </div>

        <div className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="mt-0.5 p-1 rounded bg-cyan-500/10 text-cyan-400 flex-shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Impact Diagnostic (Page 6 & 8) */}
      {result.feature_impacts && result.feature_impacts.length > 0 && (
        <div className="py-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Feature Gap Diagnostics
            </h4>
            <span className="text-[11px] text-slate-500">Student vs Target Metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {result.feature_impacts.map((f) => (
              <div
                key={f.feature}
                className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-medium truncate">{f.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      f.status === 'optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : f.status === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 font-mono">
                  <span className="text-sm font-bold text-white">{f.userValue}</span>
                  <span className="text-[10px] text-slate-500">/ {f.idealValue} ideal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Tree Traversal Trace Collapsible */}
      {result.decision_path && result.decision_path.length > 0 && (
        <div className="py-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowDecisionTreePath(!showDecisionTreePath)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            <span className="flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inspect Decision Tree Traversal Path ({result.decision_path.length} nodes)</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showDecisionTreePath ? 'rotate-90' : ''}`} />
          </button>

          {showDecisionTreePath && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              {result.decision_path.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-300 text-[11px]">
                  <span className="text-cyan-400 font-bold">L{idx + 1}:</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Success Roadmap Accordion (Gemini Deep Insights) */}
      <div className="pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            id="ai-roadmap-btn"
            onClick={fetchAiRoadmap}
            disabled={aiRoadmapLoading}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-300" />
            <span>
              {aiRoadmapLoading
                ? 'Synthesizing 4-Week Plan...'
                : showAiRoadmap
                ? 'Hide Academic Turnaround Plan'
                : 'Generate 4-Week AI Success Roadmap'}
            </span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="copy-summary-btn"
              onClick={handleCopySummary}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share / Copy'}</span>
            </button>
          </div>
        </div>

        {showAiRoadmap && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 text-slate-200 text-xs leading-relaxed space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-sm text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Personalized 4-Week Academic Roadmap
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Powered by {aiRoadmapProvider || 'SmartPredict Engine'}
              </span>
            </div>

            {aiRoadmapLoading ? (
              <div className="flex items-center justify-center py-6 space-x-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Formulating personalized study milestones...</span>
              </div>
            ) : (
              <div className="whitespace-pre-line text-slate-300 space-y-2 font-sans">
                {aiRoadmapContent}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
