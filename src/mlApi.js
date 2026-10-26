import { apiRequest } from "./api";

// Additive helpers for the ML features. Existing API helpers remain untouched.
// Pass the same Mindora JWT used by the rest of the authenticated app.
export function analyzeEmotion(text, token) {
  return apiRequest("/api/ml/emotion/analyze", {
    method: "POST",
    token,
    body: JSON.stringify({ text }),
  });
}

export function sendWellnessChat(message, token, sessionId) {
  return apiRequest("/api/ml/emotion/chat", {
    method: "POST",
    token,
    body: JSON.stringify({
      message,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  });
}

export function resetWellnessChat(token, sessionId) {
  return apiRequest("/api/ml/emotion/reset", {
    method: "POST",
    token,
    body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
  });
}

export function getCopingProfile(token) {
  return apiRequest("/api/ml/coping/profile", { token });
}

export function saveCopingProfile(profile, token) {
  return apiRequest("/api/ml/coping/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(profile),
  });
}

export function getCopingRecommendations(checkIn, token) {
  return apiRequest("/api/ml/coping/recommend", {
    method: "POST",
    token,
    body: JSON.stringify(checkIn),
  });
}

export function sendCopingFeedback(feedback, token) {
  return apiRequest("/api/ml/coping/feedback", {
    method: "POST",
    token,
    body: JSON.stringify(feedback),
  });
}
