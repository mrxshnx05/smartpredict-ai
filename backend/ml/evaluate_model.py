"""
SmartPredict AI - Model Evaluation Script
Computes comprehensive evaluation metrics on the held-out test partition.
Verifies model performance, class balance, and prints the confusion matrix.
"""

import os
import sys
import json
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import load_and_validate_dataset, prepare_train_test_split, VALID_CLASSES

def evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, 'model', 'smartpredict_model.pkl')
    csv_path = os.path.join(base_dir, 'data', 'student_data.csv')
    
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Running train_model.py first...")
        from train_model import train_and_evaluate
        train_and_evaluate()
        
    model = joblib.load(model_path)
    df = load_and_validate_dataset(csv_path)
    _, X_test, _, y_test = prepare_train_test_split(df, test_size=0.20, random_state=42)
    
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=VALID_CLASSES)
    cm = confusion_matrix(y_test, y_pred, labels=VALID_CLASSES)
    
    print("\n" + "="*50)
    print("SMARTPREDICT AI - MODEL AUDIT & EVALUATION REPORT")
    print("="*50)
    print(f"Test Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(report)
    print("Confusion Matrix:")
    print("Columns: Predicted, Rows: True")
    print(f"{'Class':<20} | " + " | ".join([f"{c[:5]:<5}" for c in VALID_CLASSES]))
    print("-" * 55)
    for idx, row in enumerate(cm):
        print(f"{VALID_CLASSES[idx]:<20} | " + " | ".join([f"{val:<5}" for val in row]))
    print("="*50 + "\n")

if __name__ == '__main__':
    evaluate()
