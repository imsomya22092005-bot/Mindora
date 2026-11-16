# Mindora

**Mindora** is a student wellbeing companion designed to help users pause, reflect on their mood, explore mindful activities, and understand self-reported wellbeing patterns.

> Mindora is an educational wellbeing project. Its check-ins and model outputs are not medical diagnoses or a replacement for professional care.

## Main features

- **Daily mood check-in** with mood-aware themes and a Default theme option.
- **Your Space:** personal journal, Little Notes scrapbook wall, and mood insights.
- **Wellbeing Check-in:** PHQ-9 and GAD-7 self-screening flow with a safety-support message when needed.
- **SleepSync:** sleep reflection using 7 ISI items, 4 PSS items, and profile inputs.
- **Academic Stress Predictor:** 16 lifestyle and academic-environment inputs.
- **Mindora Wellbeing Studio:** emotion companion chat and coping recommendations.
- **Mindful Moments:** Calm Corner, Inner Garden, Little Comfort Box, and Mood Soundscape.
- **Play & Unwind:** Color Pop, Starweave, Let It Burn, Picture Puzzle, and Fruit Merge.
- **Account access:** email OTP, Google sign-in (when configured), and guest access.

## Tech stack

- React 19
- Vite 8
- React Router
- Recharts
- Lucide React
- Backend REST API and separate ML services

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Environment variables

The frontend accepts these Vite environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Optional override for the Mindora backend. If omitted, production uses the configured Mindora Render backend and local development uses `http://localhost:5000`. |
| `VITE_GOOGLE_CLIENT_ID` | Optional Google Identity Services client ID. Google sign-in is unavailable until this is configured. |

Do not commit private keys, OAuth client secrets, or other credentials to this repository.

## Deployment

The frontend is configured for Vercel. The `vercel.json` file includes SPA routing and same-origin proxy rewrites for the emotion and coping ML services. The main API base URL can be overridden with `VITE_API_URL`.

## Data and privacy notes

Mood history, journal pages, Little Notes, scrapbook layouts/photos, and several wellness activities are stored in the browser on the current device. They are not automatically synchronized across devices by the frontend. The profile page currently displays the account details saved locally after sign-in.

Avoid entering highly sensitive personal information into a student project. Use the wellbeing tools as reflective aids, not as clinical assessments.
