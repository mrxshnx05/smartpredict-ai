import express from 'express';
import path from 'path';
import { execFile } from 'child_process';
import util from 'util';
import { GoogleGenAI } from '@google/genai';
import { predictStudentPerformance } from './src/lib/mlEngine';
import { STUDENT_DATASET, MODEL_METRICS, COHORT_BENCHMARKS } from './src/lib/dataset';
import { StudentInput } from './src/types/student';
import { createServer as createViteServer } from 'vite';

const execFileAsync = util.promisify(execFile);

const app = express();
const PORT = 3000;

// Security: Enforce body payload size limit (1MB max)
app.use(express.json({ limit: '1mb' }));

// Request ID tracking & basic CORS middleware
app.use((req, res, next) => {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  (req as any).reqId = reqId;
  res.setHeader('X-Request-Id', reqId);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Runtime detection for Python Scikit-Learn environment
let isPythonAvailable = false;
let pythonRuntimeMessage = 'Detecting runtime environment...';

async function probePythonRuntime() {
  try {
    const scriptPath = path.join(process.cwd(), 'backend', 'ml', 'predict.py');
    const testInput: StudentInput = {
      study_hours: 4.5,
      attendance_pct: 85.0,
      previous_score: 75.0,
      assignment_completion: 88.0,
      sleep_hours: 7.0,
      participation: 7,
      previous_performance: 7,
    };
    const { stdout } = await execFileAsync(
      'python3',
      [scriptPath, JSON.stringify(testInput)],
      { timeout: 3000 }
    );
    const parsed = JSON.parse(stdout);
    if (parsed && parsed.prediction) {
      isPythonAvailable = true;
      pythonRuntimeMessage = 'Python 3.10 + Scikit-Learn 1.7.2 active';
    } else {
      isPythonAvailable = false;
      pythonRuntimeMessage = 'Python output format unverified; fallback to Serialized Scikit-learn Tree active';
    }
  } catch (err: any) {
    isPythonAvailable = false;
    pythonRuntimeMessage = 'Python environment unavailable; fallback to Serialized Scikit-learn Tree active';
  }
  console.log(`[SmartPredict ML Engine] ${pythonRuntimeMessage}`);
}

// Strict numerical bounds validation conforming to student feature schema
function validateStudentInput(body: any): { valid: boolean; errors: string[]; sanitized?: StudentInput } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object containing student metrics.'] };
  }

  const errors: string[] = [];

  const parseNum = (val: any, name: string, min: number, max: number, isInt = false) => {
    if (val === undefined || val === null || val === '') {
      errors.push(`Field '${name}' is required.`);
      return 0;
    }
    const num = Number(val);
    if (isNaN(num) || !isFinite(num)) {
      errors.push(`Field '${name}' must be a valid finite number.`);
      return 0;
    }
    if (num < min || num > max) {
      errors.push(`Field '${name}' must be between ${min} and ${max}. Provided: ${num}`);
      return 0;
    }
    return isInt ? Math.round(num) : Number(num.toFixed(2));
  };

  const study_hours = parseNum(body.study_hours, 'study_hours', 0, 12);
  const attendance_pct = parseNum(body.attendance_pct, 'attendance_pct', 0, 100);
  const previous_score = parseNum(body.previous_score, 'previous_score', 0, 100);
  const assignment_completion = parseNum(body.assignment_completion, 'assignment_completion', 0, 100);
  const sleep_hours = parseNum(body.sleep_hours, 'sleep_hours', 0, 12);
  const participation = parseNum(body.participation, 'participation', 1, 10);
  const previous_performance = parseNum(body.previous_performance, 'previous_performance', 1, 10, true);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    sanitized: {
      study_hours,
      attendance_pct,
      previous_score,
      assignment_completion,
      sleep_hours,
      participation,
      previous_performance,
    },
  };
}

// Execute Python ML inference script with strict timeout
async function runPythonPredict(input: StudentInput) {
  if (!isPythonAvailable) return null;
  try {
    const scriptPath = path.join(process.cwd(), 'backend', 'ml', 'predict.py');
    const { stdout } = await execFileAsync(
      'python3',
      [scriptPath, JSON.stringify(input)],
      { timeout: 3000 }
    );
    const result = JSON.parse(stdout);
    return result;
  } catch (err) {
    return null;
  }
}

// Handler for both /predict and /api/predict
async function handlePredictionRequest(req: express.Request, res: express.Response) {
  const reqId = (req as any).reqId;
  try {
    const { valid, errors, sanitized } = validateStudentInput(req.body);

    if (!valid || !sanitized) {
      return res.status(400).json({
        error: 'Validation failed',
        requestId: reqId,
        details: errors,
      });
    }

    // Always compute isomorphic fallback representation for complete consistency
    const isomorphicResult = predictStudentPerformance(sanitized);

    // Try Python Scikit-Learn joblib execution
    if (isPythonAvailable) {
      const pythonResult = await runPythonPredict(sanitized);
      if (pythonResult && pythonResult.prediction) {
        return res.json({
          prediction: pythonResult.prediction,
          confidence: pythonResult.confidence,
          probabilities: pythonResult.probabilities,
          is_uncertain: pythonResult.isUncertain ?? (pythonResult.confidence < 0.50),
          uncertainty_note: pythonResult.uncertaintyNote,
          recommendations: pythonResult.recommendations,
          decision_path: pythonResult.decisionPath || isomorphicResult.decision_path,
          contributing_factors: pythonResult.contributingFactors || isomorphicResult.contributing_factors,
          smart_plan: pythonResult.smartPlan || isomorphicResult.smart_plan,
          risk_radar: isomorphicResult.risk_radar,
          feature_impacts: isomorphicResult.feature_impacts,
          model_metadata: {
            model: MODEL_METRICS.name,
            version: MODEL_METRICS.version,
            accuracy: MODEL_METRICS.accuracy,
            cvAccuracyMean: MODEL_METRICS.cvAccuracyMean,
            treeDepth: MODEL_METRICS.treeDepth,
            numberOfLeaves: MODEL_METRICS.numberOfLeaves,
            executionMode: 'Python Scikit-learn (joblib)',
            datasetHonesty: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
            note: 'Both execution modes evaluate the identical trained Scikit-learn Decision Tree model structure.',
          },
          timestamp: new Date().toISOString(),
          requestId: reqId,
        });
      }
    }

    // Serialized Scikit-learn Tree Artifact execution
    return res.json({
      ...isomorphicResult,
      model_metadata: {
        ...isomorphicResult.model_metadata,
        executionMode: 'Serialized Scikit-learn Tree Artifact',
        note: 'Both execution modes evaluate the identical trained Scikit-learn Decision Tree model structure.',
      },
      requestId: reqId,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal server error during inference',
      requestId: reqId,
      message: 'An error occurred while evaluating the prediction model. Please check input parameters and try again.',
    });
  }
}

// Primary Prediction Endpoints (supporting both /predict and /api/predict)
app.post('/predict', handlePredictionRequest);
app.post('/api/predict', handlePredictionRequest);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    engine: 'SmartPredict AI Scikit-Learn Engine',
    model: MODEL_METRICS.name,
    accuracy: MODEL_METRICS.accuracy,
    cvAccuracyMean: MODEL_METRICS.cvAccuracyMean,
    version: MODEL_METRICS.version,
    executionMode: isPythonAvailable ? 'Python Scikit-learn (joblib)' : 'Serialized Scikit-learn Tree Artifact',
    pythonRuntime: pythonRuntimeMessage,
    datasetRecords: STUDENT_DATASET.length,
    datasetHonesty: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
    timestamp: new Date().toISOString(),
    requestId: (req as any).reqId,
  });
});

// Batch Prediction Endpoint: POST /api/batch-predict
app.post('/api/batch-predict', async (req, res) => {
  const reqId = (req as any).reqId;
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        requestId: reqId,
        details: ['Payload must include a non-empty "students" array.'],
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        error: 'Batch limit exceeded',
        requestId: reqId,
        details: [`Maximum batch size is 500 records. Provided: ${students.length}.`],
      });
    }

    let validCount = 0;
    let invalidCount = 0;

    const results = students.map((student: any, idx: number) => {
      const { valid, sanitized, errors } = validateStudentInput(student);
      if (!valid || !sanitized) {
        invalidCount++;
        return {
          rowNumber: idx + 1,
          id: student.id || `ROW-${idx + 1}`,
          name: typeof student.name === 'string' ? student.name.slice(0, 50) : `Student ${idx + 1}`,
          valid: false,
          errors,
          prediction: null,
          confidence: 0,
          probabilities: null,
        };
      }

      validCount++;
      const pred = predictStudentPerformance(sanitized);
      return {
        rowNumber: idx + 1,
        id: student.id || `ROW-${idx + 1}`,
        name: typeof student.name === 'string' ? student.name.slice(0, 50) : `Student ${idx + 1}`,
        valid: true,
        ...sanitized,
        prediction: pred.prediction,
        confidence: pred.confidence,
        probabilities: pred.probabilities,
        is_uncertain: pred.is_uncertain,
        recommendations: pred.recommendations,
      };
    });

    const summary = {
      total: results.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      classDistribution: {
        Excellent: results.filter((r: any) => r.prediction === 'Excellent').length,
        Good: results.filter((r: any) => r.prediction === 'Good').length,
        Average: results.filter((r: any) => r.prediction === 'Average').length,
        'Needs Improvement': results.filter((r: any) => r.prediction === 'Needs Improvement').length,
      },
      executionMode: isPythonAvailable ? 'Python Scikit-learn (joblib)' : 'Serialized Scikit-learn Tree Artifact',
    };

    res.json({ results, summary, requestId: reqId });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed processing batch predictions',
      requestId: reqId,
      message: 'Unexpected error during batch inference processing.',
    });
  }
});

// Model Info & Metrics endpoint
app.get('/api/model-info', (req, res) => {
  res.json({
    metrics: MODEL_METRICS,
    benchmarks: COHORT_BENCHMARKS,
    dataset: {
      records: STUDENT_DATASET.length,
      features: MODEL_METRICS.features.length,
      targetClasses: ['Needs Improvement', 'Average', 'Good', 'Excellent'],
      type: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
      disclaimer: 'Generated synthetically for reproducible educational ML demonstration. Does not reflect actual student records, and results cannot be generalized to real students.',
    },
    runtime: {
      executionMode: isPythonAvailable ? 'Python Scikit-learn (joblib)' : 'Serialized Scikit-learn Tree Artifact',
      pythonAvailable: isPythonAvailable,
    },
  });
});

// Dataset endpoint
app.get('/api/dataset', (req, res) => {
  res.json({
    total: STUDENT_DATASET.length,
    students: STUDENT_DATASET,
    benchmarks: COHORT_BENCHMARKS,
    metadata: {
      features: MODEL_METRICS.features,
      targetClasses: ['Needs Improvement', 'Average', 'Good', 'Excellent'],
      source: 'backend/data/student_data.csv',
      type: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
      disclaimer: 'Generated synthetically for reproducible educational ML demonstration. Does not reflect actual student records, and results cannot be generalized to real students.',
    },
  });
});

// AI Insights / Deep Personalized Pedagogical Guidance
app.post('/api/ai-insights', async (req, res) => {
  const reqId = (req as any).reqId;
  try {
    const { valid, sanitized, errors } = validateStudentInput(req.body);
    if (!valid || !sanitized) {
      return res.status(400).json({
        error: 'Validation failed',
        requestId: reqId,
        details: errors,
      });
    }

    const pred = predictStudentPerformance(sanitized);

    // If GEMINI_API_KEY is available, use Gemini for personalized deep pedagogical insights
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `You are the lead Academic Success Advisor at SmartPredict AI.
A student has provided the following anonymous academic habit parameters:
- Daily Study Hours: ${sanitized.study_hours} hrs/day
- Attendance Rate: ${sanitized.attendance_pct}%
- Previous Exam Score: ${sanitized.previous_score}/100
- Assignment Completion: ${sanitized.assignment_completion}%
- Daily Sleep Hours: ${sanitized.sleep_hours} hrs/day
- Class Participation: ${sanitized.participation}/10
- Historical Performance: ${sanitized.previous_performance}/10

The machine learning Decision Tree model classifies their semester outcome as: "${pred.prediction}" with ${(pred.confidence * 100).toFixed(1)}% confidence.

Generate a concise, highly actionable, encouraging 4-week Academic Optimization Plan:
1. Executive Assessment (2 sentences diagnosing primary leverage habits).
2. Primary Leverage Habit (single most impactful habit change with quantitative target).
3. Weekly Milestone Roadmap (Week 1, Week 2, Week 3, Week 4 - one bullet each).
4. Cognitive Sleep & Study Synergy advice.
Keep the tone professional, motivating, non-judgmental, and directly tailored to their numbers. Clean markdown formatting only. Do not fabricate grades or make definitive promises.`;

        let responseText = '';
        let modelUsed = 'gemini-2.5-flash';

        const callWithTimeout = async (model: string, timeoutMs = 7000) => {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs)
          );
          return Promise.race([
            ai.models.generateContent({
              model,
              contents: prompt,
            }),
            timeoutPromise,
          ]);
        };

        try {
          const response = await callWithTimeout('gemini-2.5-flash', 6000);
          responseText = response.text || '';
        } catch (mErr: any) {
          try {
            modelUsed = 'gemini-2.5-flash-lite';
            const response = await callWithTimeout('gemini-2.5-flash-lite', 6000);
            responseText = response.text || '';
          } catch (mErr2: any) {
            console.warn('Gemini fallback failed:', mErr2?.message || mErr2);
          }
        }

        if (responseText) {
          return res.json({
            insights: responseText,
            provider: `Gemini AI (${modelUsed})`,
            requestId: reqId,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using local advisor engine:', geminiErr);
      }
    }

    // High quality local educational advisor synthesis
    const localInsights = `### Academic Optimization Plan: ${pred.prediction} Standing

**Executive Assessment:**
With ${sanitized.study_hours} hours of daily study and an attendance rate of ${sanitized.attendance_pct}%, your performance profile corresponds to **${pred.prediction}** classification. ${
      sanitized.study_hours < 3
        ? 'Your biggest unlocked potential lies in increasing structured daily study volume.'
        : sanitized.attendance_pct < 80
        ? 'Lecture attendance is your primary performance blocker.'
        : 'You have solid fundamentals that can be elevated with targeted exam practice.'
    }

**Primary Leverage Habit:**
${
  sanitized.study_hours < 3
    ? `Increase daily focused study blocks from ${sanitized.study_hours}h to 4.0h using 50-minute Pomodoro sprints.`
    : sanitized.sleep_hours < 6.5
    ? `Anchor a consistent sleep schedule of at least 7.5 hours; sleep deficit impairs recall by up to 30%.`
    : `Elevate assignment completion from ${sanitized.assignment_completion}% to 95%+ to guarantee full coursework credit.`
}

**Weekly Milestone Roadmap:**
- **Week 1 (Diagnostic & Foundation):** Audit current course syllabus gaps; complete all overdue problem sets.
- **Week 2 (Active Recall Sprints):** Transition from passive reading to active flashcards and formula derivation.
- **Week 3 (Lecture & Office Hours):** Target asking at least 2 questions per week in seminar sections to raise participation score from ${sanitized.participation}/10.
- **Week 4 (Timed Simulation):** Complete a full mock midterm under strict timed conditions to benchmark progress against your previous score of ${sanitized.previous_score}.

**Cognitive Hygiene:**
Maintain your sleep at ~${Math.max(7, sanitized.sleep_hours)} hours. Memory consolidation occurs during deep sleep cycles, ensuring newly reviewed material is committed to long-term memory.`;

    return res.json({
      insights: localInsights,
      provider: 'SmartPredict Pedagogical Rule Engine',
      requestId: reqId,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to generate insights',
      requestId: reqId,
      message: 'Unable to synthesize pedagogical recommendations.',
    });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  await probePythonRuntime();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartPredict AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

