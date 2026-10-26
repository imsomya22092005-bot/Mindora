# Coping Suggestions API (Flask)

User ka mood, energy waghera bhejo, ML model top activities wapas deta hai. Gemini ki zaroorat nahi (neeche "Gemini kab" dekho).

## Chalane ke steps
1. `pip install -r requirements.txt` (Python 3.11+)
2. `python app.py` -> `http://localhost:5000`
3. Test: `python -m unittest tests.test_api -v`

`model/` folder mein model ki 4 files already hain (notebook Part 17 se). Notebook dobara run karo toh nayi files yahan replace kar do.

## Endpoints
| Method | Path | Kaam |
|---|---|---|
| GET | `/health` | status |
| POST | `/recommend` | top activities |

### Input format (backend developer ke liye)
| Field | Type | Zaroori? | Matlab |
|---|---|---|---|
| `mood` | string | haan | `anxiety, frustration, loneliness, low_energy, overwhelmed, restlessness, sadness, stress` |
| `mood_intensity` | 1 se 5 | nahi (default 3) | feeling kitni strong hai |
| `energy_level` | 1 se 5 | nahi (default 3) | 1 = bahut thaka hua |
| `time_of_day` | string | nahi | `morning, afternoon, evening, night` (nahi bheja toh server ka time) |
| `user_id` | string | nahi | `users.csv` mein hai toh profile wahan se aata hai |
| `profile` | object | nahi | naye user ke liye: `age_group, experience_level, pref_category_1, pref_category_2, max_duration_pref, usual_energy` |
| `history` | list | nahi | purani activities, **purani pehle**: `[{"activity_id": "A002", "helpful": 1}]` |
| `top_n` | number | nahi (default 3) | 1 se 10 |

API stateless hai (apna database nahi). Feedback se suggestions badalne ke liye har request mein user ki `history` bhejni hai. `helpful = 1` ka matlab activity complete hui aur rating 4 ya usse zyada.

```bash
curl -X POST http://localhost:5000/recommend -H "Content-Type: application/json" \
  -d '{"mood": "stress", "mood_intensity": 4, "energy_level": 3, "time_of_day": "evening",
       "history": [{"activity_id": "A002", "helpful": 1}]}'
```
Response mein har activity ke saath: `activity_id, title, category, description, duration_min, score, predicted_helpful, repeated_recently`. `score` helpful hone ki probability hai, `predicted_helpful` = score 0.30 ya usse zyada.

## Deploy (Render jaisi service)
Build: `pip install -r requirements.txt`, Start: `gunicorn app:app --workers 1 --threads 4 --timeout 60` (`Procfile` mein likha hai). Deploy ke baad `/health` kholke check karo. Public deploy par `API_SECRET` set karna.

## Gemini kab chahiye?
Abhi nahi. Model ko mood app ke buttons/sliders se mil jaata hai. Gemini tabhi jodna jab user free text likhe ("aaj bahut stress hai") aur mood us text se nikalna ho.

## Dhyan rakho
- `scikit-learn` ka version `model_info.json` ke `sklearn_version` jaisa hi rakho.
- `time_of_day` app se bhejna behtar hai (nahi bheja toh: morning 5-12, afternoon 12-17, evening 17-21, baaki night).
