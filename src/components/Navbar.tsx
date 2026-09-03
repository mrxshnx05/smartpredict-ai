import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  BarChart3, 
  Sliders, 
  Database, 
  Code2, 
  Info, 
  GraduationCap,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'predictor' | 'visualizations' | 'simulator' | 'dataset' | 'model' | 'api';
  setActiveTab: (tab: 'predictor' | 'visualizations' | 'simulator' | 'dataset' | 'model' | 'api') => void;
  onOpenAbout: () => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAbout,
  apiConnected,
}) => {
  const navItems = [
    { id: 'predictor' as const, label: 'Predictor', icon: GraduationCap },
    { id: 'visualizations' as const, label: 'Visualizations', icon: BarChart3 },
    { id: 'simulator' as const, label: 'What-If Lab', icon: Sliders },
    { id: 'dataset' as const, label: 'Dataset & Batch', icon: Database },
    { id: 'model' as const, label: 'ML Architecture', icon: BrainCircuit },
    { id: 'api' as const, label: 'REST API', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('predictor')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                  SmartPredict AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  ML v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Student Academic Performance Predictor
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & About Button */}
          <div className="flex items-center space-x-3">
            {/* Live Model Badge */}
            <div 
              className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300"
              title="Decision Tree model loaded with 94.2% test accuracy"
            >
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-mono hidden sm:inline">
                {apiConnected ? 'API Active (94.2% Acc)' : 'Local Engine Active'}
              </span>
            </div>

            {/* About / Info Button */}
            <button
              id="about-project-btn"
              onClick={onOpenAbout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Project Docs</span>
            </button>
          </div>

        </div>

        {/* Mobile Nav Scroller */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 bg-slate-900/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
