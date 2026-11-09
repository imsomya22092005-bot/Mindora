"""Quick checks that run without starting a server:  python test_api.py"""
import json
from pathlib import Path

from app import app, FEATURES

client = app.test_client()
example = json.loads((Path(__file__).parent / "example_request.json").read_text())
example = {k: v for k, v in example.items() if k in FEATURES}
checks = []


def check(name, condition):
    checks.append(condition)
    print(("PASS  " if condition else "FAIL  ") + name)


r = client.get("/health")
check("GET /health returns ok", r.status_code == 200 and r.get_json()["status"] == "ok")

r = client.get("/api/features")
check("GET /api/features lists every model feature", r.status_code == 200 and r.get_json()["count"] == len(FEATURES))

r = client.post("/api/predict", json=example)
body = r.get_json()
check("POST /api/predict works", r.status_code == 200)
check("response has the agreed keys",
      set(body) == {"level", "level_code", "factors", "message", "disclaimer", "support_suggested"})
check("level is low, moderate or high", body["level"] in ("low", "moderate", "high"))
check("message says 'associated with' and never 'diagnosis' as a claim",
      "associated with" in body["message"] and "not a diagnosis" in body["disclaimer"])
check("answers are not cached", r.headers.get("Cache-Control") == "no-store")
print("      example result:", body["level"], "|", body["factors"])

as_text = {k: str(v) for k, v in example.items()}
r = client.post("/api/predict", json=as_text)
check("numbers sent as text (HTML forms) are accepted", r.status_code == 200 and r.get_json()["level"] == body["level"])

r = client.post("/api/predict", json={k: v for k, v in example.items() if k != "study_load"})
check("missing field -> 400 missing_fields", r.status_code == 400 and r.get_json()["error"] == "missing_fields")

r = client.post("/api/predict", json={**example, "study_load": 9})
check("out of range -> 400 invalid_input", r.status_code == 400 and "study_load" in r.get_json()["details"])

r = client.post("/api/predict", json={**example, "sleep_quality": "abc"})
check("not a number -> 400", r.status_code == 400 and "sleep_quality" in r.get_json()["details"])

r = client.post("/api/predict", json={**example, "sleep_quality": 2.5})
check("decimal -> 400", r.status_code == 400)

r = client.post("/api/predict", data="not json", content_type="text/plain")
check("not JSON -> 400 invalid_json", r.status_code == 400 and r.get_json()["error"] == "invalid_json")

r = client.get("/api/predict")
check("GET on /api/predict -> 405 JSON", r.status_code == 405 and r.get_json()["error"] == "method_not_allowed")

r = client.get("/nope")
check("unknown route -> 404 JSON", r.status_code == 404 and r.get_json()["error"] == "not_found")

r = client.post("/api/predict", data="x" * 20000, content_type="application/json")
check("huge body -> 413", r.status_code == 413)

r = client.options("/api/predict", headers={"Origin": "https://example.com"})
check("CORS preflight allowed", r.status_code == 204 and "Access-Control-Allow-Origin" in r.headers)

print("\n" + ("ALL CHECKS PASSED" if all(checks) else "SOME CHECKS FAILED"), f"({sum(checks)}/{len(checks)})")
raise SystemExit(0 if all(checks) else 1)
