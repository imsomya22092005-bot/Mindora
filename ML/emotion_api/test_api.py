"""Tests that run WITHOUT the models (a fake analyzer is used). Run: python test_api.py"""
import random

from app import create_app


class FakeAnalyzer:
    conf_limit = 0.5

    def analyze(self, text):
        t = text.lower()
        if "meh" in t:
            return {"sentiment": "neutral", "emotion": "neutral", "emotion_conf": 0.1, "top2": ["neutral", "sadness"]}
        for kw, emo, sent in [("sad", "sadness", "negative"), ("tired", "sadness", "negative"),
                              ("happy", "joy", "positive"), ("why", "curiosity", "ambiguous")]:
            if kw in t:
                return {"sentiment": sent, "emotion": emo, "emotion_conf": 0.9, "top2": [emo, "neutral"]}
        return {"sentiment": "neutral", "emotion": "neutral", "emotion_conf": 0.8, "top2": ["neutral", "joy"]}


random.seed(1)
app = create_app(FakeAnalyzer())
c = app.test_client()

# health
assert c.get("/health").get_json() == {"status": "ok"}

# analyze: normal
r = c.post("/analyze", json={"text": "I feel so sad"})
body = r.get_json()
assert r.status_code == 200 and body["emotion"] == "sadness" and body["crisis"] is False and body["confident"] is True
assert set(body) == {"sentiment", "emotion", "confidence", "top2", "confident", "crisis"}

# analyze: crisis flag
assert c.post("/analyze", json={"text": "I want to die"}).get_json()["crisis"] is True
assert c.post("/analyze", json={"text": "I'm dying to see this movie"}).get_json()["crisis"] is False

# analyze: bad inputs
for payload in [{}, {"text": ""}, {"text": "   "}, {"text": 123}, {"text": "x" * 1001}]:
    r = c.post("/analyze", json=payload)
    assert r.status_code == 400 and "error" in r.get_json(), payload
assert c.post("/analyze", data="not json", content_type="text/plain").status_code == 400
assert c.post("/analyze", data="x" * 20000, content_type="application/json").status_code == 413
assert c.get("/analyze").status_code == 405
assert c.get("/nothing").status_code == 404

# chat: new session id is created, then reused
r = c.post("/chat", json={"message": "I feel sad"})
j = r.get_json()
assert r.status_code == 200 and j["crisis"] is False and j["analysis"]["emotion"] == "sadness" and j["reply"]
sid = j["session_id"]

# chat: context (3 negative messages in a row -> help nudge)
c.post("/chat", json={"session_id": sid, "message": "so tired of everything"})
j = c.post("/chat", json={"session_id": sid, "message": "I am sad again"}).get_json()
assert "Tele-MANAS" in j["reply"], j["reply"]

# chat: no repeated reply for same input
replies = {c.post("/chat", json={"session_id": "abcdefgh1", "message": "I am sad"}).get_json()["reply"][:40] for _ in range(4)}
assert len(replies) >= 3, replies

# chat: low confidence falls back to sentiment, still gives a reply
j = c.post("/chat", json={"session_id": "abcdefgh2", "message": "meh"}).get_json()
assert j["analysis"]["confident"] is False and j["reply"]

# chat: crisis overrides the model, shows help numbers, no analysis
j = c.post("/chat", json={"session_id": "abcdefgh3", "message": "mujhe marna hai"}).get_json()
assert j["crisis"] is True and j["analysis"] is None and "14416" in j["reply"] and "112" in j["reply"]
j = c.post("/chat", json={"session_id": "abcdefgh3", "message": "I am happy"}).get_json()
assert j["reply"].startswith("I'm still here with you.") and "14416" in j["reply"]

# chat: FAQ / small talk answered without the model
j = c.post("/chat", json={"session_id": "abcdefgh4", "message": "how are you"}).get_json()
assert j["intent"] == "how_are_you" and j["analysis"] is None and j["crisis"] is False and j["reply"]
j = c.post("/chat", json={"session_id": "abcdefgh4", "message": "what is anxiety"}).get_json()
assert j["intent"] == "define_anxiety"

# chat: our rules (achievement / failure / second place)
j = c.post("/chat", json={"session_id": "abcdefgh5", "message": "i topped in my exams"}).get_json()
assert j["group"] == "proud"
j = c.post("/chat", json={"session_id": "abcdefgh5", "message": "but i don't topped 1 st position"}).get_json()
assert j["group"] == "disappointed"
j = c.post("/chat", json={"session_id": "abcdefgh5", "message": "i am 2nd topper"}).get_json()
assert j["group"] == "silver"

# chat: more FAQs and the extra support groups
j = c.post("/chat", json={"session_id": "abcdefgh6", "message": "tell me a joke"}).get_json()
assert j["intent"] == "joke"
j = c.post("/chat", json={"session_id": "abcdefgh6", "message": "i need a counsellor"}).get_json()
assert j["intent"] == "find_help" and "14416" in j["reply"]
j = c.post("/chat", json={"session_id": "abcdefgh6", "message": "i feel like a failure"}).get_json()
assert j["group"] == "selfcritic" and "14416" in j["reply"]
j = c.post("/chat", json={"session_id": "abcdefgh6", "message": "i am so overwhelmed"}).get_json()
assert j["group"] == "overwhelmed" and "14416" in j["reply"]

# chat: Hinglish (keyword rules, the model is not used for it)
j = c.post("/chat", json={"session_id": "abcdefgh7", "message": "aaj mein happy hu"}).get_json()
assert j["group"] == "happy" and j["analysis"]["source"] == "hinglish_rules"
j = c.post("/chat", json={"session_id": "abcdefgh7", "message": "par mujhe dar lag rha hai"}).get_json()
assert j["group"] == "mixed"
j = c.post("/chat", json={"session_id": "abcdefgh7", "message": "kyuki manne horror movie dekhi"}).get_json()
assert "shukriya" in j["reply"].lower()
j = c.post("/chat", json={"session_id": "abcdefgh8", "message": "neend nahi aa rahi"}).get_json()
assert j["intent"] == "sleep_tips"
j = c.post("/chat", json={"session_id": "abcdefgh8", "message": "my dad passed away"}).get_json()
assert j["group"] in ("low", "neutral") and "proud" not in str(j["group"])

# chat: validation
assert c.post("/chat", json={"message": ""}).status_code == 400
assert c.post("/chat", json={"message": "hi", "session_id": "bad id!"}).status_code == 400
assert c.post("/chat", json={"message": "hi", "session_id": 5}).status_code == 400

# reset
assert c.post("/chat/reset", json={"session_id": sid}).get_json() == {"status": "reset"}
assert c.post("/chat/reset", json={}).status_code == 400

# sessions are separate
a = c.post("/chat", json={"session_id": "userAAAAA", "message": "I am sad"}).get_json()["reply"]
b = c.post("/chat", json={"session_id": "userBBBBB", "message": "I am happy"}).get_json()["reply"]
assert a != b

# session limit and expiry
small = create_app(FakeAnalyzer(), session_ttl=1800, max_sessions=2).test_client()
for i in range(5):
    assert small.post("/chat", json={"session_id": "session%02d" % i, "message": "hi"}).status_code == 200
expiring = create_app(FakeAnalyzer(), session_ttl=-1).test_client()
assert expiring.post("/chat", json={"session_id": "expire001", "message": "hi"}).status_code == 200

# CORS header only when ALLOWED_ORIGIN is set
import os
os.environ["ALLOWED_ORIGIN"] = "https://example.com"
assert create_app(FakeAnalyzer()).test_client().get("/health").headers["Access-Control-Allow-Origin"] == "https://example.com"
del os.environ["ALLOWED_ORIGIN"]
assert "Access-Control-Allow-Origin" not in create_app(FakeAnalyzer()).test_client().get("/health").headers

print("ALL TESTS PASSED")
