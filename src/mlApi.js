import { apiRequest } from "./api";

// Deployed ML services. These fallbacks keep the AI features usable if the
// current Mindora backend deployment has not yet picked up /api/ml routes.
const EMOTION_SERVICE_URL = "/ml-proxy/emotion";
const COPING_SERVICE_URL = "/ml-proxy/coping";

async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {}),
    });
  } catch {
    throw new Error("Could not connect to the AI service. Please try again in a moment.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `AI service request failed (${response.status}).`);
  }
  if (data.error === true) {
    throw new Error(data.message || "The AI service could not complete this request.");
  }
  return data;
}

function isMissingMlRoute(error) {
  const message = String(error?.message || "");
  return message.includes("Not Found - /api/ml/") ||
    message.includes("Request failed (404)") ||
    message.includes("Cannot POST /api/ml/");
}

async function withDirectFallback(backendRequest, directRequest) {
  try {
    return await backendRequest();
  } catch (error) {
    if (!isMissingMlRoute(error)) throw error;
    return directRequest();
  }
}

export function analyzeEmotion(text, token) {
  return withDirectFallback(
    () => apiRequest("/api/ml/emotion/analyze", {
      method: "POST",
      token,
      body: JSON.stringify({ text }),
    }),
    () => postJson(`${EMOTION_SERVICE_URL}/analyze`, { text })
  );
}

export function sendWellnessChat(message, token, sessionId) {
  const body = { message, ...(sessionId ? { session_id: sessionId } : {}) };
  return withDirectFallback(
    () => apiRequest("/api/ml/emotion/chat", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
    () => postJson(`${EMOTION_SERVICE_URL}/chat`, body)
  );
}

export function resetWellnessChat(token, sessionId) {
  const body = sessionId ? { session_id: sessionId } : {};
  return withDirectFallback(
    () => apiRequest("/api/ml/emotion/reset", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
    () => postJson(`${EMOTION_SERVICE_URL}/reset`, body)
  );
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
  return withDirectFallback(
    () => apiRequest("/api/ml/coping/recommend", {
      method: "POST",
      token,
      body: JSON.stringify(checkIn),
    }),
    () => postJson(`${COPING_SERVICE_URL}/recommend`, checkIn)
  );
}

export function sendCopingFeedback(feedback, token) {
  return apiRequest("/api/ml/coping/feedback", {
    method: "POST",
    token,
    body: JSON.stringify(feedback),
  });
}
