"""
api.py - Flask REST API (Streamlit app.py ki jagah ya uske saath).

Endpoints:
  GET  /health                       -> {"status": "ok"}
  POST /chat     {"message", "session_id"?}   -> reply (Gemini) + detected emotion
  POST /analyze  {"text"}                     -> sirf emotion model (Gemini ke bina)
  POST /reset    {"session_id"}               -> chat history saaf

Env vars:
  GEMINI_API_KEY   (zaroori)
  GEMINI_MODEL     (optional)
  API_TOKEN        (optional) set kiya to har request me header  X-API-Key: <token>  chahiye (/health ko chhodkar)
  CORS_ORIGINS     (optional) "*" ya "https://mysite.com,https://other.com"
  RATE_LIMIT_PER_MIN (default 30, per IP)

Chalane ke liye (ek hi worker, kyunki sessions memory me hain):
  gunicorn api:app --workers 1 --threads 8 --timeout 60
"""
import os
import re
import threading
import time
import uuid
from collections import defaultdict, deque

from flask import Flask, jsonify, request

import chatbot

HERE = os.path.dirname(os.path.abspath(__file__))
SESSION_TTL = 30 * 60        # 30 min inactive -> session delete
MAX_SESSIONS = 2000
MAX_MESSAGE_CHARS = 1000
SESSION_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


def create_app(emotion_model=None, llm=None):
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024      # bade payload reject

    api_token = os.environ.get("API_TOKEN")
    origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    rate_limit = int(os.environ.get("RATE_LIMIT_PER_MIN", "30"))

    deps = {"model": emotion_model, "llm": llm}
    deps_lock = threading.Lock()
    sessions, sessions_lock = {}, threading.Lock()
    hits = defaultdict(deque)

    # ------------------------------------------------------------- helpers
    def get_model():
        with deps_lock:
            if deps["model"] is None:
                from emotion_onnx import EmotionModel
                deps["model"] = EmotionModel(os.path.join(HERE, "model"))
            return deps["model"]

    def get_llm():
        with deps_lock:
            if deps["llm"] is None:
                deps["llm"] = chatbot.GeminiResponder()      # key env var se
            return deps["llm"]

    def err(msg, code):
        return jsonify({"error": msg}), code

    def get_session(sid):
        now = time.time()
        with sessions_lock:
            for k in [k for k, v in sessions.items() if now - v["last"] > SESSION_TTL]:
                del sessions[k]
            if sid not in sessions:
                if len(sessions) >= MAX_SESSIONS:
                    oldest = min(sessions, key=lambda k: sessions[k]["last"])
                    del sessions[oldest]
                sessions[sid] = {"state": chatbot.new_state(), "lock": threading.Lock(), "last": now}
            sessions[sid]["last"] = now
            return sessions[sid]

    def json_body():
        data = request.get_json(silent=True)
        return data if isinstance(data, dict) else None

    # ------------------------------------------------ CORS, auth, rate limit
    @app.before_request
    def guard():
        if request.method == "OPTIONS" or request.path == "/health":
            return None
        if api_token and request.headers.get("X-API-Key") != api_token:
            return err("unauthorized", 401)
        ip = request.headers.get("X-Forwarded-For", request.remote_addr or "?").split(",")[0].strip()
        now = time.time()
        q = hits[ip]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= rate_limit:
            return err("too many requests, please slow down", 429)
        q.append(now)
        return None

    @app.after_request
    def cors(resp):
        origin = request.headers.get("Origin")
        if origin and ("*" in origins or origin in origins):
            resp.headers["Access-Control-Allow-Origin"] = "*" if "*" in origins else origin
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-API-Key"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            resp.headers["Vary"] = "Origin"
        return resp

    @app.route("/chat", methods=["OPTIONS"])
    @app.route("/analyze", methods=["OPTIONS"])
    @app.route("/reset", methods=["OPTIONS"])
    def preflight():
        return "", 204

    # --------------------------------------------------------------- routes
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/chat")
    def chat():
        data = json_body()
        if data is None:
            return err("send JSON body", 400)
        message = data.get("message")
        if not isinstance(message, str) or not message.strip():
            return err("'message' (non-empty string) is required", 400)
        message = message.strip()
        if len(message) > MAX_MESSAGE_CHARS:
            return err("message too long (max %d characters)" % MAX_MESSAGE_CHARS, 400)
        sid = data.get("session_id") or uuid.uuid4().hex
        if not isinstance(sid, str) or not SESSION_ID_RE.match(sid):
            return err("'session_id' must be 8-64 chars: letters, digits, _ or -", 400)

        sess = get_session(sid)
        with sess["lock"]:                        # ek session par ek time me ek hi request
            out = chatbot.chat(message, sess["state"], get_model().analyze, get_llm())
        a = out["analysis"]
        return jsonify({
            "session_id": sid,
            "reply": out["reply"],
            "crisis": out["crisis"],
            "error": out["intent"] == "llm_error",
            "emotion": None if a is None else {
                "emotion": a["emotion"], "sentiment": a["sentiment"], "confidence": a["confidence"],
                "top2": a["top2"], "confident": a["confident"], "source": a["source"]},
        })

    @app.post("/analyze")
    def analyze():
        data = json_body()
        text = data.get("text") if data else None
        if not isinstance(text, str) or not text.strip():
            return err("'text' (non-empty string) is required", 400)
        if len(text) > MAX_MESSAGE_CHARS:
            return err("text too long (max %d characters)" % MAX_MESSAGE_CHARS, 400)
        r = get_model().analyze(text.strip())
        return jsonify({"emotion": r["emotion"], "sentiment": r["sentiment"],
                        "confidence": round(r["emotion_conf"], 4), "top2": r["top2"]})

    @app.post("/reset")
    def reset():
        data = json_body()
        sid = data.get("session_id") if data else None
        if not isinstance(sid, str) or not SESSION_ID_RE.match(sid):
            return err("valid 'session_id' is required", 400)
        with sessions_lock:
            sessions.pop(sid, None)
        return jsonify({"status": "reset"})

    @app.errorhandler(404)
    def not_found(_):
        return err("not found", 404)

    @app.errorhandler(405)
    def bad_method(_):
        return err("method not allowed", 405)

    @app.errorhandler(413)
    def too_big(_):
        return err("payload too large", 413)

    @app.errorhandler(Exception)
    def unexpected(e):
        app.logger.exception("unhandled error: %r", e)
        return err("internal server error", 500)

    return app


class _LazyApp:
    """`gunicorn api:app` ke liye: app pehli request par banti hai (import par model load nahi hota)."""
    _app = None
    _lock = threading.Lock()

    def __call__(self, environ, start_response):
        with self._lock:
            if self._app is None:
                self._app = create_app()
        return self._app(environ, start_response)


app = _LazyApp()

if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
