"""
Academic Stress Pattern Predictor: Flask API

Loads stress_model_bundle.pkl (saved by the notebook) and serves:
    GET  /health         service and model status
    GET  /api/features   the fields a client must send, with allowed ranges
    POST /api/predict    JSON of the model features -> stress level, factors and message

This is a wellness-awareness tool. It is not a diagnosis and it does not measure burnout.
The API never stores or logs the answers it receives.
"""
import math
import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.environ.get("MODEL_PATH", BASE_DIR / "stress_model_bundle.pkl"))

# Comma separated list of frontend origins, for example:
#   ALLOWED_ORIGINS=https://my-site.com,https://www.my-site.com
# The default "*" lets any site call the API. Fine for a demo, restrict it before real use.
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

DISCLAIMER = (
    "This is a wellness-awareness tool, not a diagnosis. If you feel persistently overwhelmed, "
    "please talk to a counselor or someone you trust."
)

# name: (min, max, question shown to the student)
FEATURE_INFO = {
    "study_load": (0, 5, "How heavy is your study load?"),
    "academic_performance": (0, 5, "How do you rate your own academic performance?"),
    "future_career_concerns": (0, 5, "How worried are you about your career?"),
    "teacher_student_relationship": (0, 5, "How is your relationship with your teachers?"),
    "sleep_quality": (0, 5, "How well do you sleep?"),
    "headache": (0, 5, "How often do you get headaches?"),
    "breathing_problem": (0, 5, "Do you have trouble breathing?"),
    "blood_pressure": (1, 3, "What is your blood pressure usually?"),
    "social_support": (0, 3, "How much support do you get from people around you?"),
    "peer_pressure": (0, 5, "How much pressure do you feel from your peers?"),
    "extracurricular_activities": (0, 5, "How busy are you with clubs and activities?"),
    "bullying": (0, 5, "Have you faced bullying?"),
    "noise_level": (0, 5, "How noisy is the place where you live or study?"),
    "living_conditions": (0, 5, "How comfortable is your living space?"),
    "safety": (0, 5, "How safe do you feel where you live?"),
    "basic_needs": (0, 5, "How well are your basic needs met (food, rest, money)?"),
    "anxiety_level": (0, 21, "Anxiety score (0 to 21)"),
    "self_esteem": (0, 30, "Self-esteem score (0 to 30)"),
    "depression": (0, 27, "Depression score (0 to 27)"),
    "mental_health_history": (0, 1, "Mental health history (0 = no, 1 = yes)"),
}

# Same wording as the notebook. Only these factors appear in the advice text.
PHRASES = {
    "study_load": "a heavy study load",
    "sleep_quality": "poorer sleep quality",
    "peer_pressure": "higher peer pressure",
    "future_career_concerns": "career worries",
    "academic_performance": "lower academic performance",
    "social_support": "limited social support",
    "noise_level": "a noisy environment",
    "living_conditions": "difficult living conditions",
    "bullying": "bullying experiences",
    "teacher_student_relationship": "a strained teacher-student relationship",
    "basic_needs": "unmet basic needs",
    "safety": "safety concerns",
    "extracurricular_activities": "extracurricular load",
}
# Health and mental health columns can be used by the model but are never shown as advice factors.
NOT_IN_TEXT = {
    "blood_pressure", "breathing_problem", "headache",
    "anxiety_level", "self_esteem", "mental_health_history", "depression",
}


def load_bundle(path):
    if not path.exists():
        raise RuntimeError(
            f"Model file not found: {path}. Run the notebook to create stress_model_bundle.pkl "
            "and make sure the file is committed to git."
        )
    bundle = joblib.load(path)
    needed = {"model", "features", "importance", "medians", "direction", "labels"}
    missing = needed - set(bundle)
    if missing:
        raise RuntimeError(f"Model bundle is missing keys: {sorted(missing)}")
    return bundle


BUNDLE = load_bundle(MODEL_PATH)
MODEL = BUNDLE["model"]
FEATURES = list(BUNDLE["features"])
LABELS = {int(k): v for k, v in BUNDLE["labels"].items()}
IMPORTANCE = BUNDLE["importance"]
MEDIANS = BUNDLE["medians"]
DIRECTION = BUNDLE["direction"]
TEXT_RANKING = [f for f in IMPORTANCE.index if f not in NOT_IN_TEXT and f in PHRASES]

app = Flask(__name__)
app.json.sort_keys = False
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # answers are tiny, reject anything bigger


# ----------------------------------------------------------------------------- helpers
def join_words(items):
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]


def parse_value(name, raw):
    """Returns a whole number or raises ValueError with a short reason."""
    if raw is None or isinstance(raw, bool):
        raise ValueError("must be a number")
    try:
        number = float(raw)
    except (TypeError, ValueError):
        raise ValueError("must be a number")
    if not math.isfinite(number):
        raise ValueError("must be a number")
    if number != int(number):
        raise ValueError("must be a whole number")
    value = int(number)
    if name in FEATURE_INFO:
        low, high, _ = FEATURE_INFO[name]
        if not low <= value <= high:
            raise ValueError(f"must be between {low} and {high}")
    return value


def build_result(values):
    row = pd.DataFrame([values], columns=FEATURES)
    code = int(MODEL.predict(row)[0])
    level = LABELS[code]

    drivers = []
    for feature in TEXT_RANKING[:8]:
        if DIRECTION[feature] * (values[feature] - MEDIANS[feature]) > 0:
            drivers.append(feature)
    drivers = drivers[:3]

    if level == "low":
        message = "Your current pattern is associated with low self-reported stress. Keep protecting your rest and routine."
    elif drivers:
        message = (
            "Your current pattern, including " + join_words([PHRASES[f] for f in drivers]) +
            ", is associated with " + level + " self-reported stress. "
            "Consider planning a break and reviewing upcoming deadlines."
        )
    else:
        message = "Your current pattern is associated with " + level + " self-reported stress."

    return {
        "level": level,
        "level_code": code,
        "factors": [PHRASES[f] for f in drivers] if level != "low" else [],
        "message": message,
        "disclaimer": DISCLAIMER,
        "support_suggested": level == "high",
    }


def error(status, code, message, details=None):
    body = {"error": code, "message": message}
    if details:
        body["details"] = details
    return jsonify(body), status


# ----------------------------------------------------------------------------- CORS
@app.after_request
def add_headers(response):
    origin = request.headers.get("Origin")
    if origin and request.path.startswith("/api/"):
        if "*" in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = "*"
        elif origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Max-Age"] = "600"
    if request.path.startswith("/api/predict"):
        response.headers["Cache-Control"] = "no-store"  # answers are sensitive, never cache them
    return response


# ----------------------------------------------------------------------------- routes
@app.get("/")
def index():
    return jsonify({
        "service": "Academic Stress Pattern Predictor API",
        "note": "Wellness-awareness tool. Not a diagnosis. Does not measure burnout.",
        "endpoints": ["GET /health", "GET /api/features", "POST /api/predict"],
    })


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "model": BUNDLE.get("model_name", "unknown"),
        "feature_set": BUNDLE.get("feature_set", "unknown"),
        "n_features": len(FEATURES),
    })


@app.get("/api/features")
def features():
    fields = []
    for name in FEATURES:
        low, high, question = FEATURE_INFO.get(name, (None, None, name))
        fields.append({"name": name, "min": low, "max": high, "question": question})
    return jsonify({"count": len(fields), "fields": fields})


@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":  # CORS preflight
        return "", 204

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error(400, "invalid_json", "Send a JSON object with the answers, with Content-Type: application/json.")

    missing = [f for f in FEATURES if f not in data]
    if missing:
        return error(400, "missing_fields", "Some answers are missing.", {"missing": missing})

    values, problems = {}, {}
    for name in FEATURES:
        try:
            values[name] = parse_value(name, data[name])
        except ValueError as reason:
            problems[name] = str(reason)
    if problems:
        return error(400, "invalid_input", "Some answers are not valid.", problems)

    return jsonify(build_result(values))


# ----------------------------------------------------------------------------- errors
@app.errorhandler(404)
def not_found(_):
    return error(404, "not_found", "This endpoint does not exist.")


@app.errorhandler(405)
def method_not_allowed(_):
    return error(405, "method_not_allowed", "This method is not allowed for this endpoint.")


@app.errorhandler(413)
def too_large(_):
    return error(413, "payload_too_large", "The request body is too large.")


@app.errorhandler(500)
def server_error(_):
    # No answers or stack traces are returned or logged here.
    return error(500, "server_error", "Something went wrong. Please try again.")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
