import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { predictStudentPerformance } from './src/lib/mlEngine';
import { STUDENT_DATASET, MODEL_METRICS, COHORT_BENCHMARKS } from './src/lib/dataset';
import { StudentInput } from './src/types/student';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable JSON parsing
app.use(express.json());

// Enable basic CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: Validate input according to specifications
function validateStudentInput(body: any): { valid: boolean; errors: string[]; sanitized?: StudentInput } {
  const errors: string[] = [];

  const parseNum = (val: any, name: string, min: number, max: number, isInt = false) => {
    if (val === undefined || val === null || val === '') {
      errors.push(`Field '${name}' is required.`);
      return 0;
    }
    const num = Number(val);
    if (isNaN(num)) {
      errors.push(`Field '${name}' must be a valid number.`);
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

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartPredict AI Backend', version: '2.4.0' });
});

// Endpoint: POST /predict (and /api/predict) as specified in Page 7 of the document
const handlePredict = (req: express.Request, res: express.Response) => {
  try {
    const { valid, errors, sanitized } = validateStudentInput(req.body);

    if (!valid || !sanitized) {
      return res.status(400).json({
        error: 'Input validation failed',
        details: errors,
      });
    }

    const predictionResult = predictStudentPerformance(sanitized);

    // Exact response schema specified on Page 7:
    // prediction, confidence, recommendations
    return res.status(200).json({
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      recommendations: predictionResult.recommendations,
      probabilities: predictionResult.probabilities,
      decision_path: predictionResult.decision_path,
      feature_impacts: predictionResult.feature_impacts,
      timestamp: predictionResult.timestamp,
    });
  } catch (error: any) {
    console.error('Prediction error:', error);
    return res.status(500).json({
      error: 'Internal server error while evaluating model prediction',
      message: error?.message || 'Unknown error',
    });
  }
};

app.post('/predict', handlePredict);
app.post('/api/predict', handlePredict);

// Batch Prediction for CSV import / evaluation
app.post('/api/batch-predict', (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Expected non-empty array of students' });
    }

    const results = students.map((student: any, idx: number) => {
      const { valid, sanitized, errors } = validateStudentInput(student);
      if (!valid || !sanitized) {
        return {
          id: student.id || `row-${idx + 1}`,
          name: student.name || `Student ${idx + 1}`,
          error: errors.join(', '),
        };
      }

      const pred = predictStudentPerformance(sanitized);
      return {
        id: student.id || `row-${idx + 1}`,
        name: student.name || `Student ${idx + 1}`,
        ...sanitized,
        prediction: pred.prediction,
        confidence: pred.confidence,
        recommendations: pred.recommendations,
      };
    });

    const summary = {
      total: results.length,
      excellent: results.filter((r: any) => r.prediction === 'Excellent').length,
      good: results.filter((r: any) => r.prediction === 'Good').length,
      average: results.filter((r: any) => r.prediction === 'Average').length,
      needsImprovement: results.filter((r: any) => r.prediction === 'Needs Improvement').length,
    };

    res.json({ results, summary });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed processing batch predictions', message: err.message });
  }
});

// Model Info & Metrics (Page 6 & 10)
app.get('/api/model-info', (req, res) => {
  res.json({
    metrics: MODEL_METRICS,
    benchmarks: COHORT_BENCHMARKS,
  });
});

// Dataset endpoint
app.get('/api/dataset', (req, res) => {
  res.json({
    total: STUDENT_DATASET.length,
    students: STUDENT_DATASET,
    benchmarks: COHORT_BENCHMARKS,
  });
});

// AI Insights / Deep Personalized Study Plan
app.post('/api/ai-insights', async (req, res) => {
  try {
    const { valid, sanitized } = validateStudentInput(req.body);
    if (!valid || !sanitized) {
      return res.status(400).json({ error: 'Invalid input for AI analysis' });
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
A student has provided the following academic metrics:
- Daily Study Hours: ${sanitized.study_hours} hrs/day
- Attendance Rate: ${sanitized.attendance_pct}%
- Previous Exam Score: ${sanitized.previous_score}/100
- Assignment Completion: ${sanitized.assignment_completion}%
- Daily Sleep Hours: ${sanitized.sleep_hours} hrs/day
- Class Participation: ${sanitized.participation}/10
- Historical Performance: ${sanitized.previous_performance}/10

The machine learning Decision Tree model predicts their outcome as: "${pred.prediction}" with ${(pred.confidence * 100).toFixed(1)}% confidence.

Generate a concise, highly actionable, motivating 4-week Academic Optimization Plan.
Provide:
1. Executive Assessment (2 sentences diagnosing root leverage points).
2. Primary Leverage Habit (single most impactful habit change with quantitative target).
3. Weekly Milestone Roadmap (Week 1, Week 2, Week 3, Week 4 - one bullet each).
4. Cognitive Sleep & Study Synergy advice.
Keep the tone encouraging, professional, and directly tailored to their numbers. Avoid markdown code blocks, just clean markdown headers and bullet points.`;

        let responseText = '';
        let modelUsed = 'gemini-3.8-flash';

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
          const response = await callWithTimeout('gemini-3.8-flash', 6000);
          responseText = response.text || '';
        } catch (mErr: any) {
          console.warn('Attempt with gemini-3.8-flash failed, trying gemini-3.6-flash:', mErr?.message || mErr);
          try {
            modelUsed = 'gemini-3.6-flash';
            const response = await callWithTimeout('gemini-3.6-flash', 6000);
            responseText = response.text || '';
          } catch (mErr2: any) {
            console.warn('Attempt with gemini-3.6-flash failed:', mErr2?.message || mErr2);
          }
        }

        if (responseText) {
          return res.json({
            insights: responseText,
            provider: `Gemini AI (${modelUsed})`,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local advisor engine:', geminiErr);
      }
    }

    // High quality local educational advisor synthesis
    const localInsights = `### Academic Optimization Plan: ${pred.prediction} Outlook

**Executive Assessment:**
With ${sanitized.study_hours} hours of daily study and an attendance rate of ${sanitized.attendance_pct}%, your performance index points to **${pred.prediction}** standing. ${
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
    ? `Anchor a consistent sleep schedule of at least 7.5 hours; sleep deprivation impairs recall by up to 30%.`
    : `Elevate assignment completion from ${sanitized.assignment_completion}% to 95%+ to guarantee full coursework credit.`
}

**Weekly Milestone Roadmap:**
- **Week 1 (Diagnostic & Foundation):** Audit current course syllabus gaps; complete all overdue or upcoming practice problem sets.
- **Week 2 (Active Recall Sprints):** Transition from passive reading to active flashcards, practice quizzes, and formula derivation.
- **Week 3 (Lecture & Office Hours Integration):** Target asking at least 2 questions per week in discussion sections to raise participation score from ${sanitized.participation}/10.
- **Week 4 (Timed Simulation):** Complete a full mock midterm under strict timed exam conditions to benchmark progress against your previous score of ${sanitized.previous_score}.

**Cognitive Hygiene:**
Maintain your sleep at ~${Math.max(7, sanitized.sleep_hours)} hours. Memory consolidation occurs during REM sleep cycles, ensuring newly reviewed material is committed to long-term memory.`;

    return res.json({
      insights: localInsights,
      provider: 'SmartPredict Pedagogical Rule Engine',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate insights', message: err.message });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
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
