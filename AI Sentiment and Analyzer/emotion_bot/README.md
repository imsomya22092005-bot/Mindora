# Mindora — AI Emotion and Sentiment Analyzer

## Overview

Mindora is a Flask-based REST API that analyzes text to identify the emotion and sentiment expressed by a user. It also provides a chat endpoint that can return a response based on the user's message.

The project uses an ONNX model for emotion classification and exposes endpoints for emotion analysis, chat interaction, session reset, and service health monitoring.

## Features

- Emotion classification from text.
- Sentiment identification, such as positive or negative.
- Confidence score and top predicted emotions.
- Chat endpoint for message-based interaction.
- Session reset functionality.
- Health-check endpoint for deployment monitoring.
- REST API integration for frontend and backend applications.

## Technology Stack

- **Python** — application logic.
- **Flask** — REST API framework.
- **ONNX Runtime** — emotion model inference.
- **Gunicorn** — production WSGI server.
- **Render** — API hosting.
- **Git and GitHub** — version control and source code management.

## Project Structure

```text
emotion_bot/
├── api.py
├── app.py
├── chatbot.py
├── compress_model.py
├── emotion_onnx.py
├── model/
│   ├── labels.json
│   ├── model_int8.onnx
│   ├── settings.json
│   └── tokenizer.json
├── requirements-api.txt
├── requirements.txt
├── Procfile
└── README.md
```

## API Endpoints

Base URL: `https://mindora-82go.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks whether the API is running. |
| POST | `/analyze` | Analyzes text for emotion and sentiment. |
| POST | `/chat` | Processes a chat message and returns a response. |
| POST | `/reset` | Resets a chat session. |

### 1. Health Check

**Request**

```http
GET /health
```

**Example response**

```json
{
  "status": "ok"
}
```

### 2. Emotion and Sentiment Analysis

**Request**

```http
POST /analyze
Content-Type: application/json
```

**Example request body**

```json
{
  "text": "I feel happy and excited today."
}
```

**Example response**

```json
{
  "confidence": 0.7464,
  "emotion": "joy",
  "sentiment": "positive",
  "top2": [
    "joy",
    "excitement"
  ]
}
```

The output values depend on the input text and model prediction.

### 3. Chat

**Request**

```http
POST /chat
Content-Type: application/json
```

**Example request body**

```json
{
  "message": "Hello, how are you?"
}
```

The endpoint processes the message and returns a response along with the available emotion information and session identifier. The exact response fields depend on the current API implementation.

### 4. Reset Chat Session

**Request**

```http
POST /reset
Content-Type: application/json
```

**Example request body**

```json
{
  "session_id": "SESSION_ID_RETURNED_BY_CHAT"
}
```

Replace the placeholder with the actual session ID returned by the chat endpoint.

## Running Locally

### Prerequisites

- Python installed.
- Git installed.
- Project source code downloaded or cloned.

### Setup

1. Open a terminal in the `emotion_bot` directory.
2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the environment on Windows:

```bash
venv\Scripts\activate
```

4. Install the API dependencies:

```bash
pip install -r requirements-api.txt
```

5. Start the API:

```bash
python api.py
```

The local address and port depend on the Flask application configuration.

For production deployment, the application uses Gunicorn as configured in the deployment settings.

## Deployment

The API is hosted on Render.

**Build command**

```bash
pip install -r requirements-api.txt
```

**Start command**

```bash
gunicorn api:app --workers 1 --threads 8 --timeout 120
```

The deployed service can be checked using the `/health` endpoint.

## Integration

Applications can integrate with Mindora by sending HTTP requests to the deployed API.

For POST requests, use:

```http
Content-Type: application/json
```

The API can be integrated with a frontend or another backend without requiring the emotion model to run in the client application.

## Notes

- The emotion and sentiment outputs are model predictions and may not always be correct.
- Keep API credentials in environment variables; never commit secret keys to the repository.
- Verify the chat provider and its configuration against the current implementation before deployment.
- Update this documentation whenever endpoints, response formats, dependencies, or deployment settings change.

## Source Code

Repository: https://github.com/imsomya22092005-bot/Mindora

