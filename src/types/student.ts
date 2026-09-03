export type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';

export interface StudentInput {
  study_hours: number;
  attendance_pct: number;
  previous_score: number;
  assignment_completion: number;
  sleep_hours: number;
  participation: number;
  previous_performance: number;
}

export interface ContributingFactor {
  feature: string;
  name: string;
  value: number;
  benchmark: number;
  importanceWeight: number;
  impact: 
    | 'Associated with higher standing' 
    | 'Associated with lower standing' 
    | 'Aligned with cohort baseline'
    | 'Positive contributor' 
    | 'Risk factor' 
    | 'Neutral';
  description: string;
}

export interface SmartImprovementPlan {
  thisWeek: string[];
  nextTwoWeeks: string[];
  ongoing: string[];
  disclaimer: string;
}

export interface RiskRadarDimension {
  dimension: string;
  score: number; // 0 to 100 (100 is optimal/safe, < 60 is high risk)
  status: 'Strong' | 'Stable' | 'Attention Needed' | 'High Priority';
  benchmark: number;
  detail: string;
}

export interface PredictionResponse {
  prediction: PerformanceCategory;
  confidence: number;
  recommendations: string[];
  probabilities: {
    Excellent: number;
    Good: number;
    Average: number;
    'Needs Improvement': number;
  };
  is_uncertain?: boolean;
  uncertainty_note?: string | null;
  decision_path?: string[];
  contributing_factors?: ContributingFactor[];
  smart_plan?: SmartImprovementPlan;
  risk_radar?: RiskRadarDimension[];
  model_metadata?: {
    model: string;
    version: string;
    accuracy: number;
    treeDepth?: number;
    numberOfLeaves?: number;
    executionMode?: string;
    datasetHonesty?: string;
    cvAccuracyMean?: number;
  };
  feature_impacts?: {
    feature: string;
    label: string;
    impact: number;
    userValue: number;
    idealValue: number;
    status: 'optimal' | 'moderate' | 'critical';
    unit: string;
  }[];
  timestamp: string;
  requestId?: string;
}

export interface StudentRecord extends StudentInput {
  id: string;
  name: string;
  predicted_class: PerformanceCategory;
  actual_class: PerformanceCategory;
  confidence: number;
}

export interface ModelMetrics {
  name: string;
  type: string;
  algorithm: string;
  version: string;
  datasetVersion: string;
  trainingDate: string;
  datasetSize: number;
  trainingSamples: number;
  testSamples: number;
  randomSeed: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  cvAccuracyMean: number;
  cvAccuracyStd: number;
  treeDepth: number;
  numberOfLeaves: number;
  features: {
    key: keyof StudentInput;
    name: string;
    importance: number;
    benchmarkAverage: number;
  }[];
  confusionMatrix: {
    classes: PerformanceCategory[];
    matrix: number[][];
  };
  perClassMetrics: Record<
    PerformanceCategory,
    {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    }
  >;
  comparatorModel?: {
    algorithm: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    cvAccuracyMean: number;
    cvAccuracyStd: number;
  };
}

export interface PresetProfile {
  name: string;
  description: string;
  tag: string;
  data: StudentInput;
}
