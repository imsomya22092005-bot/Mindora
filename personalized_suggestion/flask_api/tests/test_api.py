"""Local test (internet ki zaroorat nahi).

Chalane ke liye (flask_api folder ke andar se):
    python -m unittest tests.test_api -v
"""
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.pop("API_SECRET", None)

import app as api  # noqa: E402


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = api.app.test_client()

    def test_health(self):
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["status"], "ok")

    def test_recommend_returns_top3_sorted(self):
        r = self.client.post("/recommend", json={"mood": "stress", "mood_intensity": 4, "energy_level": 3, "time_of_day": "evening"})
        self.assertEqual(r.status_code, 200)
        recs = r.get_json()["recommendations"]
        self.assertEqual(len(recs), 3)
        scores = [x["score"] for x in recs]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_recommend_bad_input(self):
        for body in [{}, {"mood": "happy"}, {"mood": "stress", "mood_intensity": 9},
                     {"mood": "stress", "time_of_day": "noon"}, {"mood": "stress", "energy_level": "abc"}]:
            r = self.client.post("/recommend", json=body)
            self.assertEqual(r.status_code, 400, body)

    def test_history_changes_repeat_flag(self):
        base = {"mood": "stress", "mood_intensity": 4, "energy_level": 3, "time_of_day": "evening", "top_n": 10}
        first = self.client.post("/recommend", json=base).get_json()["recommendations"][0]["activity_id"]
        again = self.client.post("/recommend", json={**base, "history": [{"activity_id": first, "helpful": 0}]})
        flagged = [x for x in again.get_json()["recommendations"] if x["activity_id"] == first][0]
        self.assertTrue(flagged["repeated_recently"])

    def test_api_secret(self):
        with patch.object(api, "API_SECRET", "abc123"):
            self.assertEqual(self.client.post("/recommend", json={"mood": "stress"}).status_code, 401)
            ok = self.client.post("/recommend", json={"mood": "stress"}, headers={"X-API-Key": "abc123"})
            self.assertEqual(ok.status_code, 200)
            self.assertEqual(self.client.get("/health").status_code, 200)


if __name__ == "__main__":
    unittest.main()
