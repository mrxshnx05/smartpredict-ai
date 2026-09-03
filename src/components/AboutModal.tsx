import React, { useState } from 'react';
import { X, BookOpen, Layers, CheckCircle, Brain, Terminal, Github, Mail, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'structure' | 'specs'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              SmartPredict AI — Project Documentation & Specs
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-3 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Stack
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-2 border-b-2 transition-all ${
              activeTab === 'flow'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            9-Step User Flow
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-2 border-b-2 transition-all ${
              activeTab === 'structure'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Project Structure
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-2 border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            UI/UX Design Specs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-sm text-white mb-1">Executive Summary</h4>
                <p>
                  SmartPredict AI is a modern AI/ML web application designed to predict student academic performance using machine learning classification.
                  It demonstrates an end-to-end full-stack AI pipeline: client input collection, threshold validation, Decision Tree inference, confidence scoring,
                  and dynamic AI recommendations.
                </p>
                <div className="mt-2 text-slate-400 text-[11px]">
                  <strong>Target Audience:</strong> Students, educators, beginners in AI/ML, and developers building portfolio projects seeking real-world AI application experience.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-cyan-300 mb-1">Frontend</h5>
                  <p className="text-[11px] text-slate-400">
                    React 19 + TypeScript, Tailwind CSS, Lucide Icons, Recharts data visualizers, Motion transitions.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-emerald-300 mb-1">Backend & REST API</h5>
                  <p className="text-[11px] text-slate-400">
                    Express + Python ML integration, POST /predict endpoint, JSON input validation, error handling, and CORS.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-purple-300 mb-1">Machine Learning</h5>
                  <p className="text-[11px] text-slate-400">
                    Decision Tree Classifier & Logistic Regression with multi-class probabilities across 4 tiers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white mb-2">The Complete 9-Step User Flow</h4>
              <div className="grid grid-cols-1 gap-2 font-sans">
                {[
                  { step: 1, title: 'Open Website', desc: 'User launches SmartPredict AI in their browser.' },
                  { step: 2, title: 'Enter Data', desc: 'User fills in the 7 student parameters or selects persona preset.' },
                  { step: 3, title: 'Click Predict', desc: 'User clicks "Predict Performance" with live loading animation.' },
                  { step: 4, title: 'Frontend Sends Data', desc: 'React packages parameters into JSON and sends POST /predict.' },
                  { step: 5, title: 'Backend Loads ML Model', desc: 'Backend validates input ranges and executes Decision Tree.' },
                  { step: 6, title: 'Model Predicts', desc: 'Scikit-learn model calculates class outcome and confidence.' },
                  { step: 7, title: 'Display Results', desc: 'Predicted category and confidence % are rendered in result card.' },
                  { step: 8, title: 'Show AI Recommendations', desc: 'Dynamic suggestions generated based on input thresholds.' },
                  { step: 9, title: 'Charts Explain Results', desc: 'Interactive charts display Study vs Performance and Attendance.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <span className="font-semibold text-white mr-1.5">{item.title}:</span>
                      <span className="text-slate-400 text-[11px]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">Full-Stack Project Structure</h4>
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
{`Frontend/
├── src/
│   ├── components/
│   │   ├── PredictionForm.tsx
│   │   ├── ResultCard.tsx
│   │   ├── Charts.tsx
│   │   ├── WhatIfSimulator.tsx
│   │   └── DatasetExplorer.tsx
│   ├── types/
│   │   └── student.ts
│   ├── lib/
│   │   ├── mlEngine.ts
│   │   └── dataset.ts
│   ├── App.tsx
│   └── main.tsx
Backend/
├── server.ts (Express REST API)
├── POST /predict
├── POST /api/batch-predict
├── GET /api/model-info
└── GET /api/dataset`}
              </pre>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">Design & Palette Specifications (Page 5)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-cyan-400 block mb-1">Color Palette</span>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    <li>• Deep Blue: Headers, primary buttons, slate layout</li>
                    <li>• Purple: Accent highlights, cards, AI tools</li>
                    <li>• Cyan: Call-to-actions and data visualizations</li>
                    <li>• Category Colors: Cyan, Green, Yellow, Red</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">Typography & Aesthetics</span>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    <li>• Primary Font: Inter / Plus Jakarta Sans</li>
                    <li>• Monospace: JetBrains Mono for metrics</li>
                    <li>• Style: Clean glassmorphic surfaces with soft depth</li>
                    <li>• Responsiveness: Mobile, tablet, desktop fluid layout</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <span className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>smartpredict.ai</span>
            </span>
            <span className="flex items-center space-x-1">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>github.com/smartpredict-ai</span>
            </span>
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>contact@smartpredict.ai</span>
            </span>
          </div>
          <span className="text-slate-500 font-mono">For demo & portfolio use only</span>
        </div>

      </div>
    </div>
  );
};
