"""
SmartPredict AI - Recommendation & Actionable Plan Engine
Generates personalized, non-judgmental, prioritized recommendations
and a 3-horizon Smart Improvement Plan based on input thresholds.
Uses responsible pedagogical language (associative, never deterministic causation).
"""

from typing import Dict, List, Any

FEATURE_THRESHOLDS = {
    'study_hours': {'critical': 2.0, 'target': 4.5, 'optimal': 6.0},
    'attendance_pct': {'critical': 75.0, 'target': 85.0, 'optimal': 92.0},
    'previous_score': {'critical': 60.0, 'target': 75.0, 'optimal': 88.0},
    'assignment_completion': {'critical': 70.0, 'target': 85.0, 'optimal': 95.0},
    'sleep_hours': {'min_healthy': 6.5, 'optimal': 7.5, 'max_healthy': 9.0},
    'participation': {'critical': 4, 'target': 7, 'optimal': 9},
    'previous_performance': {'critical': 4, 'target': 7, 'optimal': 9}
}

def generate_recommendations(inputs: Dict[str, float], predicted_class: str) -> List[str]:
    """
    Generates up to 3 prioritized, actionable recommendations.
    1. Highest priority (critical blocker)
    2. Important (core academic leverage)
    3. Optional improvement (synergy & enrichment)
    """
    study = inputs.get('study_hours', 0.0)
    attendance = inputs.get('attendance_pct', 0.0)
    prev_score = inputs.get('previous_score', 0.0)
    assignments = inputs.get('assignment_completion', 0.0)
    sleep = inputs.get('sleep_hours', 0.0)
    participation = inputs.get('participation', 5)
    
    highest_priority = []
    important = []
    optional = []
    
    # Priority 1: Critical blockers
    if attendance < FEATURE_THRESHOLDS['attendance_pct']['critical']:
        highest_priority.append(
            f"Prioritize lecture attendance: current rate ({attendance}%) is below the {FEATURE_THRESHOLDS['attendance_pct']['critical']}% benchmark associated with course completion."
        )
    elif study < FEATURE_THRESHOLDS['study_hours']['critical']:
        highest_priority.append(
            f"Establish structured study blocks: increasing from {study}h to at least 3.0h/day creates vital subject retention."
        )
    elif assignments < FEATURE_THRESHOLDS['assignment_completion']['critical']:
        highest_priority.append(
            f"Address missing assignments: submitting overdue coursework to raise completion above 80% directly stabilizes term grading."
        )
    
    # Priority 2: Core Academic leverage
    if assignments < 85.0 and not any('assignment' in r for r in highest_priority):
        important.append(
            f"Target 90%+ assignment completion: regular problem set turn-in reinforces conceptual mastery before exams."
        )
    if prev_score < 70.0 and not any('score' in r for r in highest_priority):
        important.append(
            "Schedule diagnostic revision sessions targeting specific topics tested on previous assessments."
        )
    if study < 4.5 and not any('study' in r for r in highest_priority):
        important.append(
            f"Scale daily study to 4.0-5.0 hours using focused 45-minute intervals with active recall and practice questions."
        )
    if attendance < 90.0 and not any('attendance' in r for r in highest_priority):
        important.append(
            "Maintain consistent lecture presence to capture real-time instructor emphasis and exam hints."
        )
    
    # Priority 3: Synergy & enrichment
    if sleep < 6.5:
        optional.append(
            f"Protect cognitive rest: current sleep ({sleep}h) is below the recommended 7-8h range essential for memory consolidation."
        )
    elif sleep > 9.5:
        optional.append(
            "Structure consistent morning waking routines to optimize daytime alertness and focus."
        )
    if participation < 6:
        optional.append(
            f"Engage actively in class: raising participation from {participation}/10 via questions or office hours strengthens conceptual clarity."
        )
    elif not optional and predicted_class == 'Excellent':
        optional.append(
            "Maintain peer study leadership or explore honors/research extensions in your favorite subject area."
        )
    elif not optional:
        optional.append(
            "Conduct weekly timed review simulations to reinforce high-stakes exam speed and composure."
        )
        
    final_recs = []
    if highest_priority:
        final_recs.append(highest_priority[0])
    if important:
        final_recs.append(important[0])
    if optional:
        final_recs.append(optional[0])
        
    # Fallback if empty
    if not final_recs:
        final_recs.append("Maintain your current balanced academic discipline and continue consistent weekly review.")
        
    return final_recs[:3]

def generate_smart_improvement_plan(inputs: Dict[str, float], predicted_class: str) -> Dict[str, Any]:
    """
    Generates a structured 3-horizon Smart Improvement Plan:
    - THIS WEEK (immediate diagnostic & triage)
    - NEXT 2 WEEKS (habit consolidation)
    - ONGOING (sustainable excellence)
    """
    study = inputs.get('study_hours', 4.0)
    attendance = inputs.get('attendance_pct', 80.0)
    assignments = inputs.get('assignment_completion', 80.0)
    sleep = inputs.get('sleep_hours', 7.0)
    
    target_study = min(8.0, round(study + 1.2, 1)) if study < 4.0 else study
    target_att = min(100.0, round(attendance + 8.0, 1)) if attendance < 85.0 else attendance
    target_comp = min(100.0, round(assignments + 10.0, 1)) if assignments < 90.0 else assignments
    target_sleep = 7.5 if sleep < 6.5 else sleep
    
    return {
        'thisWeek': [
            f"Audit recent assignments and submit any pending coursework to trend toward {target_comp}%.",
            f"Schedule fixed daily study windows aiming for {target_study} hrs/day using focused Pomodoro intervals.",
            "Identify 2 highest-friction conceptual topics to address in office hours."
        ],
        'nextTwoWeeks': [
            f"Consolidate attendance target ({target_att}%) across all core lecture sections.",
            "Replace passive reading with active recall, flashcards, and untimed practice problems.",
            f"Protect a regular {target_sleep}-hour sleep schedule to maximize cognitive memory consolidation."
        ],
        'ongoing': [
            "Conduct bi-weekly timed practice exam simulations under realistic conditions.",
            "Participate actively in weekly group discussion or study groups at least twice per week.",
            "Track weekly performance consistency rather than cramming before milestone deadlines."
        ],
        'disclaimer': "This roadmap is an educational guidance tool and does not guarantee specific grade outcomes."
    }
