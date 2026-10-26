"""Model load karna aur activities ko score karna.

Logic notebook ke recommend_v2 function jaisa hi hai (Part 14 aur Part 15).
Fark sirf itna hai ki history yahan list ke form mein aati hai.
"""
import json
import logging
import os

import joblib
import numpy as np
import pandas as pd
import sklearn

log = logging.getLogger(__name__)

PROFILE_COLS = [
    "age_group", "experience_level", "pref_category_1",
    "pref_category_2", "max_duration_pref", "usual_energy",
]


class InputError(ValueError):
    """User ne galat input bheja (API 400 return karegi)."""


def _to_int(value, name):
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise InputError(f"{name} number hona chahiye")
    if number != int(number):
        raise InputError(f"{name} poora number hona chahiye")
    return int(number)


class Recommender:
    def __init__(self, model_dir):
        info_path = os.path.join(model_dir, "model_info.json")
        if not os.path.exists(info_path):
            raise FileNotFoundError(
                f"{info_path} nahi mila. Notebook ki 4 files (best_model_v2.pkl, "
                "model_info.json, activities.csv, users.csv) model/ folder mein rakho."
            )
        with open(info_path) as f:
            self.info = json.load(f)

        trained_with = self.info.get("sklearn_version")
        if trained_with and trained_with != sklearn.__version__:
            log.warning(
                "scikit-learn version alag hai: model %s mein bana, yahan %s hai. "
                "requirements.txt mein %s likho.", trained_with, sklearn.__version__, trained_with,
            )

        self.model = joblib.load(os.path.join(model_dir, self.info["model_file"]))
        self.acts = pd.read_csv(os.path.join(model_dir, self.info["activities_file"]))
        users_path = os.path.join(model_dir, self.info.get("users_file", "users.csv"))
        self.users = (
            pd.read_csv(users_path).set_index("user_id") if os.path.exists(users_path) else None
        )

        self.threshold = float(self.info["threshold"])
        self.prior = float(self.info["prior"])
        self.k = int(self.info["k_smoothing"])
        self.cat_cols = list(self.info["categorical_columns"])
        self.num_cols = list(self.info["numeric_columns"])
        allowed = self.info["allowed_values"]
        self.moods = list(allowed["mood"])
        self.times = list(allowed["time_of_day"])
        self.intensity_range = allowed["mood_intensity"]
        self.energy_range = allowed["energy_level"]
        self.act_category = self.acts.set_index("activity_id")["activity_category"].to_dict()
        self.default_profile = self._make_default_profile()
        log.info("Model ready: %d activities, threshold %.2f", len(self.acts), self.threshold)

    # ---------- profile ----------
    def _make_default_profile(self):
        """Naye user ke liye (jiska profile nahi hai) sabse common values."""
        if self.users is not None and len(self.users) > 0:
            u = self.users
            top_cats = u["pref_category_1"].value_counts().index.tolist()
            return {
                "age_group": u["age_group"].mode().iloc[0],
                "experience_level": "beginner" if "beginner" in set(u["experience_level"]) else u["experience_level"].mode().iloc[0],
                "pref_category_1": top_cats[0],
                "pref_category_2": top_cats[1] if len(top_cats) > 1 else top_cats[0],
                "max_duration_pref": int(u["max_duration_pref"].median()),
                "usual_energy": int(round(u["usual_energy"].median())),
            }
        cats = self.acts["activity_category"].value_counts().index.tolist()
        return {
            "age_group": "25-34", "experience_level": "beginner",
            "pref_category_1": cats[0], "pref_category_2": cats[min(1, len(cats) - 1)],
            "max_duration_pref": 10, "usual_energy": 3,
        }

    def resolve_profile(self, user_id=None, profile=None):
        result = dict(self.default_profile)
        if user_id and self.users is not None and user_id in self.users.index:
            row = self.users.loc[user_id]
            for col in PROFILE_COLS:
                result[col] = row[col]
        if profile:
            if not isinstance(profile, dict):
                raise InputError("profile object hona chahiye")
            for col in PROFILE_COLS:
                if profile.get(col) is not None:
                    result[col] = profile[col]
        result["max_duration_pref"] = _to_int(result["max_duration_pref"], "max_duration_pref")
        result["usual_energy"] = _to_int(result["usual_energy"], "usual_energy")
        return result

    # ---------- history ----------
    def clean_history(self, history):
        """History list: [{"activity_id": "A002", "helpful": 1}, ...] oldest pehle."""
        if history is None:
            return pd.DataFrame({"activity_id": [], "helpful": [], "activity_category": []})
        if not isinstance(history, list):
            raise InputError("history list honi chahiye")
        rows = []
        for item in history[-500:]:
            if not isinstance(item, dict):
                raise InputError("history ke har item mein activity_id aur helpful chahiye")
            act_id = item.get("activity_id")
            if act_id not in self.act_category:
                continue  # unknown activity ko ignore karte hain
            helpful = item.get("helpful", 0)
            rows.append({
                "activity_id": act_id,
                "helpful": 1 if helpful in (1, True, "1", "true", "True") else 0,
                "activity_category": self.act_category[act_id],
            })
        return pd.DataFrame(rows, columns=["activity_id", "helpful", "activity_category"])

    # ---------- main ----------
    def validate_state(self, mood, intensity, energy, time_of_day):
        if mood not in self.moods:
            raise InputError(f"mood in mein se ek hona chahiye: {self.moods}")
        if time_of_day not in self.times:
            raise InputError(f"time_of_day in mein se ek hona chahiye: {self.times}")
        intensity = _to_int(intensity, "mood_intensity")
        energy = _to_int(energy, "energy_level")
        if not self.intensity_range[0] <= intensity <= self.intensity_range[1]:
            raise InputError("mood_intensity 1 se 5 ke beech hona chahiye")
        if not self.energy_range[0] <= energy <= self.energy_range[1]:
            raise InputError("energy_level 1 se 5 ke beech hona chahiye")
        return intensity, energy

    def recommend(self, mood, intensity, energy, time_of_day,
                  user_id=None, profile=None, history=None, top_n=3):
        intensity, energy = self.validate_state(mood, intensity, energy, time_of_day)
        top_n = max(1, min(_to_int(top_n, "top_n"), 10))
        u = self.resolve_profile(user_id, profile)
        h = self.clean_history(history)

        user_rate = (h["helpful"].sum() + self.prior * self.k) / (len(h) + self.k)
        cat_stats = h.groupby("activity_category")["helpful"].agg(["sum", "count"])

        r = self.acts.copy()
        r["mood"] = mood
        r["mood_intensity"] = intensity
        r["energy_level"] = energy
        r["time_of_day"] = time_of_day
        for c in PROFILE_COLS:
            r[c] = u[c]

        r["mood_is_main"] = (r["target_moods"].str.split(";").str[0] == mood).astype(int)
        r["mood_is_target"] = r["target_moods"].apply(lambda t: int(mood in t.split(";")))
        r["cat_is_pref"] = np.where(
            r["activity_category"] == u["pref_category_1"], 2,
            np.where(r["activity_category"] == u["pref_category_2"], 1, 0),
        )
        r["too_long"] = (r["duration_min"] > u["max_duration_pref"]).astype(int)
        r["heavy_on_low_energy"] = ((energy <= 2) & (r["energy_required"] >= 2)).astype(int)
        r["beginner_hard"] = ((u["experience_level"] == "beginner") & (r["difficulty"] >= 2)).astype(int)
        r["user_past_count"] = len(h)
        r["user_past_rate"] = user_rate

        cat_rates = []
        for c in r["activity_category"]:
            if c in cat_stats.index:
                s, n = cat_stats.loc[c, "sum"], cat_stats.loc[c, "count"]
            else:
                s, n = 0, 0
            cat_rates.append((s + self.prior * self.k) / (n + self.k))
        r["user_cat_past_rate"] = cat_rates

        r["repeated_recently"] = r["activity_id"].isin(h.tail(3)["activity_id"]).astype(int)
        r["time_x_category"] = time_of_day + "_" + r["activity_category"]
        r["intensity_x_category"] = str(int(intensity >= 4)) + "_" + r["activity_category"]

        r["score"] = self.model.predict_proba(r[self.cat_cols + self.num_cols])[:, 1].round(5)
        r = r.sort_values("score", ascending=False).head(top_n)
        return [
            {
                "activity_id": row.activity_id,
                "title": row.activity_title,
                "category": row.activity_category,
                "description": getattr(row, "activity_description", ""),
                "duration_min": int(row.duration_min),
                "score": float(row.score),
                "predicted_helpful": bool(row.score >= self.threshold),
                "repeated_recently": bool(row.repeated_recently),
            }
            for row in r.itertuples()
        ]
