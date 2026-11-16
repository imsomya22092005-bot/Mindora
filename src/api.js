const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isProduction = import.meta.env.PROD;

const DEFAULT_PRODUCTION_API_URL = "https://mindora-backend-mdfl.onrender.com";
const API_BASE_URL = (configuredApiUrl || (isProduction ? DEFAULT_PRODUCTION_API_URL : "http://localhost:5000")).replace(/\/$/, "");

export async function apiRequest(path, { token, ...options } = {}) {
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
