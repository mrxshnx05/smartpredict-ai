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
  decision_path?: string[];
  feature_impacts?: {
    feature: string;
    label: string;
    impact: number;
    userValue: number;
    idealValue: number;
    status: 'optimal' | 'moderate' | 'critical';
  }[];
  timestamp: string;
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
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  datasetSize: number;
  treeDepth: number;
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
}

export interface PresetProfile {
  name: string;
  description: string;
  tag: string;
  data: StudentInput;
}
