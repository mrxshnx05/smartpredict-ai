import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from 'recharts';
import { STUDENT_DATASET, COHORT_BENCHMARKS } from '../lib/dataset';
import { StudentInput, PerformanceCategory } from '../types/student';
import { BarChart3, LineChart as LineIcon, Activity, Radar as RadarIcon, Filter } from 'lucide-react';

interface ChartsProps {
  currentStudent?: StudentInput;
}

export const Charts: React.FC<ChartsProps> = ({ currentStudent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'study' | 'attendance' | 'distribution' | 'radar'>('study');

  // Filter dataset based on selected category if desired
  const filteredDataset = useMemo(() => {
    if (selectedCategory === 'All') return STUDENT_DATASET;
    return STUDENT_DATASET.filter((s) => s.predicted_class === selectedCategory);
  }, [selectedCategory]);

  // 1. Study Hours vs Performance (Correlate study hour bins with category counts)
  const studyHoursData = useMemo(() => {
    const bins = [
      { range: '0–2h', binMax: 2, count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { range: '2–4h', binMax: 4, count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { range: '4–6h', binMax: 6, count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { range: '6–8h', binMax: 8, count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { range: '8h+', binMax: 100, count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
    ];

    filteredDataset.forEach((s) => {
      let bin = bins[0];
      if (s.study_hours >= 8) bin = bins[4];
      else if (s.study_hours >= 6) bin = bins[3];
      else if (s.study_hours >= 4) bin = bins[2];
      else if (s.study_hours >= 2) bin = bins[1];

      bin.count++;
      bin[s.predicted_class]++;
    });

    return bins;
  }, [filteredDataset]);

  // 2. Attendance % vs Average Score Trend (Line chart showing score elevation with attendance)
  const attendanceTrendData = useMemo(() => {
    const brackets = [
      { bracket: '<60%', min: 0, max: 60, totalScore: 0, count: 0, avgScore: 0, avgStudy: 0, totalStudy: 0 },
      { bracket: '60–70%', min: 60, max: 70, totalScore: 0, count: 0, avgScore: 0, avgStudy: 0, totalStudy: 0 },
      { bracket: '70–80%', min: 70, max: 80, totalScore: 0, count: 0, avgScore: 0, avgStudy: 0, totalStudy: 0 },
      { bracket: '80–90%', min: 80, max: 90, totalScore: 0, count: 0, avgScore: 0, avgStudy: 0, totalStudy: 0 },
      { bracket: '90–100%', min: 90, max: 101, totalScore: 0, count: 0, avgScore: 0, avgStudy: 0, totalStudy: 0 },
    ];

    filteredDataset.forEach((s) => {
      const b = brackets.find((br) => s.attendance_pct >= br.min && s.attendance_pct < br.max);
      if (b) {
        b.totalScore += s.previous_score;
        b.totalStudy += s.study_hours;
        b.count++;
      }
    });

    return brackets.map((b) => ({
      bracket: b.bracket,
      'Avg Score': b.count ? +(b.totalScore / b.count).toFixed(1) : 0,
      'Avg Study Hours': b.count ? +(b.totalStudy / b.count).toFixed(1) : 0,
      'Student Count': b.count,
    }));
  }, [filteredDataset]);

  // 3. Previous Score Distribution (Histogram across score bands 0-40, 40-60, 60-75, 75-85, 85-100)
  const scoreDistributionData = useMemo(() => {
    const buckets = [
      { band: '0–45 (Critical)', count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { band: '46–60 (Low)', count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { band: '61–75 (Moderate)', count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { band: '76–88 (High)', count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
      { band: '89–100 (Elite)', count: 0, Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 },
    ];

    filteredDataset.forEach((s) => {
      let b = buckets[0];
      if (s.previous_score >= 89) b = buckets[4];
      else if (s.previous_score >= 76) b = buckets[3];
      else if (s.previous_score >= 61) b = buckets[2];
      else if (s.previous_score >= 46) b = buckets[1];

      b.count++;
      b[s.predicted_class]++;
    });

    return buckets;
  }, [filteredDataset]);

  // 4. Student vs Cohort Benchmark Radar
  const radarData = useMemo(() => {
    const student = currentStudent || {
      study_hours: 4.5,
      attendance_pct: 88,
      previous_score: 78,
      assignment_completion: 85,
      sleep_hours: 7.0,
      participation: 7,
      previous_performance: 7,
    };

    return [
      {
        metric: 'Study Hours',
        current: +(student.study_hours * 8.33).toFixed(1), // norm to 0-100
        cohort: +(COHORT_BENCHMARKS.study_hours * 8.33).toFixed(1),
        rawCurrent: `${student.study_hours}h`,
        rawCohort: `${COHORT_BENCHMARKS.study_hours}h`,
      },
      {
        metric: 'Attendance',
        current: student.attendance_pct,
        cohort: COHORT_BENCHMARKS.attendance_pct,
        rawCurrent: `${student.attendance_pct}%`,
        rawCohort: `${COHORT_BENCHMARKS.attendance_pct}%`,
      },
      {
        metric: 'Exam Score',
        current: student.previous_score,
        cohort: COHORT_BENCHMARKS.previous_score,
        rawCurrent: `${student.previous_score} pts`,
        rawCohort: `${COHORT_BENCHMARKS.previous_score} pts`,
      },
      {
        metric: 'Assignments',
        current: student.assignment_completion,
        cohort: COHORT_BENCHMARKS.assignment_completion,
        rawCurrent: `${student.assignment_completion}%`,
        rawCohort: `${COHORT_BENCHMARKS.assignment_completion}%`,
      },
      {
        metric: 'Sleep Balance',
        current: +(Math.min(100, student.sleep_hours * 12.5)).toFixed(1),
        cohort: +(Math.min(100, COHORT_BENCHMARKS.sleep_hours * 12.5)).toFixed(1),
        rawCurrent: `${student.sleep_hours}h`,
        rawCohort: `${COHORT_BENCHMARKS.sleep_hours}h`,
      },
      {
        metric: 'Participation',
        current: student.participation * 10,
        cohort: COHORT_BENCHMARKS.participation * 10,
        rawCurrent: `${student.participation}/10`,
        rawCohort: `${COHORT_BENCHMARKS.participation}/10`,
      },
    ];
  }, [currentStudent]);

  // Color constants matching doc
  const COLORS = {
    Excellent: '#06b6d4', // Cyan
    Good: '#10b981', // Green
    Average: '#f59e0b', // Yellow
    'Needs Improvement': '#ef4444', // Red
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Interactive Data Visualizations & Trends</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical correlations derived from the trained student academic dataset ({STUDENT_DATASET.length} sample records).
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('study')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'study'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Study vs Class</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'attendance'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Attendance Impact</span>
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'distribution'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Score Distribution</span>
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'radar'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" />
            <span>Cohort Benchmark</span>
          </button>
        </div>
      </div>

      {/* Category Legend & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center space-x-4 text-xs">
          <span className="font-semibold text-slate-400 hidden sm:inline">Color Codes:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-medium">Excellent (Cyan)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">Good (Green)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-medium">Average (Yellow)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-300 font-medium">Needs Imp. (Red)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Excellent">Filter: Excellent</option>
            <option value="Good">Filter: Good</option>
            <option value="Average">Filter: Average</option>
            <option value="Needs Improvement">Filter: Needs Improvement</option>
          </select>
        </div>
      </div>

      {/* Chart View 1: Study Hours vs Performance */}
      {activeTab === 'study' && (
        <div>
          <div className="mb-3 text-xs text-slate-400 flex items-center justify-between">
            <span>
              <strong>Study Hours vs Academic Standing:</strong> Students studying 6+ hours consistently cluster in Excellent or Good bands.
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline">Stacked by Category</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Excellent" stackId="a" fill={COLORS.Excellent} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Good" stackId="a" fill={COLORS.Good} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Average" stackId="a" fill={COLORS.Average} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Needs Improvement" stackId="a" fill={COLORS['Needs Improvement']} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 2: Attendance vs Performance */}
      {activeTab === 'attendance' && (
        <div>
          <div className="mb-3 text-xs text-slate-400 flex items-center justify-between">
            <span>
              <strong>Attendance % vs Average Exam Score:</strong> Students with 85%+ attendance trend significantly higher in examination scores.
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline">Dual-Axis Progression</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bracket" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Avg Score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Avg Study Hours"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 3: Previous Score Distribution */}
      {activeTab === 'distribution' && (
        <div>
          <div className="mb-3 text-xs text-slate-400 flex items-center justify-between">
            <span>
              <strong>Previous Score Distribution Histogram:</strong> Spread of baseline exam scores across performance tiers.
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline">Normalized Bands</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="band" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Needs Improvement" stackId="b" fill={COLORS['Needs Improvement']} />
                <Bar dataKey="Average" stackId="b" fill={COLORS.Average} />
                <Bar dataKey="Good" stackId="b" fill={COLORS.Good} />
                <Bar dataKey="Excellent" stackId="b" fill={COLORS.Excellent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 4: Student vs Cohort Benchmark Radar */}
      {activeTab === 'radar' && (
        <div>
          <div className="mb-3 text-xs text-slate-400 flex items-center justify-between">
            <span>
              <strong>Current Student vs Class Benchmark:</strong> Normalized multi-dimensional radar comparison against cohort baseline.
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline">Normalized 0–100 Scale</span>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                <Radar
                  name="Current Student"
                  dataKey="current"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Cohort Average"
                  dataKey="cohort"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.2}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val, name, item) => [
                    `${val}/100 (${name === 'Current Student' ? item.payload.rawCurrent : item.payload.rawCohort})`,
                    name,
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
