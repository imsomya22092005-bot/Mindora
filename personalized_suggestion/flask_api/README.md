# Mindora – Personalized Coping Suggestions API

## Overview

Mindora Personalized Coping Suggestions is a machine learning-based REST API that recommends coping activities based on a user's current mood and situation.

The API uses a trained Logistic Regression model to score and rank suitable activities, helping users discover personalized ways to manage everyday stress and emotions.

## Features

- Mood-based coping activity recommendations
- Considers mood intensity, energy level, and time of day
- Supports ranking and returning the top N recommendations
- Includes 66 coping activities
- Provides prediction scores for recommended activities
- REST API built using Flask
- Deployed on Render

## Tech Stack

- **Programming Language:** Python
- **Machine Learning:** Scikit-learn, Logistic Regression
- **Data Processing:** Pandas, NumPy
- **Model Serialization:** Joblib
- **Backend Framework:** Flask
- **Production Server:** Gunicorn
- **Deployment:** Render
- **Version Control:** Git and GitHub

## API Deployment

**Base URL:**  
https://mindora-1-2tup.onrender.com

### Health Check

**Endpoint:** `GET /health`

Check whether the API is running and the activities have loaded successfully.

Example response:

```json
{
  "activities": 66,
  "status": "ok",
  "threshold": 0.3
}
```

### Get Personalized Recommendations

**Endpoint:** `POST /recommend`

**Content-Type:** `application/json`

#### Request Body

```json
{
  "mood": "stress",
  "mood_intensity": 4,
  "energy_level": 3,
  "time_of_day": "evening",
  "top_n": 3
}
```

#### Input Parameters

| Parameter | Description |
|---|---|
| `mood` | User's current mood |
| `mood_intensity` | Intensity of the mood |
| `energy_level` | User's current energy level |
| `time_of_day` | Time of day |
| `top_n` | Number of recommendations requested |

Supported moods:

- `anxiety`
- `frustration`
- `loneliness`
- `low_energy`
- `overwhelmed`
- `restlessness`
- `sadness`
- `stress`

#### Example Response

The API returns a JSON response containing the recommended activities and the configured threshold. Each recommendation may include fields such as:

- `activity_id`
- `title`
- `category`
- `description`
- `duration_min`
- `predicted_helpful`
- `repeated_recently`
- `score`

The exact recommendations depend on the input and model predictions.

## Model Workflow

1. Receive the user's mood and context through the API.
2. Process the input into the format expected by the trained model.
3. Use the saved Logistic Regression pipeline to calculate helpfulness scores.
4. Rank activities according to the recommendation logic.
5. Return the requested recommendations as JSON.

The trained model is loaded from a saved `.pkl` file. It is not retrained for every API request.

## Run Locally

### 1. Clone the Repository

```bash
git clone -b ML https://github.com/imsomya22092005-bot/Mindora.git
```

### 2. Navigate to the API Directory

```bash
cd Mindora/personalized_suggestion/flask_api
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Start the API

```bash
python app.py
```

If the application is configured to run through Flask's development server, it will display the local address in the terminal. Use that address to test the API.

For production deployment, Gunicorn is used on Render.

## Deployment Configuration

The API is deployed on Render with the following configuration:

**Root Directory**
```text
personalized_suggestion/flask_api
```

**Build Command**
```bash
pip install -r requirements.txt
```

**Start Command**
```bash
gunicorn app:app --workers 1 --threads 4 --timeout 60
```

## Project Purpose

This API is a component of Mindora, designed to provide personalized coping activity suggestions based on user-provided emotional and contextual information.

It is intended to support emotional well-being and is not a substitute for professional mental health care.
