"""
SmartPredict AI - ML Pipeline & API Test Suite
Covers:
- Dataset integrity
- Model artifact loading
- Prediction inference accuracy
- Probability normalization
- Input validation and edge cases
- Priority recommendations
"""

import os
import sys
import unittest
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from ml.predict import predict_student, validate_input, get_model
from ml.preprocessing import FEATURE_BOUNDS, FEATURE_COLUMNS, VALID_CLASSES
from utils.recommendations import generate_recommendations, generate_smart_improvement_plan

class TestMLPipeline(unittest.TestCase):

    def setUp(self):
        self.valid_input = {
            'study_hours': 4.0,
            'attendance_pct': 85.0,
            'previous_score': 78.0,
            'assignment_completion': 90.0,
            'sleep_hours': 7.5,
            'participation': 7,
            'previous_performance': 7
        }

    def test_model_artifact_loaded(self):
        model, metadata = get_model()
        self.assertIsNotNone(model)
        self.assertIsNotNone(metadata)
        self.assertIn('metrics', metadata)
        self.assertGreater(metadata['metrics']['accuracy'], 0.70)

    def test_prediction_output_structure(self):
        res = predict_student(self.valid_input)
        self.assertIn('prediction', res)
        self.assertIn(res['prediction'], VALID_CLASSES)
        self.assertIn('confidence', res)
        self.assertGreaterEqual(res['confidence'], 0.0)
        self.assertLessEqual(res['confidence'], 1.0)
        self.assertIn('probabilities', res)
        self.assertIn('recommendations', res)
        self.assertIsInstance(res['recommendations'], list)
        self.assertGreater(len(res['recommendations']), 0)
        self.assertIn('smartPlan', res)
        self.assertIn('thisWeek', res['smartPlan'])

    def test_probabilities_sum_to_one(self):
        res = predict_student(self.valid_input)
        prob_sum = sum(res['probabilities'].values())
        self.assertAlmostEqual(prob_sum, 1.0, places=2)

    def test_input_validation_success(self):
        sanitized = validate_input(self.valid_input)
        self.assertEqual(sanitized['study_hours'], 4.0)

    def test_input_validation_missing_key(self):
        invalid = self.valid_input.copy()
        del invalid['attendance_pct']
        with self.assertRaises(ValueError):
            validate_input(invalid)

    def test_input_validation_out_of_bounds(self):
        invalid = self.valid_input.copy()
        invalid['study_hours'] = 25.0  # Max is 12
        with self.assertRaises(ValueError):
            validate_input(invalid)

    def test_input_validation_negative_score(self):
        invalid = self.valid_input.copy()
        invalid['previous_score'] = -5.0
        with self.assertRaises(ValueError):
            validate_input(invalid)

    def test_edge_case_zero_values(self):
        zero_input = {
            'study_hours': 0.0,
            'attendance_pct': 0.0,
            'previous_score': 0.0,
            'assignment_completion': 0.0,
            'sleep_hours': 0.0,
            'participation': 1,
            'previous_performance': 1
        }
        res = predict_student(zero_input)
        self.assertEqual(res['prediction'], 'Needs Improvement')
        self.assertGreaterEqual(res['confidence'], 0.5)

    def test_edge_case_maximum_values(self):
        max_input = {
            'study_hours': 12.0,
            'attendance_pct': 100.0,
            'previous_score': 100.0,
            'assignment_completion': 100.0,
            'sleep_hours': 9.0,
            'participation': 10,
            'previous_performance': 10
        }
        res = predict_student(max_input)
        self.assertEqual(res['prediction'], 'Excellent')

    def test_recommendation_prioritization(self):
        at_risk = {
            'study_hours': 1.0,
            'attendance_pct': 45.0,
            'previous_score': 40.0,
            'assignment_completion': 40.0,
            'sleep_hours': 5.0,
            'participation': 3,
            'previous_performance': 3
        }
        recs = generate_recommendations(at_risk, 'Needs Improvement')
        self.assertTrue(any('attendance' in r.lower() for r in recs))
        self.assertLessEqual(len(recs), 3)

if __name__ == '__main__':
    unittest.main()
