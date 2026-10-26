"""Coping Suggestions - Flask API (sirf ML model, Gemini ki zaroorat nahi).

Routes:
  GET  /health      server aur model ka status
  POST /recommend   mood, energy waghera do -> top activities milengi
"""
import hmac
import logging
import os
from datetime import datetime
from zoneinfo import ZoneInfo

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

from recommender import InputError, Recommender  # noqa: E402

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("api")

MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "model"))
API_SECRET = os.getenv("API_SECRET", "")
TIMEZONE = os.getenv("TIMEZONE", "Asia/Kolkata")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 256 * 1024
CORS(app, origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")])

recommender = Recommender(MODEL_DIR)


@app.before_request
def check_secret():
    """API_SECRET set hai toh header X-API-Key zaroori hai (/health ko chhodke)."""
    if not API_SECRET or request.path == "/health" or request.method == "OPTIONS":
        return None
    sent = request.headers.get("X-API-Key", "")
    if not hmac.compare_digest(sent.encode(), API_SECRET.encode()):
        return jsonify({"error": "Invalid or missing X-API-Key"}), 401
    return None


def time_of_day_now():
    hour = datetime.now(ZoneInfo(TIMEZONE)).hour
    if 5 <= hour < 12:
        return "morning"
    if 12 <= hour < 17:
        return "afternoon"
    if 17 <= hour < 21:
        return "evening"
    return "night"


@app.get("/health")
def health():
    return jsonify({"status": "ok", "activities": len(recommender.acts), "threshold": recommender.threshold})


@app.post("/recommend")
def recommend():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise InputError("JSON body chahiye")
    results = recommender.recommend(
        mood=data.get("mood"),
        intensity=data.get("mood_intensity", 3),
        energy=data.get("energy_level", 3),
        time_of_day=data.get("time_of_day") or time_of_day_now(),
        user_id=data.get("user_id"),
        profile=data.get("profile"),
        history=data.get("history"),
        top_n=data.get("top_n", 3),
    )
    return jsonify({"recommendations": results, "threshold": recommender.threshold})


@app.errorhandler(InputError)
def handle_input_error(err):
    return jsonify({"error": str(err)}), 400


@app.errorhandler(Exception)
def handle_unexpected(err):
    code = getattr(err, "code", None)
    if isinstance(code, int) and code < 500:
        return jsonify({"error": getattr(err, "description", "Bad request")}), code
    log.exception("Unexpected error")
    return jsonify({"error": "Server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
