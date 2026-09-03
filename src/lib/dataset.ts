import { 
  StudentInput, 
  StudentRecord, 
  ModelMetrics, 
  PresetProfile,
  PerformanceCategory 
} from '../types/student';
import studentDatasetJson from './studentDataset.json';
import trainedArtifacts from './trainedModelArtifacts.json';

const metadata = trainedArtifacts.metadata;

export const PRESET_PROFILES: PresetProfile[] = [
  {
    name: 'Top Honors Candidate',
    description: 'Disciplined high achiever with regular study hours, high attendance, and healthy sleep.',
    tag: 'Honors',
    data: {
      study_hours: 6.8,
      attendance_pct: 95.0,
      previous_score: 92.0,
      assignment_completion: 96.0,
      sleep_hours: 7.5,
      participation: 9.0,
      previous_performance: 9.0,
    },
  },
  {
    name: 'Balanced Achiever',
    description: 'Steady, reliable student with solid attendance and consistent coursework turn-in.',
    tag: 'Solid Good',
    data: {
      study_hours: 4.8,
      attendance_pct: 86.0,
      previous_score: 78.0,
      assignment_completion: 88.0,
      sleep_hours: 7.0,
      participation: 7.0,
      previous_performance: 7.0,
    },
  },
  {
    name: 'Mid-Tier / Average',
    description: 'Passes core exams with moderate attendance and occasional study lapses.',
    tag: 'Average',
    data: {
      study_hours: 3.2,
      attendance_pct: 74.0,
      previous_score: 65.0,
      assignment_completion: 72.0,
      sleep_hours: 6.5,
      participation: 5.0,
      previous_performance: 5.0,
    },
  },
  {
    name: 'Attendance Risk Student',
    description: 'Lecture attendance has dropped to critical levels; high probability of knowledge decay.',
    tag: 'Attendance Risk',
    data: {
      study_hours: 2.8,
      attendance_pct: 54.0,
      previous_score: 58.0,
      assignment_completion: 60.0,
      sleep_hours: 6.0,
      participation: 4.0,
      previous_performance: 4.0,
    },
  },
  {
    name: 'Study-Time Risk Student',
    description: 'Minimal independent study time creating acute exam vulnerability.',
    tag: 'Study Risk',
    data: {
      study_hours: 1.2,
      attendance_pct: 72.0,
      previous_score: 55.0,
      assignment_completion: 55.0,
      sleep_hours: 6.5,
      participation: 4.0,
      previous_performance: 4.0,
    },
  },
  {
    name: 'Sleep & Burnout Risk',
    description: 'Extended late-night study hours with severe sleep deficit impairing cognitive recall.',
    tag: 'Burnout Risk',
    data: {
      study_hours: 5.5,
      attendance_pct: 72.0,
      previous_score: 64.0,
      assignment_completion: 68.0,
      sleep_hours: 3.8,
      participation: 4.0,
      previous_performance: 5.0,
    },
  },
];

// Actual 1,000 student demonstration records from backend/data/student_data.csv
export const STUDENT_DATASET: StudentRecord[] = studentDatasetJson as StudentRecord[];

// Cohort Benchmarks (True arithmetic averages computed across the 1,000 dataset rows)
export const COHORT_BENCHMARKS = {
  study_hours: metadata.benchmarks.study_hours,
  attendance_pct: metadata.benchmarks.attendance_pct,
  previous_score: metadata.benchmarks.previous_score,
  assignment_completion: metadata.benchmarks.assignment_completion,
  sleep_hours: metadata.benchmarks.sleep_hours,
  participation: metadata.benchmarks.participation,
  previous_performance: metadata.benchmarks.previous_performance,
};

// True Model Metrics from Scikit-learn evaluation (Zero hardcoding)
export const MODEL_METRICS: ModelMetrics = {
  name: metadata.modelName,
  type: metadata.algorithm,
  algorithm: metadata.algorithm,
  version: metadata.version,
  datasetVersion: metadata.datasetVersion,
  trainingDate: metadata.trainingDate,
  datasetSize: metadata.datasetSize,
  trainingSamples: metadata.trainingSamples,
  testSamples: metadata.testSamples,
  randomSeed: metadata.randomSeed,
  accuracy: metadata.metrics.accuracy,
  precision: metadata.metrics.precision,
  recall: metadata.metrics.recall,
  f1Score: metadata.metrics.f1Score,
  cvAccuracyMean: metadata.metrics.cvAccuracyMean,
  cvAccuracyStd: metadata.metrics.cvAccuracyStd,
  treeDepth: metadata.metrics.treeDepth,
  numberOfLeaves: metadata.metrics.numberOfLeaves,
  features: metadata.features as ModelMetrics['features'],
  confusionMatrix: {
    classes: metadata.confusionMatrix.classes as PerformanceCategory[],
    matrix: metadata.confusionMatrix.matrix,
  },
  perClassMetrics: metadata.perClassMetrics as ModelMetrics['perClassMetrics'],
  comparatorModel: metadata.comparatorModel,
};

export const DATASET_HONESTY = {
  description: 'Reproducible synthetic demonstration dataset generated for educational ML experimentation.',
  type: 'Synthetic (Gaussian / Stratified normal parameterization)',
  recordCount: metadata.datasetSize,
  trainingRecords: metadata.trainingSamples,
  testRecords: metadata.testSamples,
  disclaimer: 'Generated synthetically for reproducible educational ML demonstration. Does not reflect actual student records, and results cannot be generalized to real students.',
  whySynthetic: 'Student educational records and GPA metrics are strictly protected under FERPA and privacy regulations. Real student data cannot be publicly distributed in demonstration applications without IRB approval and informed student consent.',
  limitations: 'Idealized normal distributions within performance tiers; does not capture unobserved real-world confounders such as illness, socioeconomic adversity, syllabus variance, exam difficulty fluctuations, or teacher grading subjectivity.',
};
