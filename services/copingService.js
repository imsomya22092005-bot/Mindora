const axios = require('axios');

const COPING_BASE_URL = process.env.COPING_API_BASE_URL || 'https://coping-suggestions-api.onrender.com';
const COPING_API_KEY = process.env.COPING_API_KEY || '';

// Axios client with timeout configuration
const mlClient = axios.create({
  baseURL: COPING_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    ...(COPING_API_KEY ? { 'X-API-Key': COPING_API_KEY } : {})
  }
});

// Health check
exports.checkMlHealth = async () => {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('ML Health Check Error:', error.message);
    throw new Error('ML recommendation service is currently unavailable');
  }
};

// Fetch recommendations
exports.getRecommendations = async (payload) => {
  try {
    const response = await mlClient.post('/recommend', payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      // ML API returned 4xx or 5xx
      const status = error.response.status;
      const message = error.response.data?.error || 'Failed to fetch recommendations from ML engine';
      const customErr = new Error(message);
      customErr.status = status;
      throw customErr;
    }
    // Network / timeout failure
    const timeoutErr = new Error('ML Service request timed out or network failed');
    timeoutErr.status = 503;
    throw timeoutErr;
  }
};