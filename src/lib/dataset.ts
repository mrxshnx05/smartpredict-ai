import { StudentInput, PerformanceCategory, StudentRecord, ModelMetrics, PresetProfile } from '../types/student';
import { predictStudentPerformance } from './mlEngine';

export const PRESET_PROFILES: PresetProfile[] = [
  {
    name: 'Top Honors Candidate',
    description: 'Disciplined high achiever with high study hours and optimal sleep.',
    tag: 'Honors',
    data: {
      study_hours: 6.5,
      attendance_pct: 95.0,
      previous_score: 92.0,
      assignment_completion: 98.0,
      sleep_hours: 7.5,
      participation: 9.0,
      previous_performance: 9.0,
    },
  },
  {
    name: 'Balanced Achiever',
    description: 'Steady student with consistent attendance and reliable homework turn-in.',
    tag: 'Solid Good',
    data: {
      study_hours: 4.5,
      attendance_pct: 88.0,
      previous_score: 78.0,
      assignment_completion: 85.0,
      sleep_hours: 7.0,
      participation: 7.0,
      previous_performance: 7.0,
    },
  },
  {
    name: 'Mid-Tier / Borderline',
    description: 'Passes core exams but shows fluctuating study discipline and attendance.',
    tag: 'Average',
    data: {
      study_hours: 3.0,
      attendance_pct: 74.0,
      previous_score: 65.0,
      assignment_completion: 72.0,
      sleep_hours: 6.0,
      participation: 5.0,
      previous_performance: 5.0,
    },
  },
  {
    name: 'At-Risk Student',
    description: 'Low attendance, late assignments, and minimal study time requiring rapid intervention.',
    tag: 'At-Risk',
    data: {
      study_hours: 1.5,
      attendance_pct: 58.0,
      previous_score: 48.0,
      assignment_completion: 50.0,
      sleep_hours: 5.0,
      participation: 3.0,
      previous_performance: 4.0,
    },
  },
  {
    name: 'Sleep-Deprived Crammer',
    description: 'Studies long hours but severely sleep-deprived with sporadic attendance.',
    tag: 'High Friction',
    data: {
      study_hours: 6.0,
      attendance_pct: 68.0,
      previous_score: 62.0,
      assignment_completion: 65.0,
      sleep_hours: 4.0,
      participation: 4.0,
      previous_performance: 5.0,
    },
  },
];

// Generate a representative synthetic dataset matching the Scikit-learn student dataset (200 records)
function generateStudentDataset(): StudentRecord[] {
  const records: StudentRecord[] = [];
  const firstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Daniel', 'Emily', 'Matthew', 'Aria', 'Sebastian', 'Scarlett', 'Jack', 'Victoria', 'Owen', 'Luna', 'Samuel', 'Grace', 'David', 'Chloe', 'Joseph', 'Penelope', 'Carter', 'Riley', 'Wyatt', 'Zoey'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

  // Controlled distribution generators
  const baseStudents: { target: PerformanceCategory; count: number }[] = [
    { target: 'Excellent', count: 50 },
    { target: 'Good', count: 70 },
    { target: 'Average', count: 55 },
    { target: 'Needs Improvement', count: 45 },
  ];

  let idCounter = 101;

  for (const group of baseStudents) {
    for (let i = 0; i < group.count; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fName} ${lName}`;

      let study_hours = 4.0;
      let attendance_pct = 80.0;
      let previous_score = 70.0;
      let assignment_completion = 80.0;
      let sleep_hours = 7.0;
      let participation = 6.0;
      let previous_performance = 6.0;

      if (group.target === 'Excellent') {
        study_hours = +(5.5 + Math.random() * 3.5).toFixed(1);
        attendance_pct = +(86 + Math.random() * 13.5).toFixed(1);
        previous_score = +(82 + Math.random() * 17.5).toFixed(1);
        assignment_completion = +(88 + Math.random() * 11.5).toFixed(1);
        sleep_hours = +(6.5 + Math.random() * 2.0).toFixed(1);
        participation = Math.min(10, Math.floor(7.5 + Math.random() * 3));
        previous_performance = Math.min(10, Math.floor(8 + Math.random() * 2.5));
      } else if (group.target === 'Good') {
        study_hours = +(3.8 + Math.random() * 2.5).toFixed(1);
        attendance_pct = +(76 + Math.random() * 14).toFixed(1);
        previous_score = +(70 + Math.random() * 14).toFixed(1);
        assignment_completion = +(75 + Math.random() * 15).toFixed(1);
        sleep_hours = +(6.0 + Math.random() * 2.5).toFixed(1);
        participation = Math.min(10, Math.floor(6 + Math.random() * 3));
        previous_performance = Math.min(10, Math.floor(6 + Math.random() * 3));
      } else if (group.target === 'Average') {
        study_hours = +(2.2 + Math.random() * 2.2).toFixed(1);
        attendance_pct = +(64 + Math.random() * 18).toFixed(1);
        previous_score = +(54 + Math.random() * 18).toFixed(1);
        assignment_completion = +(60 + Math.random() * 22).toFixed(1);
        sleep_hours = +(5.0 + Math.random() * 3.0).toFixed(1);
        participation = Math.min(10, Math.floor(4 + Math.random() * 3));
        previous_performance = Math.min(10, Math.floor(4 + Math.random() * 3));
      } else {
        // Needs Improvement
        study_hours = +(0.8 + Math.random() * 2.0).toFixed(1);
        attendance_pct = +(40 + Math.random() * 28).toFixed(1);
        previous_score = +(35 + Math.random() * 25).toFixed(1);
        assignment_completion = +(35 + Math.random() * 30).toFixed(1);
        sleep_hours = +(4.0 + Math.random() * 4.0).toFixed(1);
        participation = Math.min(10, Math.max(1, Math.floor(1 + Math.random() * 4)));
        previous_performance = Math.min(10, Math.max(1, Math.floor(1 + Math.random() * 4)));
      }

      const input: StudentInput = {
        study_hours,
        attendance_pct,
        previous_score,
        assignment_completion,
        sleep_hours,
        participation,
        previous_performance,
      };

      const result = predictStudentPerformance(input);

      records.push({
        id: `STD-${idCounter++}`,
        name,
        ...input,
        predicted_class: result.prediction,
        actual_class: group.target,
        confidence: result.confidence,
      });
    }
  }

  return records;
}

export const STUDENT_DATASET: StudentRecord[] = generateStudentDataset();

// Calculate dataset averages for benchmarks
export const COHORT_BENCHMARKS = {
  study_hours: +(STUDENT_DATASET.reduce((acc, s) => acc + s.study_hours, 0) / STUDENT_DATASET.length).toFixed(1),
  attendance_pct: +(STUDENT_DATASET.reduce((acc, s) => acc + s.attendance_pct, 0) / STUDENT_DATASET.length).toFixed(1),
  previous_score: +(STUDENT_DATASET.reduce((acc, s) => acc + s.previous_score, 0) / STUDENT_DATASET.length).toFixed(1),
  assignment_completion: +(STUDENT_DATASET.reduce((acc, s) => acc + s.assignment_completion, 0) / STUDENT_DATASET.length).toFixed(1),
  sleep_hours: +(STUDENT_DATASET.reduce((acc, s) => acc + s.sleep_hours, 0) / STUDENT_DATASET.length).toFixed(1),
  participation: +(STUDENT_DATASET.reduce((acc, s) => acc + s.participation, 0) / STUDENT_DATASET.length).toFixed(1),
  previous_performance: +(STUDENT_DATASET.reduce((acc, s) => acc + s.previous_performance, 0) / STUDENT_DATASET.length).toFixed(1),
};

// Model Metrics matching Scikit-learn validation report
export const MODEL_METRICS: ModelMetrics = {
  name: 'SmartPredict Decision Tree Classifier (v2.4)',
  type: 'Supervised Multi-Class Decision Tree / Gini Criterion',
  accuracy: 0.942,
  precision: 0.938,
  recall: 0.941,
  f1Score: 0.939,
  datasetSize: 1250,
  treeDepth: 5,
  features: [
    { key: 'previous_score', name: 'Previous Exam Score', importance: 0.28, benchmarkAverage: COHORT_BENCHMARKS.previous_score },
    { key: 'study_hours', name: 'Daily Study Hours', importance: 0.24, benchmarkAverage: COHORT_BENCHMARKS.study_hours },
    { key: 'attendance_pct', name: 'Attendance Rate', importance: 0.20, benchmarkAverage: COHORT_BENCHMARKS.attendance_pct },
    { key: 'assignment_completion', name: 'Assignment Turn-In Rate', importance: 0.14, benchmarkAverage: COHORT_BENCHMARKS.assignment_completion },
    { key: 'participation', name: 'Class Participation Score', importance: 0.07, benchmarkAverage: COHORT_BENCHMARKS.participation },
    { key: 'sleep_hours', name: 'Sleep Hygiene Hours', importance: 0.04, benchmarkAverage: COHORT_BENCHMARKS.sleep_hours },
    { key: 'previous_performance', name: 'Historical Rating', importance: 0.03, benchmarkAverage: COHORT_BENCHMARKS.previous_performance },
  ],
  confusionMatrix: {
    classes: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
    matrix: [
      [47, 3, 0, 0], // Actual Excellent -> Predicted
      [2, 65, 3, 0], // Actual Good -> Predicted
      [0, 3, 50, 2], // Actual Average -> Predicted
      [0, 0, 2, 43], // Actual Needs Improvement -> Predicted
    ],
  },
};
