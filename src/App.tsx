/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PredictionForm } from './components/PredictionForm';
import { ResultCard } from './components/ResultCard';
import { Charts } from './components/Charts';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ModelExplorer } from './components/ModelExplorer';
import { ApiConsole } from './components/ApiConsole';
import { AboutModal } from './components/AboutModal';
import { StudentInput, PredictionResponse, StudentRecord } from './types/student';
import { PRESET_PROFILES, COHORT_BENCHMARKS } from './lib/dataset';
import { predictStudentPerformance } from './lib/mlEngine';
import { 
  Sparkles, 
  Brain, 
  BarChart3, 
  Sliders, 
  Database, 
  Code2, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'predictor' | 'visualizations' | 'simulator' | 'dataset' | 'model' | 'api'>('predictor');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  // Student Input State (Defaulted to Balanced Achiever)
  const [studentInput, setStudentInput] = useState<StudentInput>(PRESET_PROFILES[1].data);
  
  // Prediction Result State
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Run initial prediction on load so the interface immediately displays rich data
  useEffect(() => {
    runPrediction(studentInput);
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setApiConnected(true);
      } else {
        setApiConnected(false);
      }
    } catch {
      setApiConnected(false);
    }
  };

  const runPrediction = async (customInput?: StudentInput) => {
    const dataToSend = customInput || studentInput;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Send real POST request to /predict
      const res = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details?.join(', ') || errorData.error || 'Prediction request failed');
      }

      const data: PredictionResponse = await res.json();
      setPredictionResult(data);
      setApiConnected(true);
    } catch (err: any) {
      console.warn('Backend /predict failed, running via local ML engine fallback:', err.message);
      // Seamless client-side ML engine fallback ensures no interruption
      const fallbackResult = predictStudentPerformance(dataToSend);
      setPredictionResult(fallbackResult);
      if (!err.message.includes('failed to fetch')) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudentFromDataset = (record: StudentRecord) => {
    const input: StudentInput = {
      study_hours: record.study_hours,
      attendance_pct: record.attendance_pct,
      previous_score: record.previous_score,
      assignment_completion: record.assignment_completion,
      sleep_hours: record.sleep_hours,
      participation: record.participation,
      previous_performance: record.previous_performance,
    };
    setStudentInput(input);
    setActiveTab('predictor');
    runPrediction(input);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setShowAboutModal(true)}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: PREDICTOR (Primary View) */}
        {activeTab === 'predictor' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Quick Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6 border border-slate-800 shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider">
                      Decision Tree ML Engine
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-300 font-mono">
                      Cohort Baseline: {COHORT_BENCHMARKS.study_hours}h study / {COHORT_BENCHMARKS.attendance_pct}% att
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
                    Student Performance Predictor
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Evaluate 7 high-impact academic metrics to forecast semester classification into 
                    <strong className="text-cyan-400"> Excellent</strong>, 
                    <strong className="text-emerald-400"> Good</strong>, 
                    <strong className="text-amber-400"> Average</strong>, or 
                    <strong className="text-rose-400"> Needs Improvement</strong> with AI-powered guidance.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('visualizations')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Cohort Charts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 border border-cyan-500/40 transition-colors shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>What-If Lab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split Screen Layout: Left Form / Right Result Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: 7 Input Parameters Form (5 cols on large) */}
              <div className="lg:col-span-6 xl:col-span-6">
                <PredictionForm
                  input={studentInput}
                  setInput={setStudentInput}
                  onSubmit={() => runPrediction()}
                  isLoading={isLoading}
                />
              </div>

              {/* Right Column: Prediction Outcome & Recommendations (6 cols on large) */}
              <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                <ResultCard
                  result={predictionResult}
                  input={studentInput}
                  isLoading={isLoading}
                />

                {/* Quick Shortcuts to other features */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <strong className="text-white">Explore Sensitivity: </strong>
                    Want to see what happens if you increase study hours or sleep?
                  </div>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="self-start sm:self-auto flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    <span>Launch What-If Lab</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

            {/* Embedded Live Visualizations preview below predictor */}
            <div className="pt-4">
              <Charts currentStudent={studentInput} />
            </div>

          </div>
        )}

        {/* TAB 2: VISUALIZATIONS */}
        {activeTab === 'visualizations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Charts currentStudent={studentInput} />
          </div>
        )}

        {/* TAB 3: WHAT-IF SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <WhatIfSimulator initialInput={studentInput} />
          </div>
        )}

        {/* TAB 4: DATASET & BATCH */}
        {activeTab === 'dataset' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DatasetExplorer onSelectStudent={handleSelectStudentFromDataset} />
          </div>
        )}

        {/* TAB 5: MODEL ARCHITECTURE */}
        {activeTab === 'model' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ModelExplorer />
          </div>
        )}

        {/* TAB 6: REST API PLAYGROUND */}
        {activeTab === 'api' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ApiConsole currentInput={studentInput} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">SmartPredict AI</span>
            <span>—</span>
            <span>Student Academic Performance Predictor</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <button onClick={() => setShowAboutModal(true)} className="hover:text-cyan-400 transition-colors">
              Project Overview
            </button>
            <button onClick={() => setActiveTab('api')} className="hover:text-cyan-400 transition-colors">
              API Specs (POST /predict)
            </button>
            <button onClick={() => setActiveTab('model')} className="hover:text-cyan-400 transition-colors">
              Decision Tree Metrics
            </button>
          </div>
        </div>
      </footer>

      {/* About / Document Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

    </div>
  );
}
