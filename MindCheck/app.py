import logging
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_curve
from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / os.environ.get("MODEL_DIR", "output")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

TARGETS = {"phq_pos": "depression", "gad_pos": "anxiety"}
GENDERS = {"female", "male"}
EDUCATION = {"associate", "bachelor", "master", "doctorate"}
SMOKE = {"never", "occasional", "former", "current"}
DRINK = {"never", "occasional", "past", "regular"}

DISCLAIMER = (
    "This is a screening result, not a diagnosis. "
    "Only a qualified mental health professional can diagnose or treat."
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("mindcheck")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # requests are tiny; reject big ones


# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------
TARGET_RECALL = 0.80
SMOKE_TEST_INPUT = {
    "isi_answers": [1] * 7, "pss_answers": [3] * 14, "age": 20,
    "gender": "female", "edu": "bachelor", "smoke": "never", "drink": "never",
}


def build_row(inputs):
    row = {
        "isi_score": sum(inputs["isi_answers"]),
        "pss_score": sum(inputs["pss_answers"]) - 14,  # PSS answers are 1-5
        "age": inputs["age"],
        "gender": inputs["gender"],
        "edu": inputs["edu"],
        "smoke": inputs["smoke"],
        "drink": inputs["drink"],
    }
    for i, v in enumerate(inputs["isi_answers"], 1):
        row[f"isi_q{i}"] = v
    for i, v in enumerate(inputs["pss_answers"], 1):
        row[f"pss_q{i}"] = v
    return row


def predict_proba(bundle, inputs):
    x_row = pd.DataFrame([build_row(inputs)])[bundle["features"]]
    return float(bundle["pipeline"].predict_proba(x_row)[0, 1])


def _new_pipeline(num_cols):
    cat_cols = ["gender", "edu", "smoke", "drink"]
    pre = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
    ])
    return Pipeline([
        ("preprocessing", pre),
        ("model", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])


def retrain(target):
    """Backup: rebuild one model from output/zenodo_cleaned_scored.csv (same steps as the notebook)."""
    df = pd.read_csv(MODEL_DIR / "zenodo_cleaned_scored.csv")
    item_cols = [c for c in df.columns if c.startswith("isi_q") or c.startswith("pss_q")]
    num_cols = ["isi_score", "pss_score", "age"] + item_cols
    features = num_cols + ["gender", "edu", "smoke", "drink"]
    X, y = df[features], df[target]

    X_tr, _, y_tr, _ = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_proba = cross_val_predict(_new_pipeline(num_cols), X_tr, y_tr, cv=cv, method="predict_proba")[:, 1]
    _, rec, thr = precision_recall_curve(y_tr, cv_proba)
    threshold = float(thr[np.where(rec[:-1] >= TARGET_RECALL)[0][-1]])

    pipeline = _new_pipeline(num_cols).fit(X, y)
    return {"pipeline": pipeline, "threshold": threshold, "features": features}


def load_models():
    models = {}
    for target in TARGETS:
        path = MODEL_DIR / f"{target}_final_model.pkl"
        try:
            bundle = joblib.load(path)  # only load files you created yourself
            bundle["threshold"]
            predict_proba(bundle, SMOKE_TEST_INPUT)  # catches version mismatch early
            models[target] = bundle
            log.info("Loaded model: %s", path.name)
        except Exception as exc:
            log.warning("Could not use %s (%s). Rebuilding from the cleaned CSV...", path.name, exc)
            try:
                models[target] = retrain(target)
                log.info("Rebuilt model: %s", target)
            except Exception as exc2:  # API stays alive; scoring does not need models
                log.error("Could not rebuild %s: %s", target, exc2)
    return models


MODELS = load_models()


# --------------------------------------------------------------------------
# Scoring (rule based, no ML)
# --------------------------------------------------------------------------
def phq9_level(score):
    if score <= 4:
        return "Minimal"
    if score <= 9:
        return "Mild"
    if score <= 14:
        return "Moderate"
    if score <= 19:
        return "Moderately severe"
    return "Severe"


def gad7_level(score):
    if score <= 4:
        return "Minimal"
    if score <= 9:
        return "Mild"
    if score <= 14:
        return "Moderate"
    return "Severe"


def score_questionnaire(phq9_answers, gad7_answers):
    phq_score = sum(phq9_answers)
    gad_score = sum(gad7_answers)
    q9_above_zero = phq9_answers[8] > 0  # safety flow depends ONLY on this answer
    return {
        "phq9": {"score": phq_score, "max_score": 27, "level": phq9_level(phq_score)},
        "gad7": {"score": gad_score, "max_score": 21, "level": gad7_level(gad_score)},
        "safety": {
            "show_support": q9_above_zero,
            "reason": "phq9_q9_above_zero" if q9_above_zero else None,
        },
    }


# --------------------------------------------------------------------------
# Input validation
# --------------------------------------------------------------------------
class ValidationError(Exception):
    pass


def _whole_number(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return None


def int_list(data, key, length, low, high):
    values = data.get(key)
    if not isinstance(values, list) or len(values) != length:
        raise ValidationError(f"'{key}' must be a list of {length} numbers")
    clean = []
    for v in values:
        n = _whole_number(v)
        if n is None or not low <= n <= high:
            raise ValidationError(f"every value in '{key}' must be a whole number from {low} to {high}")
        clean.append(n)
    return clean


def choice(data, key, allowed):
    value = data.get(key)
    if not isinstance(value, str) or value.strip().lower() not in allowed:
        raise ValidationError(f"'{key}' must be one of: {', '.join(sorted(allowed))}")
    return value.strip().lower()


def get_json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object")
    return data


def parse_questionnaire(data):
    return int_list(data, "phq9_answers", 9, 0, 3), int_list(data, "gad7_answers", 7, 0, 3)


def parse_ml_inputs(data):
    age = _whole_number(data.get("age"))
    if age is None or not 16 <= age <= 40:
        raise ValidationError("'age' must be a whole number from 16 to 40")
    return {
        "isi_answers": int_list(data, "isi_answers", 7, 0, 4),
        "pss_answers": int_list(data, "pss_answers", 14, 1, 5),
        "age": age,
        "gender": choice(data, "gender", GENDERS),
        "edu": choice(data, "edu", EDUCATION),
        "smoke": choice(data, "smoke", SMOKE),
        "drink": choice(data, "drink", DRINK),
    }


# --------------------------------------------------------------------------
# ML estimate (exploratory)
# --------------------------------------------------------------------------
def ml_estimate(inputs):
    result = {}
    for target, label in TARGETS.items():
        bundle = MODELS[target]
        proba = predict_proba(bundle, inputs)
        result[label] = {
            "risk_score": round(proba * 100, 1),  # model score, not a real probability
            "alert": proba >= bundle["threshold"],
        }
    return result


def models_ready():
    return all(t in MODELS for t in TARGETS)


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@app.get("/")
def index():
    return jsonify({
        "service": "MindCheck API",
        "endpoints": {
            "GET /health": "service status",
            "POST /api/score": "PHQ-9 + GAD-7 scores, levels and safety flag",
            "POST /api/predict": "exploratory ML risk score (sleep, stress, demographics)",
            "POST /api/screen": "score + optional ML in one call",
        },
        "disclaimer": DISCLAIMER,
    })


@app.get("/health")
def health():
    return jsonify({"status": "ok", "models_loaded": models_ready()})


@app.post("/api/score")
def api_score():
    phq9, gad7 = parse_questionnaire(get_json_body())
    result = score_questionnaire(phq9, gad7)
    result["disclaimer"] = DISCLAIMER
    return jsonify(result)


@app.post("/api/predict")
def api_predict():
    if not models_ready():
        return jsonify({"error": "ML models are not available right now"}), 503
    inputs = parse_ml_inputs(get_json_body())
    return jsonify({
        "ml": ml_estimate(inputs),
        "note": "risk_score is a model score from 0 to 100, not a probability. "
                "Alert means the score is above the tuned cut-off.",
        "disclaimer": DISCLAIMER,
    })


@app.post("/api/screen")
def api_screen():
    data = get_json_body()
    phq9, gad7 = parse_questionnaire(data)
    result = score_questionnaire(phq9, gad7)

    ml_inputs = data.get("ml_inputs")
    if ml_inputs is None:
        result["ml"] = None
    elif not models_ready():
        result["ml"] = {"available": False}
    else:
        if not isinstance(ml_inputs, dict):
            raise ValidationError("'ml_inputs' must be a JSON object")
        result["ml"] = {"available": True, **ml_estimate(parse_ml_inputs(ml_inputs))}

    result["disclaimer"] = DISCLAIMER
    return jsonify(result)


# --------------------------------------------------------------------------
# CORS + errors
# --------------------------------------------------------------------------
@app.after_request
def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = CORS_ORIGINS
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.errorhandler(ValidationError)
def handle_validation(err):
    return jsonify({"error": str(err)}), 400


@app.errorhandler(404)
def handle_404(_err):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(405)
def handle_405(_err):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(413)
def handle_413(_err):
    return jsonify({"error": "Request too large"}), 413


@app.errorhandler(500)
def handle_500(_err):
    return jsonify({"error": "Something went wrong on the server"}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=False)
