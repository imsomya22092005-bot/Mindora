const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isProduction = import.meta.env.PROD;

const API_BASE_URL = (configuredApiUrl || (isProduction ? "" : "http://localhost:5000")).replace(/\/$/, "");

export async function apiRequest(path, { token, ...options } = {}) {
  // Calm Corner is intentionally frontend-only. Its breathing exercise must
  // keep working even when the backend session endpoint is not available.
  if (path === "/api/calm/session") {
    throw new Error("LOCAL_CALM_SESSION_ONLY");
  }

  if (isProduction && !configuredApiUrl) {
    throw new Error("Mindora's backend URL is not configured yet. Please set VITE_API_URL in Vercel Environment Variables, then redeploy the frontend.");
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Cannot reach Mindora's backend. Check that the backend is deployed and VITE_API_URL points to its live URL.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed (${response.status}). Please try again.`);
  }
  return payload;
}

export { API_BASE_URL };
