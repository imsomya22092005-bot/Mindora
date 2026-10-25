"""Flask API for the Emotion & Sentiment Analyzer + supportive chatbot."""
import os
import re
import threading
import time
import uuid
from collections import OrderedDict

from flask import Flask, jsonify, request

from chatbot import chat, is_crisis, new_state

MAX_CHARS = 1000
SESSION_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


class SessionStore:
    """Keeps chat state in memory only. Use ONE server process (see README)."""

    def __init__(self, ttl_seconds=1800, max_sessions=1000):
        self.ttl = ttl_seconds
        self.max = max_sessions
        self.data = OrderedDict()
        self.lock = threading.Lock()

    def get(self, session_id):
        now = time.time()
        with self.lock:
            for sid in [s for s, (seen, _) in self.data.items() if now - seen > self.ttl]:
                del self.data[sid]
            if session_id in self.data:
                state = self.data[session_id][1]
            else:
                state = new_state()
            self.data[session_id] = (now, state)
            self.data.move_to_end(session_id)
            while len(self.data) > self.max:
                self.data.popitem(last=False)
            return state

    def delete(self, session_id):
        with self.lock:
            self.data.pop(session_id, None)


def create_app(analyzer=None, session_ttl=1800, max_sessions=1000):
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
    if analyzer is None:
        from analyzer import Analyzer
        analyzer = Analyzer(os.environ.get("MODEL_DIR", "models"))
    sessions = SessionStore(session_ttl, max_sessions)
    allowed_origin = os.environ.get("ALLOWED_ORIGIN")  # e.g. https://myapp.com ; unset = no CORS headers

    @app.after_request
    def add_cors(resp):
        if allowed_origin:
            resp.headers["Access-Control-Allow-Origin"] = allowed_origin
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp

    def bad(message, code=400):
        return jsonify({"error": message}), code

    def read_text(field):
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return None, None, "Send a JSON body with Content-Type: application/json"
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            return None, data, '"%s" must be a non-empty string' % field
        value = value.strip()
        if len(value) > MAX_CHARS:
            return None, data, '"%s" is too long (max %d characters)' % (field, MAX_CHARS)
        return value, data, None

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/analyze")
    def analyze_route():
        text, _, err = read_text("text")
        if err:
            return bad(err)
        info = analyzer.analyze(text)
        return jsonify({
            "sentiment": info["sentiment"],
            "emotion": info["emotion"],
            "confidence": round(info["emotion_conf"], 4),
            "top2": info["top2"],
            "confident": info["emotion_conf"] >= analyzer.conf_limit,
            "crisis": is_crisis(text),
        })

    @app.post("/chat")
    def chat_route():
        message, data, err = read_text("message")
        if err:
            return bad(err)
        session_id = data.get("session_id")
        if session_id is None:
            session_id = uuid.uuid4().hex
        elif not isinstance(session_id, str) or not SESSION_ID_RE.match(session_id):
            return bad('"session_id" must be 8-64 characters: letters, digits, _ or -')
        state = sessions.get(session_id)
        result = chat(message, state, analyzer.analyze, analyzer.conf_limit)
        result["session_id"] = session_id
        return jsonify(result)

    @app.post("/chat/reset")
    def reset_route():
        data = request.get_json(silent=True)
        sid = data.get("session_id") if isinstance(data, dict) else None
        if not isinstance(sid, str) or not SESSION_ID_RE.match(sid):
            return bad('"session_id" is required')
        sessions.delete(sid)
        return jsonify({"status": "reset"})

    @app.errorhandler(404)
    def not_found(_):
        return bad("not found", 404)

    @app.errorhandler(405)
    def wrong_method(_):
        return bad("method not allowed", 405)

    @app.errorhandler(413)
    def too_big(_):
        return bad("request body too large", 413)

    @app.errorhandler(500)
    def server_error(_):
        return bad("internal error", 500)  # message text is never logged or echoed

    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
