import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Terminal, Globe, ShieldCheck } from 'lucide-react';
import { StudentInput } from '../types/student';

interface ApiConsoleProps {
  currentInput: StudentInput;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({ currentInput }) => {
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        study_hours: currentInput.study_hours,
        attendance_pct: currentInput.attendance_pct,
        previous_score: currentInput.previous_score,
        assignment_completion: currentInput.assignment_completion,
        sleep_hours: currentInput.sleep_hours,
        participation: currentInput.participation,
        previous_performance: currentInput.previous_performance,
      },
      null,
      2
    )
  );

  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<'curl' | 'python' | 'js' | null>(null);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<'curl' | 'python' | 'js'>('curl');

  const handleSendRequest = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      const parsedBody = JSON.parse(requestBody);
      const res = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedBody),
      });

      const latency = Math.round(performance.now() - start);
      setResponseLatency(latency);
      setResponseStatus(res.status);
      const json = await res.json();
      setResponseData(json);
    } catch (err: any) {
      setResponseStatus(400);
      setResponseData({ error: 'Malformed JSON or Network Exception', details: err.message });
      setResponseLatency(Math.round(performance.now() - start));
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithCurrentInput = () => {
    setRequestBody(
      JSON.stringify(
        {
          study_hours: currentInput.study_hours,
          attendance_pct: currentInput.attendance_pct,
          previous_score: currentInput.previous_score,
          assignment_completion: currentInput.assignment_completion,
          sleep_hours: currentInput.sleep_hours,
          participation: currentInput.participation,
          previous_performance: currentInput.previous_performance,
        },
        null,
        2
      )
    );
  };

  const curlCommand = `curl -X POST "${window.location.origin}/predict" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/\n\s*/g, ' ')}'`;

  const pythonCode = `import requests

url = "${window.location.origin}/predict"
payload = ${requestBody}

response = requests.post(url, json=payload)
data = response.json()
print("Prediction:", data["prediction"])
print("Confidence:", data["confidence"])
print("Recommendations:", data["recommendations"])`;

  const jsCode = `const response = await fetch("${window.location.origin}/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${requestBody})
});
const data = await response.json();
console.log(data);`;

  const copySnippet = (type: 'curl' | 'python' | 'js') => {
    let snippet = curlCommand;
    if (type === 'python') snippet = pythonCode;
    if (type === 'js') snippet = jsCode;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Interactive REST API Console
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test the live <code>POST /predict</code> and <code>POST /api/predict</code> endpoints matching Page 7 specifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={syncWithCurrentInput}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Sync with Form
          </button>
        </div>
      </div>

      {/* Endpoint Spec Header */}
      <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
          POST
        </span>
        <span className="text-slate-200 font-bold">/predict</span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden sm:inline">Alias: /api/predict</span>
        <span className="ml-auto text-cyan-400 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[11px]">CORS & Validation Enabled</span>
        </span>
      </div>

      {/* Request & Response Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Request Payload Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Request Payload (JSON)
            </span>
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={12}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full bg-slate-950 text-xs font-mono text-cyan-300 p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Response Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              API Response
            </span>
            {responseStatus && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    responseStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Status: {responseStatus}
                </span>
                {responseLatency && (
                  <span className="text-slate-500">{responseLatency}ms</span>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <pre className="w-full h-[252px] bg-slate-950 text-xs font-mono text-slate-200 p-3.5 rounded-xl border border-slate-800 overflow-y-auto leading-relaxed">
              {responseData ? (
                JSON.stringify(responseData, null, 2)
              ) : (
                <span className="text-slate-600 italic">
                  Click &quot;Send Request&quot; to execute inference through the backend endpoint...
                </span>
              )}
            </pre>
          </div>
        </div>

      </div>

      {/* Code Integration Snippets */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveCodeSnippet('curl')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${
                activeCodeSnippet === 'curl' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              cURL (Bash)
            </button>
            <button
              onClick={() => setActiveCodeSnippet('python')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${
                activeCodeSnippet === 'python' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              Python (requests)
            </button>
            <button
              onClick={() => setActiveCodeSnippet('js')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${
                activeCodeSnippet === 'js' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              JavaScript (fetch)
            </button>
          </div>

          <button
            onClick={() => copySnippet(activeCodeSnippet)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
          >
            {copiedCode === activeCodeSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
          {activeCodeSnippet === 'curl' && curlCommand}
          {activeCodeSnippet === 'python' && pythonCode}
          {activeCodeSnippet === 'js' && jsCode}
        </pre>
      </div>

    </div>
  );
};
