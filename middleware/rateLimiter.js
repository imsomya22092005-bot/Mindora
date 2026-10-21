const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('[Redis] Client Error:', err));
redisClient.on('connect', () => console.log('[Redis] Connected successfully'));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('[Redis] Failed to connect:', err);
  }
})();

const getRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `mindora:rl:${prefix}:`
  });
};

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore('auth'),
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 60 minutes.'
  }
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore('api'),
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});