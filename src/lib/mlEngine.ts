import { 
  StudentInput, 
  PerformanceCategory, 
  PredictionResponse, 
  ContributingFactor,
  SmartImprovementPlan,
  RiskRadarDimension
} from '../types/student';
import trainedArtifacts from './trainedModelArtifacts.json';

const metadata = trainedArtifacts.metadata;
const treeData = trainedArtifacts.tree;

interface ScikitTreeNode {
  id: string;
  isLeaf: boolean;
  feature?: string;
  threshold?: number;
  predictedClass: PerformanceCategory;
  confidence: number;
  probabilities: Record<PerformanceCategory, number>;
  samples: number;
  impurity: number;
  left?: ScikitTreeNode;
  right?: ScikitTreeNode;
}

const rootNode = treeData.root as ScikitTreeNode;

/**
 * Calculates continuous normalized composite score (0 - 100)
 * Weighted by Scikit-Learn feature importances
 */
export function calculateAcademicIndex(input: StudentInput): number {
  const normPrevScore = Math.min(100, Math.max(0, input.previous_score));
  const normAttendance = Math.min(100, Math.max(0, input.attendance_pct));
  const normAssignment = Math.min(100, Math.max(0, input.assignment_completion));
  const studyScore = Math.min(100, (Math.min(input.study_hours, 8) / 8) * 100);
  
  let sleepScore = 80;
  if (input.sleep_hours >= 7 && input.sleep_hours <= 9) sleepScore = 100;
  else if (input.sleep_hours >= 6 && input.sleep_hours < 7) sleepScore = 85;
  else if (input.sleep_hours >= 5 && input.sleep_hours < 6) sleepScore = 65;
  else if (input.sleep_hours < 5) sleepScore = Math.max(20, input.sleep_hours * 8);
  else sleepScore = Math.max(50, 100 - (input.sleep_hours - 9) * 12);

  const partScore = Math.min(100, Math.max(10, input.participation * 10));
  const prevPerfScore = Math.min(100, Math.max(10, input.previous_performance * 10));

  const composite =
    normPrevScore * 0.35 +
    normAssignment * 0.22 +
    studyScore * 0.18 +
    normAttendance * 0.12 +
    partScore * 0.05 +
    prevPerfScore * 0.05 +
    sleepScore * 0.03;

  return Math.round(composite * 10) / 10;
}

/**
 * Traverses the exact Scikit-learn DecisionTreeClassifier exported structure
 * In Scikit-learn: if X[feature] <= threshold go LEFT, else go RIGHT.
 */
export function traverseScikitLearnTree(
  node: ScikitTreeNode,
  input: StudentInput,
  pathAccumulator: string[] = []
): {
  predictedClass: PerformanceCategory;
  confidence: number;
  probabilities: Record<PerformanceCategory, number>;
  path: string[];
} {
  if (node.isLeaf || !node.feature || typeof node.threshold !== 'number') {
    pathAccumulator.push(
      `Terminal Leaf (Gini: ${node.impurity.toFixed(3)}, ${node.samples} train samples) -> Class: ${node.predictedClass}`
    );
    return {
      predictedClass: node.predictedClass,
      confidence: node.confidence,
      probabilities: node.probabilities,
      path: pathAccumulator,
    };
  }

  const featKey = node.feature as keyof StudentInput;
  const featVal = input[featKey] ?? 0;
  const isLessEqual = featVal <= node.threshold;

  const featNames: Record<string, string> = {
    study_hours: 'Study Hours',
    attendance_pct: 'Attendance Rate',
    previous_score: 'Previous Score',
    assignment_completion: 'Assignment Completion',
    sleep_hours: 'Sleep Hours',
    participation: 'Participation',
    previous_performance: 'Previous Performance',
  };

  const readableName = featNames[node.feature] || node.feature;
  const splitCondition = `${readableName} (${featVal}) ${isLessEqual ? '<=' : '>'} ${node.threshold.toFixed(2)}`;
  pathAccumulator.push(splitCondition);

  if (isLessEqual && node.left) {
    return traverseScikitLearnTree(node.left, input, pathAccumulator);
  } else if (!isLessEqual && node.right) {
    return traverseScikitLearnTree(node.right, input, pathAccumulator);
  }

  return {
    predictedClass: node.predictedClass,
    confidence: node.confidence,
    probabilities: node.probabilities,
    path: pathAccumulator,
  };
}

/**
 * Evaluates Risk Radar across 5 core dimensions
 */
export function computeRiskRadar(input: StudentInput): RiskRadarDimension[] {
  const benchmarks = metadata.benchmarks as Record<string, number>;

  // 1. Academic Fundamentals (Previous Score & Prior Performance)
  const prevScoreNorm = Math.min(100, (input.previous_score / 100) * 100);
  const prevPerfNorm = Math.min(100, (input.previous_performance / 10) * 100);
  const acadScore = Math.round(prevScoreNorm * 0.7 + prevPerfNorm * 0.3);
  let acadStatus: RiskRadarDimension['status'] = 'Strong';
  if (acadScore < 55) acadStatus = 'High Priority';
  else if (acadScore < 70) acadStatus = 'Attention Needed';
  else if (acadScore < 85) acadStatus = 'Stable';

  // 2. Attendance & Lecture Presence
  const attScore = Math.round(input.attendance_pct);
  let attStatus: RiskRadarDimension['status'] = 'Strong';
  if (attScore < 65) attStatus = 'High Priority';
  else if (attScore < 75) attStatus = 'Attention Needed';
  else if (attScore < 88) attStatus = 'Stable';

  // 3. Coursework & Assignment Discipline
  const assignScore = Math.round(input.assignment_completion);
  let assignStatus: RiskRadarDimension['status'] = 'Strong';
  if (assignScore < 60) assignStatus = 'High Priority';
  else if (assignScore < 75) assignStatus = 'Attention Needed';
  else if (assignScore < 90) assignStatus = 'Stable';

  // 4. Study Habit Volume (optimal 4-7h)
  const studyNorm = Math.min(100, Math.round((Math.min(input.study_hours, 7.0) / 6.0) * 100));
  let studyStatus: RiskRadarDimension['status'] = 'Strong';
  if (input.study_hours < 2.0) studyStatus = 'High Priority';
  else if (input.study_hours < 3.5) studyStatus = 'Attention Needed';
  else if (input.study_hours < 5.0) studyStatus = 'Stable';

  // 5. Cognitive Hygiene & Sleep
  let sleepScore = 90;
  if (input.sleep_hours >= 7 && input.sleep_hours <= 8.5) sleepScore = 100;
  else if (input.sleep_hours >= 6 && input.sleep_hours < 7) sleepScore = 80;
  else if (input.sleep_hours >= 5 && input.sleep_hours < 6) sleepScore = 60;
  else if (input.sleep_hours < 5) sleepScore = 40;
  else sleepScore = 75; // > 9 hours
  let sleepStatus: RiskRadarDimension['status'] = 'Strong';
  if (sleepScore < 55) sleepStatus = 'High Priority';
  else if (sleepScore < 75) sleepStatus = 'Attention Needed';
  else if (sleepScore < 90) sleepStatus = 'Stable';

  return [
    {
      dimension: 'Academic Baseline',
      score: acadScore,
      status: acadStatus,
      benchmark: Math.round(benchmarks.previous_score || 70),
      detail: `${input.previous_score} pts on previous examination.`,
    },
    {
      dimension: 'Attendance Regularity',
      score: attScore,
      status: attStatus,
      benchmark: Math.round(benchmarks.attendance_pct || 77),
      detail: `${input.attendance_pct}% lecture and lab presence.`,
    },
    {
      dimension: 'Assignment Completion',
      score: assignScore,
      status: assignStatus,
      benchmark: Math.round(benchmarks.assignment_completion || 76),
      detail: `${input.assignment_completion}% of coursework turned in.`,
    },
    {
      dimension: 'Study Volume',
      score: studyNorm,
      status: studyStatus,
      benchmark: Math.round(((benchmarks.study_hours || 4.0) / 6.0) * 100),
      detail: `${input.study_hours} hrs/day dedicated self-study.`,
    },
    {
      dimension: 'Sleep & Recovery',
      score: sleepScore,
      status: sleepStatus,
      benchmark: 90,
      detail: `${input.sleep_hours} hrs/day nightly rest.`,
    },
  ];
}

/**
 * Generates prioritized recommendations (Critical Blocker -> Academic Leverage -> Enrichment)
 */
export function generatePrioritizedRecommendations(
  input: StudentInput,
  predictedClass: PerformanceCategory
): string[] {
  const recs: string[] = [];

  // Priority 1: Critical Blockers
  if (input.attendance_pct < 70.0) {
    recs.push(
      `Immediate priority: Elevate attendance from ${input.attendance_pct}% to at least 80% to ensure core curriculum continuity and eligibility.`
    );
  } else if (input.study_hours < 2.0) {
    recs.push(
      `Immediate priority: Increase daily self-study from ${input.study_hours}h to a minimum 3.0h using structured 45-minute focus intervals.`
    );
  } else if (input.assignment_completion < 65.0) {
    recs.push(
      `Immediate priority: Submit all overdue problem sets to raise assignment completion above 75% before milestone deadlines.`
    );
  }

  // Priority 2: High Leverage Academic Habits
  if (input.assignment_completion < 85.0 && !recs.some((r) => r.includes('assignment'))) {
    recs.push(
      `Academic leverage: Target 90%+ assignment completion to convert continuous assessment into an exam safety buffer.`
    );
  }
  if (input.previous_score < 70.0 && !recs.some((r) => r.includes('Previous'))) {
    recs.push(
      `Targeted practice: Schedule weekly mock problem sets under timed conditions to strengthen exam pace and prerequisite recall.`
    );
  }
  if (input.study_hours < 4.5 && !recs.some((r) => r.includes('self-study'))) {
    recs.push(
      `Study rhythm: Expand daily study blocks by 1 hour focused specifically on active recall and problem sets rather than passive rereading.`
    );
  }
  if (input.attendance_pct < 88.0 && !recs.some((r) => r.includes('attendance'))) {
    recs.push(
      `Lecture engagement: Attend 90%+ of synchronous lectures to catch professor exam emphasis and live solution steps.`
    );
  }

  // Priority 3: Optimization & Well-being
  if (input.sleep_hours < 6.5) {
    recs.push(
      `Cognitive recovery: Protect at least 7.5 hours of sleep nightly; memory consolidation directly stabilizes exam retrieval speed.`
    );
  } else if (input.sleep_hours > 9.5) {
    recs.push(
      `Circadian balance: Anchor consistent morning waking times to prevent daytime sluggishness during peak study blocks.`
    );
  }
  if (input.participation < 6) {
    recs.push(
      `Active participation: Ask at least 2 questions per week in seminar or office hours to verify conceptual comprehension.`
    );
  } else if (predictedClass === 'Excellent') {
    recs.push(
      `Honors leadership: Mentor peer study groups or engage in advanced undergraduate research projects to deepen subject mastery.`
    );
  } else {
    recs.push(
      `Review strategy: Perform spaced weekly self-quizzing on past topics to prevent recency decay before final assessments.`
    );
  }

  return recs.slice(0, 3);
}

/**
 * Generates structured 3-horizon Smart Improvement Plan
 */
export function generateSmartImprovementPlan(
  input: StudentInput,
  predictedClass: PerformanceCategory
): SmartImprovementPlan {
  const targetStudy = Math.min(8.0, Math.round((input.study_hours + 1.2) * 10) / 10);
  const targetAtt = Math.min(100, Math.round(input.attendance_pct + 8));
  const targetAssign = Math.min(100, Math.round(input.assignment_completion + 10));

  return {
    thisWeek: [
      `Complete and submit all pending assignments to raise coursework completion toward ${targetAssign}%.`,
      `Establish dedicated daily study blocks targeting ${targetStudy} hrs/day with the Pomodoro technique (50 min focus / 10 min break).`,
      `Audit previous examination errors and formulate a targeted list of 3 questions for upcoming instructor office hours.`,
    ],
    nextTwoWeeks: [
      `Consolidate lecture attendance consistency to track toward ${targetAtt}% presence across all registered subjects.`,
      `Shift revision methods from passive highlighting to active flashcards and closed-book formula derivations.`,
      `Anchor a consistent 7.5-hour sleep routine to maximize neurological memory consolidation.`,
    ],
    ongoing: [
      `Conduct fortnightly timed practice exam simulations under strict exam-hall conditions.`,
      `Maintain active participation in study groups and weekly discussion forums at least twice per week.`,
      `Track weekly progress milestones objectively rather than relying on high-stress cramming before finals.`,
    ],
    disclaimer:
      'SmartPredict AI generates educational guidance based on statistical patterns. Outcomes depend on student commitment, course rigor, and faculty evaluation.',
  };
}

/**
 * Calculates explainable AI contributing factors comparing student metrics with cohort baseline and model weights
 */
export function calculateContributingFactors(input: StudentInput): ContributingFactor[] {
  const benchmarks = metadata.benchmarks as Record<string, number>;
  const features = metadata.features as { key: keyof StudentInput; name: string; importance: number }[];

  return features.map((f) => {
    const val = input[f.key] ?? 0;
    const bench = benchmarks[f.key] ?? 50.0;
    const delta = val - bench;
    const pctDelta = Math.round((delta / (bench === 0 ? 1 : bench)) * 1000) / 10;

    let impact: ContributingFactor['impact'] = 'Aligned with cohort baseline';
    let description = `${val} aligns closely with synthetic cohort benchmark (${bench}).`;

    if (delta > 0) {
      impact = 'Associated with higher standing';
      description = `${val} is ${Math.abs(pctDelta)}% above synthetic cohort baseline (${bench}).`;
    } else if (delta < 0) {
      impact = 'Associated with lower standing';
      description = `${val} is ${Math.abs(pctDelta)}% below synthetic cohort baseline (${bench}).`;
    }

    return {
      feature: f.key,
      name: f.name,
      value: val,
      benchmark: bench,
      importanceWeight: f.importance,
      impact,
      description,
    };
  });
}

/**
 * Feature impact ratings for visualization bars
 */
export function analyzeFeatureImpacts(input: StudentInput) {
  const features = metadata.features as { key: keyof StudentInput; name: string; importance: number; benchmarkAverage: number }[];

  const idealValues: Record<keyof StudentInput, { ideal: number; max: number; unit: string }> = {
    study_hours: { ideal: 6.0, max: 12, unit: 'hrs/day' },
    attendance_pct: { ideal: 95.0, max: 100, unit: '%' },
    previous_score: { ideal: 90.0, max: 100, unit: 'pts' },
    assignment_completion: { ideal: 95.0, max: 100, unit: '%' },
    sleep_hours: { ideal: 8.0, max: 12, unit: 'hrs' },
    participation: { ideal: 9.0, max: 10, unit: '/10' },
    previous_performance: { ideal: 9.0, max: 10, unit: '/10' },
  };

  return features.map((f) => {
    const config = idealValues[f.key];
    const userVal = input[f.key] ?? 0;
    const ratio = userVal / config.ideal;

    let status: 'optimal' | 'moderate' | 'critical' = 'optimal';
    if (ratio < 0.65) status = 'critical';
    else if (ratio < 0.85) status = 'moderate';

    return {
      feature: f.key,
      label: f.name,
      impact: Math.round(f.importance * 100),
      userValue: userVal,
      idealValue: config.ideal,
      status,
      unit: config.unit,
    };
  });
}

/**
 * Core Prediction Function
 * Executes the genuine Scikit-learn decision tree and generates complete response
 */
export function predictStudentPerformance(input: StudentInput): PredictionResponse {
  // 1. Traverse exact Scikit-learn Decision Tree
  const { predictedClass, confidence, probabilities, path } = traverseScikitLearnTree(rootNode, input);

  // 2. Generate contributing factors (Explainability)
  const contributing_factors = calculateContributingFactors(input);

  // 3. Generate prioritized recommendations
  const recommendations = generatePrioritizedRecommendations(input, predictedClass);

  // 4. Generate Smart Improvement Plan (This Week, Next 2 Weeks, Ongoing)
  const smart_plan = generateSmartImprovementPlan(input, predictedClass);

  // 5. Compute Risk Radar across 5 dimensions
  const risk_radar = computeRiskRadar(input);

  // 6. Feature impacts for UI gauges
  const feature_impacts = analyzeFeatureImpacts(input);

  const is_uncertain = confidence < 0.50;
  const uncertainty_note = is_uncertain
    ? 'Uncertain / Borderline classification: No category holds majority confidence (>= 50%).'
    : null;

  return {
    prediction: predictedClass,
    confidence,
    probabilities,
    is_uncertain,
    uncertainty_note,
    decision_path: path,
    contributing_factors,
    recommendations,
    smart_plan,
    risk_radar,
    feature_impacts,
    model_metadata: {
      model: metadata.modelName,
      version: metadata.version,
      accuracy: metadata.metrics.accuracy,
      cvAccuracyMean: metadata.metrics.cvAccuracyMean,
      treeDepth: metadata.metrics.treeDepth,
      numberOfLeaves: metadata.metrics.numberOfLeaves,
      executionMode: 'Serialized Scikit-learn Tree Artifact',
      datasetHonesty: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
    },
    timestamp: new Date().toISOString(),
  };
}
