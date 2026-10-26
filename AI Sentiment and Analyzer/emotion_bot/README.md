# Wellness Chat Bot (chhota model + Gemini)

Model: 880 MB -> ~35 MB. Chatbot: rule-based -> Gemini.

## Step 1: Model chhota karo (Colab, ek baar, ~15-25 min)
1. Colab kholo, Runtime > Change runtime type > **T4 GPU**.
2. Ye cells chalao:
   ```python
   from google.colab import drive; drive.mount('/content/drive')
   from google.colab import files; files.upload()      # goemotions_combined.csv + compress_model.py
   !pip install -q onnx onnxscript onnxruntime
   !python compress_model.py
   ```
   (Drive me `emotion_analyzer/sentiment` aur `emotion` folders pehle se hone chahiye, jo main.ipynb ne save kiye the.)
3. End me result table + size print hoga. Drive me `emotion_analyzer/deploy_model/` folder ban jaayega.
4. Us folder ki 4 files (`model_int8.onnx, tokenizer.json, labels.json, settings.json`) is project ke `model/` folder me daalo.

## Step 2: Gemini API key
https://aistudio.google.com/apikey se key banao. **Key ko kabhi code ya GitHub me mat daalna.**

## Step 3: Local test
```bash
pip install -r requirements.txt
cp .streamlit/secrets.toml.example .streamlit/secrets.toml   # key paste karo
streamlit run app.py
```

## Step 4: Deploy (Streamlit Community Cloud)
1. Poora folder GitHub repo me push karo (model ~35 MB hai, GitHub ki 100 MB limit ke andar, LFS nahi chahiye).
   `.gitignore` secrets.toml ko bachata hai.
2. share.streamlit.io > New app > repo chuno > main file `app.py`.
3. Advanced settings > Secrets me: `GEMINI_API_KEY = "your-key"`.

## Gemini model naam
Default `gemini-flash-latest` (fallback `gemini-2.5-flash`). Error aaye to env/secret me `GEMINI_MODEL` set karo.

## Safety
Self-harm wale words par bot Gemini ko call kiye bina fixed helpline reply deta hai (`chatbot.py` me `CRISIS_PATTERNS`).

---

# Flask API (api.py)

Streamlit ki jagah (ya saath me) REST API. Model + Gemini wahi hain.

```bash
pip install -r requirements-api.txt
export GEMINI_API_KEY="your-key"
export API_TOKEN="koi-lamba-secret"          # optional, lagane ki salah hai
export CORS_ORIGINS="https://tumhari-site.com"   # browser frontend ho to
python api.py                                 # dev, port 8000
# production / Render / Railway / Heroku:  Procfile me gunicorn already hai
```
**Zaroori:** gunicorn me `--workers 1` hi rakho (chat sessions memory me hain, 30 min baad hat jaate hain).

| Endpoint | Body | Response |
|---|---|---|
| `GET /health` | - | `{"status":"ok"}` |
| `POST /chat` | `{"message":"I feel low","session_id":"optional"}` | `session_id, reply, crisis, error, emotion{emotion,sentiment,confidence,top2,confident,source}` |
| `POST /analyze` | `{"text":"..."}` | `emotion, sentiment, confidence, top2` (Gemini ke bina) |
| `POST /reset` | `{"session_id":"..."}` | `{"status":"reset"}` |

Pehle `/chat` ke response me `session_id` aata hai, agle messages me wahi bhejo taaki bot ko context yaad rahe.
Header `X-API-Key: <API_TOKEN>` har call me (agar token set kiya).

```bash
curl -X POST localhost:8000/chat -H "Content-Type: application/json" -H "X-API-Key: secret" \
     -d '{"message":"I am stressed about exams"}'
```
Errors: 400 galat input, 401 token galat, 429 rate limit (30/min per IP), `"error": true` ka matlab Gemini fail hua aur fallback reply gaya.
