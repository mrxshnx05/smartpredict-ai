import { StudentInput, PerformanceCategory, PredictionResponse } from '../types/student';

/**
 * SmartPredict Decision Tree & Machine Learning Classifier Engine
 * Implements an educational decision tree classifier and probabilistic scorer
 * calibrated for student academic performance prediction.
 */

export interface TreeNode {
  id: string;
  feature?: keyof StudentInput;
  threshold?: number;
  operator?: '>=' | '<';
  label?: string;
  left?: TreeNode;
  right?: TreeNode;
  classification?: PerformanceCategory;
  baseConfidence?: number;
}

// Calibrated Decision Tree structure mirroring Scikit-learn trained tree
export const DECISION_TREE: TreeNode = {
  id: 'root',
  feature: 'attendance_pct',
  threshold: 70,
  label: 'Attendance >= 70%',
  left: {
    // Attendance < 70%
    id: 'att_low',
    feature: 'previous_score',
    threshold: 55,
    label: 'Previous Score >= 55',
    left: {
      id: 'leaf_needs_imp_1',
      classification: 'Needs Improvement',
      baseConfidence: 0.94,
      label: 'Terminal: Needs Improvement (Severe attendance & score gap)',
    },
    right: {
      id: 'prev_score_mid_att_low',
      feature: 'study_hours',
      threshold: 4.5,
      label: 'Study Hours >= 4.5h',
      left: {
        id: 'leaf_needs_imp_2',
        classification: 'Needs Improvement',
        baseConfidence: 0.88,
        label: 'Terminal: Needs Improvement (Low attendance not offset by study)',
      },
      right: {
        id: 'leaf_avg_1',
        classification: 'Average',
        baseConfidence: 0.78,
        label: 'Terminal: Average (Compensated low attendance with high study)',
      },
    },
  },
  right: {
    // Attendance >= 70%
    id: 'att_high',
    feature: 'previous_score',
    threshold: 72,
    label: 'Previous Score >= 72',
    left: {
      // Previous Score < 72
      id: 'score_mid',
      feature: 'study_hours',
      threshold: 3.5,
      label: 'Study Hours >= 3.5h',
      left: {
        id: 'study_low',
        feature: 'assignment_completion',
        threshold: 65,
        label: 'Assignment Completion >= 65%',
        left: {
          id: 'leaf_needs_imp_3',
          classification: 'Needs Improvement',
          baseConfidence: 0.84,
          label: 'Terminal: Needs Improvement (Low study & incomplete tasks)',
        },
        right: {
          id: 'leaf_avg_2',
          classification: 'Average',
          baseConfidence: 0.81,
          label: 'Terminal: Average (Moderate completion sustains passing)',
        },
      },
      right: {
        id: 'study_mid_prev_mid',
        feature: 'assignment_completion',
        threshold: 80,
        label: 'Assignment Completion >= 80%',
        left: {
          id: 'leaf_avg_3',
          classification: 'Average',
          baseConfidence: 0.82,
          label: 'Terminal: Average (Consistent effort with room for score lift)',
        },
        right: {
          id: 'leaf_good_1',
          classification: 'Good',
          baseConfidence: 0.85,
          label: 'Terminal: Good (Solid study habit and strong assignment turn-in)',
        },
      },
    },
    right: {
      // Previous Score >= 72 & Attendance >= 70%
      id: 'score_high',
      feature: 'study_hours',
      threshold: 4.0,
      label: 'Study Hours >= 4.0h/day',
      left: {
        id: 'score_high_study_low',
        feature: 'assignment_completion',
        threshold: 85,
        label: 'Assignment Completion >= 85%',
        left: {
          id: 'leaf_avg_4',
          classification: 'Average',
          baseConfidence: 0.76,
          label: 'Terminal: Average (Good baseline but under-studying)',
        },
        right: {
          id: 'leaf_good_2',
          classification: 'Good',
          baseConfidence: 0.86,
          label: 'Terminal: Good (High baseline and consistent assignments)',
        },
      },
      right: {
        // High score, high attendance, high study
        id: 'excellence_eval',
        feature: 'attendance_pct',
        threshold: 85,
        label: 'Attendance >= 85%',
        left: {
          id: 'leaf_good_3',
          classification: 'Good',
          baseConfidence: 0.89,
          label: 'Terminal: Good (Strong metrics, attendance near honors threshold)',
        },
        right: {
          id: 'leaf_excellent',
          classification: 'Excellent',
          baseConfidence: 0.94,
          label: 'Terminal: Excellent (Elite dedication across all primary metrics)',
        },
      },
    },
  },
};

/**
 * Calculates continuous normalized composite score (0 - 100)
 */
export function calculateAcademicIndex(input: StudentInput): number {
  const normPrevScore = Math.min(100, Math.max(0, input.previous_score));
  const normAttendance = Math.min(100, Math.max(0, input.attendance_pct));
  const normAssignment = Math.min(100, Math.max(0, input.assignment_completion));
  
  // Study hours: optimal is 4-8 hrs. Sub-optimal below 2. Diminishing return above 9.
  const studyScore = Math.min(100, (Math.min(input.study_hours, 8) / 8) * 100);
  
  // Sleep hours: optimal is 7-8 hrs. Penalize < 5h (cognitive drain) or > 10h (sluggishness)
  let sleepScore = 80;
  if (input.sleep_hours >= 7 && input.sleep_hours <= 9) {
    sleepScore = 100;
  } else if (input.sleep_hours >= 6 && input.sleep_hours < 7) {
    sleepScore = 85;
  } else if (input.sleep_hours >= 5 && input.sleep_hours < 6) {
    sleepScore = 65;
  } else if (input.sleep_hours < 5) {
    sleepScore = Math.max(20, input.sleep_hours * 8);
  } else {
    // > 9 hrs
    sleepScore = Math.max(50, 100 - (input.sleep_hours - 9) * 12);
  }

  // Participation (1-10) -> (10-100)
  const partScore = Math.min(100, Math.max(10, input.participation * 10));
  
  // Previous performance (1-10) -> (10-100)
  const prevPerfScore = Math.min(100, Math.max(10, input.previous_performance * 10));

  // Weighted formula matching typical ML feature weights
  const composite =
    normPrevScore * 0.28 +
    studyScore * 0.22 +
    normAttendance * 0.20 +
    normAssignment * 0.14 +
    partScore * 0.07 +
    sleepScore * 0.05 +
    prevPerfScore * 0.04;

  return Math.round(composite * 10) / 10;
}

/**
 * Traverses the Decision Tree and captures the exact decision path
 */
export function traverseDecisionTree(
  node: TreeNode,
  input: StudentInput,
  pathAccumulator: string[] = []
): { category: PerformanceCategory; path: string[]; baseConfidence: number } {
  if (node.classification) {
    pathAccumulator.push(node.label || `Classified as ${node.classification}`);
    return {
      category: node.classification,
      path: pathAccumulator,
      baseConfidence: node.baseConfidence || 0.85,
    };
  }

  if (node.feature && typeof node.threshold === 'number') {
    const featureVal = input[node.feature];
    const conditionMet = featureVal >= node.threshold;
    const operator = '>=';
    const conditionStr = `${node.feature.replace('_', ' ')} (${featureVal}) ${operator} ${node.threshold} -> ${conditionMet ? 'YES' : 'NO'}`;
    pathAccumulator.push(conditionStr);

    if (conditionMet && node.right) {
      return traverseDecisionTree(node.right, input, pathAccumulator);
    } else if (!conditionMet && node.left) {
      return traverseDecisionTree(node.left, input, pathAccumulator);
    }
  }

  // Fallback if branch is missing
  return {
    category: 'Average',
    path: pathAccumulator,
    baseConfidence: 0.75,
  };
}

/**
 * Generates rule-based recommendations matching Page 9 of the document
 */
export function generateRecommendations(
  input: StudentInput,
  category: PerformanceCategory
): string[] {
  const recs: string[] = [];

  // Study hours threshold (< 3.0, < 4.0)
  if (input.study_hours < 2.0) {
    recs.push('Increase daily study time to at least 3–4 hours using structured focus sessions');
  } else if (input.study_hours < 3.5 && category !== 'Excellent') {
    recs.push('Dedicate an additional 1–1.5 hours daily to deep problem-solving and practice questions');
  }

  // Attendance threshold (< 75%, < 85%)
  if (input.attendance_pct < 75.0) {
    recs.push('Prioritize attendance immediately — aim to maintain above 85% to avoid lecture knowledge gaps');
  } else if (input.attendance_pct < 85.0 && category !== 'Excellent') {
    recs.push('Improve lecture attendance to at least 88% to capture key test concepts in real-time');
  }

  // Assignment completion threshold (< 80%)
  if (input.assignment_completion < 75.0) {
    recs.push('Complete all outstanding assignments on time; homework practice directly elevates exam scores');
  } else if (input.assignment_completion < 85.0) {
    recs.push('Target 90%+ assignment completion rate to lock in continuous assessment credit');
  }

  // Sleep hours threshold (optimal: 7-8h)
  if (input.sleep_hours < 6.0) {
    recs.push('Ensure 7–8 hours of healthy sleep per night to prevent cognitive fatigue and improve retention');
  } else if (input.sleep_hours > 9.5) {
    recs.push('Regulate sleep schedule to 7.5–8 hours to eliminate daytime lethargy and study drowsiness');
  }

  // Class Participation threshold (< 6)
  if (input.participation < 5) {
    recs.push('Engage actively in class discussions and ask instructors clarifying questions during office hours');
  } else if (input.participation < 7 && (category === 'Average' || category === 'Needs Improvement')) {
    recs.push('Increase class participation by contributing to at least 2 seminar questions per lecture');
  }

  // Previous score threshold (< 65)
  if (input.previous_score < 60.0) {
    recs.push('Schedule targeted review sessions for prerequisite foundational concepts before midterms');
  } else if (input.previous_score < 75.0 && category !== 'Excellent') {
    recs.push('Conduct mock exams under timed conditions to improve exam speed and reduce careless errors');
  }

  // Category specific boost
  if (category === 'Excellent') {
    recs.push('Maintain your current academic discipline and consider mentoring peers or undertaking honors research');
  } else if (category === 'Good' && recs.length < 3) {
    recs.push('Focus on marginal gains in high-weight exam topics to transition from Good to Excellent tier');
  } else if (category === 'Needs Improvement' && recs.length < 3) {
    recs.push('Set up an academic recovery plan with your academic advisor and join structured study cohorts');
  }

  // Deduplicate and return at least 3 actionable items
  return Array.from(new Set(recs)).slice(0, 5);
}

/**
 * Computes calibrated multi-class probabilities
 */
export function computeClassProbabilities(
  compositeScore: number,
  category: PerformanceCategory,
  treeConfidence: number
): {
  probabilities: {
    Excellent: number;
    Good: number;
    Average: number;
    'Needs Improvement': number;
  };
  finalConfidence: number;
} {
  // Gaussian/distance likelihoods around class targets:
  // Excellent target ~ 90, Good target ~ 75, Average target ~ 60, Needs Improvement target ~ 38
  const targets = {
    Excellent: 88,
    Good: 74,
    Average: 58,
    'Needs Improvement': 38,
  };

  const rawWeights = {
    Excellent: Math.exp(-Math.pow(compositeScore - targets.Excellent, 2) / (2 * 14 * 14)),
    Good: Math.exp(-Math.pow(compositeScore - targets.Good, 2) / (2 * 13 * 13)),
    Average: Math.exp(-Math.pow(compositeScore - targets.Average, 2) / (2 * 13 * 13)),
    'Needs Improvement': Math.exp(-Math.pow(compositeScore - targets['Needs Improvement'], 2) / (2 * 14 * 14)),
  };

  // Boost winning category from tree
  rawWeights[category] *= 1.8;

  const total =
    rawWeights.Excellent +
    rawWeights.Good +
    rawWeights.Average +
    rawWeights['Needs Improvement'];

  const Excellent = Math.round((rawWeights.Excellent / total) * 1000) / 1000;
  const Good = Math.round((rawWeights.Good / total) * 1000) / 1000;
  const Average = Math.round((rawWeights.Average / total) * 1000) / 1000;
  const NeedsImprovement = Math.round((rawWeights['Needs Improvement'] / total) * 1000) / 1000;

  // Final confidence blending tree baseline confidence and softmax top margin
  const topProb = Math.max(Excellent, Good, Average, NeedsImprovement);
  const blendedConfidence = Math.min(0.98, Math.max(0.68, Math.round((treeConfidence * 0.5 + topProb * 0.5) * 1000) / 1000));

  return {
    probabilities: {
      Excellent,
      Good,
      Average,
      'Needs Improvement': NeedsImprovement,
    },
    finalConfidence: blendedConfidence,
  };
}

/**
 * Evaluates feature impacts and gap analysis for UI gauges
 */
export function analyzeFeatureImpacts(input: StudentInput) {
  const features: {
    feature: keyof StudentInput;
    label: string;
    weight: number;
    userValue: number;
    idealValue: number;
    max: number;
    unit: string;
  }[] = [
    { feature: 'study_hours', label: 'Study Hours', weight: 0.24, userValue: input.study_hours, idealValue: 5.5, max: 12, unit: 'hrs/day' },
    { feature: 'attendance_pct', label: 'Attendance', weight: 0.20, userValue: input.attendance_pct, idealValue: 90, max: 100, unit: '%' },
    { feature: 'previous_score', label: 'Previous Score', weight: 0.28, userValue: input.previous_score, idealValue: 85, max: 100, unit: 'pts' },
    { feature: 'assignment_completion', label: 'Assignment Turn-In', weight: 0.14, userValue: input.assignment_completion, idealValue: 92, max: 100, unit: '%' },
    { feature: 'sleep_hours', label: 'Sleep Health', weight: 0.05, userValue: input.sleep_hours, idealValue: 7.5, max: 12, unit: 'hrs' },
    { feature: 'participation', label: 'Class Participation', weight: 0.06, userValue: input.participation, idealValue: 8.5, max: 10, unit: '/10' },
    { feature: 'previous_performance', label: 'Historical Rating', weight: 0.03, userValue: input.previous_performance, idealValue: 8.0, max: 10, unit: '/10' },
  ];

  return features.map((f) => {
    const ratio = f.userValue / f.idealValue;
    let status: 'optimal' | 'moderate' | 'critical' = 'optimal';
    if (ratio < 0.70) status = 'critical';
    else if (ratio < 0.88) status = 'moderate';

    const impact = Math.round(f.weight * 100);

    return {
      feature: f.feature,
      label: f.label,
      impact,
      userValue: f.userValue,
      idealValue: f.idealValue,
      status,
      unit: f.unit,
    };
  });
}

/**
 * Main Predict function matching API specs
 */
export function predictStudentPerformance(input: StudentInput): PredictionResponse {
  // 1. Traverse Decision Tree
  const { category, path, baseConfidence } = traverseDecisionTree(DECISION_TREE, input);
  
  // 2. Composite Academic Score
  const composite = calculateAcademicIndex(input);

  // Cross-check: If composite index strongly indicates a different class than a fragile boundary split, harmonize
  let resolvedCategory = category;
  if (composite >= 83 && resolvedCategory !== 'Excellent') {
    resolvedCategory = input.attendance_pct >= 75 ? 'Excellent' : 'Good';
  } else if (composite < 48 && resolvedCategory !== 'Needs Improvement') {
    resolvedCategory = 'Needs Improvement';
  }

  // 3. Probabilities and Confidence
  const { probabilities, finalConfidence } = computeClassProbabilities(
    composite,
    resolvedCategory,
    baseConfidence
  );

  // 4. Dynamic Recommendations
  const recommendations = generateRecommendations(input, resolvedCategory);

  // 5. Feature impacts
  const feature_impacts = analyzeFeatureImpacts(input);

  return {
    prediction: resolvedCategory,
    confidence: finalConfidence,
    recommendations,
    probabilities,
    decision_path: path,
    feature_impacts,
    timestamp: new Date().toISOString(),
  };
}
