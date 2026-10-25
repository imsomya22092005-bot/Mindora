# Emotion & Sentiment Analyzer API (+ supportive chatbot)

A small Flask API. It predicts **sentiment** (4 classes) and **emotion** (28 classes) for English text,
and has a rule-based supportive chatbot built on top. No LLM and no external API is used.

## Folder layout

```
emotion_api/
  app.py               Flask API
  analyzer.py          loads the 2 saved models and predicts
  chatbot.py           chatbot rules, replies, safety check (no ML libraries needed)
  organize_models.py   fixes the model folder layout if files were downloaded one by one
  test_api.py          tests (run without the models)
  requirements.txt
  models/              <- you must add this (see below)
    settings.json
    sentiment/   config.json  labels.json  model.safetensors  tokenizer.json  tokenizer_config.json
    emotion/     config.json  labels.json  model.safetensors  tokenizer.json  tokenizer_config.json
```

## Model files

The models are large (about 830 MB total), so they are NOT inside this zip.
They come as a folder called `emotion_analyzer` (shared separately). Copy it here and rename it to `models`.

If the files were downloaded one by one, their names get mixed up (`model_1.safetensors`, `labels_1.json`, ...).
Do NOT rename by hand. Put all downloaded files in one folder and run:

```
python organize_models.py <folder_with_downloaded_files> models
```

It reads inside the files to decide which belongs to sentiment (4 outputs) and which to emotion (28 outputs).
On startup the API also checks that every model matches its labels file and stops with a clear error if not.

## Run

```
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python test_api.py                                   # should print: ALL TESTS PASSED
python app.py                                        # http://localhost:8000
```

Production (use ONE worker, because chat sessions are kept in memory and the models are loaded once):

```
gunicorn -w 1 --threads 4 -b 0.0.0.0:8000 "app:create_app()"
```

Environment variables: `MODEL_DIR` (default `models`), `PORT` (default 8000),
`ALLOWED_ORIGIN` (frontend URL for CORS, e.g. `https://myapp.com`; if not set, no CORS headers are sent).

`transformers` is pinned to the version used for training/saving (5.20.2). Keep it the same.

## Endpoints

All requests and responses are JSON. Text must be **English**, 1 to 1000 characters.

### GET /health
`{"status": "ok"}`

### POST /analyze
Request: `{"text": "I feel really sad and alone right now."}`

Response:
```json
{
  "sentiment": "negative",
  "emotion": "sadness",
  "confidence": 0.8123,
  "top2": ["sadness", "grief"],
  "confident": true,
  "crisis": false
}
```
- `confidence`: how sure the emotion model is (0 to 1).
- `confident`: `true` if `confidence` is above the limit chosen during validation (stored in `settings.json`).
  When `false`, treat the emotion as uncertain (show `top2`, or say "not sure").
- `crisis`: `true` if the text contains self-harm / suicide keywords. Show help numbers instead of normal output.

### POST /chat
Request: `{"session_id": "user-1234abcd", "message": "I feel so low today"}`

`session_id` is optional (8 to 64 characters: letters, digits, `_`, `-`). If missing, the server creates one
and returns it. Send the same id on every message of one conversation.

Response:
```json
{
  "session_id": "user-1234abcd",
  "reply": "I'm sorry you're feeling this way. I'm here and listening. Do you want to tell me what happened?",
  "analysis": {"sentiment": "negative", "emotion": "sadness", "confidence": 0.81, "top2": ["sadness", "grief"], "confident": true, "source": "model"},
  "crisis": false,
  "intent": null,
  "group": "low"
}
```
- `analysis.source`: `"model"` (English text), `"hinglish_rules"` (Hinglish keyword rules) or `"fallback"` (Hinglish message with no known keyword, treated as neutral).
- `intent`: set (e.g. `"greeting"`, `"how_are_you"`, `"exam_tips"`) when the message was a FAQ / small-talk question. Then `analysis` is `null`.
- `group`: the reply type used (`low`, `anxious`, `angry`, `happy`, `curious`, `neutral`, `proud`, `disappointed`, `silver`, `mixed`, `selfcritic`, `overwhelmed`). Useful for debugging or styling.

If `crisis` is `true`, `reply` contains the help numbers (Tele-MANAS 14416 / 1-800-891-4416, emergency 112) and
`analysis` is `null`. The frontend should show this reply clearly and not hide or replace it.

### POST /chat/reset
Request: `{"session_id": "user-1234abcd"}` -> `{"status": "reset"}`

### Errors
`{"error": "..."}` with status 400 (bad input), 404, 405, 413 (body too large) or 500.

Example:
```
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" \
     -d '{"session_id":"user-1234abcd","message":"I am so happy today!"}'
```

## How the chatbot decides (short)

1. Safety keyword check runs first, before any model. A match returns the crisis reply.
2. FAQ / small talk (greetings, "how are you", "what is stress", exam and sleep tips, "what should I do"...) is answered by rules.
3. Otherwise the models predict emotion. If emotion confidence is low, the sentiment is used instead.
4. Rules can override the model for achievement ("I topped"), failure ("I failed", "I didn't get the job"),
   2nd/3rd place, and mixed feelings ("but I am sad also" after a happy message).
5. The reply is built from a short acknowledgement + a gentle question (+ a topic line for exams, work, family...),
   never repeating one until all options were used. Short follow-ups ("ok i see") continue the previous topic.
6. After 3 negative messages in a row, a gentle suggestion to talk to someone / call Tele-MANAS is added.

## Privacy

Message text is not written to logs and not stored. Only the last 10 (sentiment, emotion) pairs per session are
kept in memory, and sessions expire after 30 minutes of inactivity. If you add logging or a database, keep
message text out of it unless users have agreed.

## Things the backend team should decide / add

- HTTPS, authentication and rate limiting (not included).
- Sessions are in memory: they are lost on restart and do not work across several workers. For several servers,
  move them to Redis or a database.
- Hardware: both models are loaded in memory (roughly 1.5 to 2 GB RAM expected, not measured). Speed per message
  was not measured; test on your server. A GPU is used automatically if available.

## Known limits (please keep these in the app's text)

- The ML models understand **English only**. Roman-script Hinglish is handled by a keyword list and Hinglish replies (rule-based, limited: it only knows the words in `chatbot.py`). Hindi in Devanagari script and other languages are not supported. Hinglish messages without a known keyword get a neutral "tell me more" reply.
- The safety keyword list is short and not complete. It must be reviewed by a counsellor or similar. It does not replace human support.
- The emotion model is about 55% accurate on 28 emotions (test data); sentiment about 72%. It can be wrong,
  especially for rare emotions like grief or relief. The bot is a support tool, not a therapist and not a diagnosis.
