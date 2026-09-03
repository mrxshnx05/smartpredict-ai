import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Layers, 
  ArrowUpDown,
  Play
} from 'lucide-react';
import { STUDENT_DATASET } from '../lib/dataset';
import { StudentRecord, PerformanceCategory } from '../types/student';

interface DatasetExplorerProps {
  onSelectStudent: (record: StudentRecord) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ onSelectStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof StudentRecord>('previous_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Batch CSV state
  const [activeSubTab, setActiveSubTab] = useState<'dataset' | 'batch'>('dataset');
  const [batchRawInput, setBatchRawInput] = useState<string>('');
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [batchSummary, setBatchSummary] = useState<any | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return STUDENT_DATASET.filter((record) => {
      const matchesSearch =
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || record.predicted_class === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [searchQuery, filterCategory, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field: keyof StudentRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export current dataset to CSV
  const exportDatasetCSV = () => {
    const headers = [
      'Student ID',
      'Name',
      'Study Hours',
      'Attendance %',
      'Previous Score',
      'Assignment %',
      'Sleep Hours',
      'Participation',
      'Previous Perf',
      'Predicted Class',
      'Confidence',
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.name,
      r.study_hours,
      r.attendance_pct,
      r.previous_score,
      r.assignment_completion,
      r.sleep_hours,
      r.participation,
      r.previous_performance,
      r.predicted_class,
      (r.confidence * 100).toFixed(1) + '%',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartpredict_student_dataset.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV template loader
  const loadSampleCSV = () => {
    const sample = `name,study_hours,attendance_pct,previous_score,assignment_completion,sleep_hours,participation,previous_performance
Maria Chen,6.5,92.0,88.5,95.0,7.5,9,8
Marcus Brody,2.0,65.0,52.0,60.0,5.0,4,5
Chloe Davis,4.5,84.0,76.0,82.0,7.0,7,7
Aaron Patel,1.2,45.0,38.0,40.0,5.5,3,3
Sophie Miller,7.0,96.0,94.0,98.0,8.0,10,9`;
    setBatchRawInput(sample);
  };

  // Run batch predictions via POST /api/batch-predict
  const runBatchPredict = async () => {
    if (!batchRawInput.trim()) return;
    setBatchLoading(true);

    try {
      // Parse CSV or JSON lines
      const lines = batchRawInput.trim().split('\n');
      const students: any[] = [];

      // Check if first line is header
      const startIndex = lines[0].toLowerCase().includes('study_hours') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 7) {
          // If first column is name
          let name = `Student ${i}`;
          let offset = 0;
          if (isNaN(Number(parts[0]))) {
            name = parts[0];
            offset = 1;
          }

          students.push({
            name,
            study_hours: parseFloat(parts[offset]) || 0,
            attendance_pct: parseFloat(parts[offset + 1]) || 0,
            previous_score: parseFloat(parts[offset + 2]) || 0,
            assignment_completion: parseFloat(parts[offset + 3]) || 0,
            sleep_hours: parseFloat(parts[offset + 4]) || 0,
            participation: parseFloat(parts[offset + 5]) || 5,
            previous_performance: parseInt(parts[offset + 6], 10) || 5,
          });
        }
      }

      const res = await fetch('/api/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      });

      const data = await res.json();
      setBatchResults(data.results);
      setBatchSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setBatchLoading(false);
    }
  };

  // Category badge styles
  const categoryBadgeClass: Record<string, string> = {
    Excellent: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    Good: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    Average: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    'Needs Improvement': 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Dataset & Batch Inference Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect reproducible synthetic demonstration dataset ({STUDENT_DATASET.length} rows) or run bulk predictions from CSV.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('dataset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'dataset'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Training Corpus Table
          </button>
          <button
            onClick={() => setActiveSubTab('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'batch'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batch CSV Prediction
          </button>
        </div>
      </div>

      {activeSubTab === 'dataset' ? (
        <div>
          {/* Dataset Provenance & Privacy Notice */}
          <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Dataset Provenance & Privacy Notice:</span>{' '}
              Reproducible synthetic demonstration dataset generated for educational ML experimentation. Real student records cannot be distributed due to FERPA compliance and privacy mandates. Results demonstrate machine learning modeling mechanics and cannot be generalized to actual students.
            </div>
          </div>

          {/* Controls: Search, Category Filter, Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>
            </div>

            <button
              onClick={exportDatasetCSV}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV ({filteredRecords.length})</span>
            </button>
          </div>

          {/* Dataset Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('id')}>
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center space-x-1">
                      <span>Student Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer text-right" onClick={() => handleSort('study_hours')}>
                    <div className="flex items-center justify-end space-x-1">
                      <span>Study (h)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer text-right" onClick={() => handleSort('attendance_pct')}>
                    <div className="flex items-center justify-end space-x-1">
                      <span>Attendance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer text-right" onClick={() => handleSort('previous_score')}>
                    <div className="flex items-center justify-end space-x-1">
                      <span>Prev Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer text-right" onClick={() => handleSort('assignment_completion')}>
                    <div className="flex items-center justify-end space-x-1">
                      <span>Assignments</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center">Class Standing</th>
                  <th className="px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{record.id}</td>
                    <td className="px-3 py-2.5 font-medium text-white">{record.name}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-cyan-300">{record.study_hours}h</td>
                    <td className="px-3 py-2.5 text-right font-mono text-emerald-300">{record.attendance_pct}%</td>
                    <td className="px-3 py-2.5 text-right font-mono text-purple-300">{record.previous_score}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-indigo-300">{record.assignment_completion}%</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${categoryBadgeClass[record.predicted_class]}`}>
                        {record.predicted_class}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => onSelectStudent(record)}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition-colors font-medium"
                      >
                        Load to Form
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SubTab 2: Batch Predict from CSV */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white">Bulk Student Inference Engine</h4>
              <p className="text-xs text-slate-400">Paste CSV formatted student records below or load sample data to test multi-student inference.</p>
            </div>
            <button
              onClick={loadSampleCSV}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Load 5 Sample Students
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={6}
              value={batchRawInput}
              onChange={(e) => setBatchRawInput(e.target.value)}
              placeholder="name,study_hours,attendance_pct,previous_score,assignment_completion,sleep_hours,participation,previous_performance"
              className="w-full bg-slate-950 text-xs font-mono text-slate-200 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={runBatchPredict}
              disabled={batchLoading || !batchRawInput.trim()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {batchLoading ? (
                <span>Predicting Batch...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Batch Inference (POST /api/batch-predict)</span>
                </>
              )}
            </button>
          </div>

          {/* Batch Summary & Results */}
          {batchSummary && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Batch Outcome Summary ({batchSummary.validRecords ?? batchSummary.total} / {batchSummary.total} Valid)
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="text-cyan-400">
                    {batchSummary.classDistribution?.Excellent ?? batchSummary.excellent ?? 0} Excellent
                  </span>
                  <span className="text-emerald-400">
                    {batchSummary.classDistribution?.Good ?? batchSummary.good ?? 0} Good
                  </span>
                  <span className="text-amber-400">
                    {batchSummary.classDistribution?.Average ?? batchSummary.average ?? 0} Average
                  </span>
                  <span className="text-rose-400">
                    {batchSummary.classDistribution?.['Needs Improvement'] ?? batchSummary.needsImprovement ?? 0} Needs Imp.
                  </span>
                </div>
              </div>

              {batchResults && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {batchResults.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white mr-2">{r.name}</span>
                        <span className="text-[11px] text-slate-400">
                          ({r.study_hours}h study, {r.attendance_pct}% att, {r.previous_score} score)
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${categoryBadgeClass[r.prediction] || 'text-slate-400'}`}>
                          {r.prediction}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-300">
                          {(r.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
