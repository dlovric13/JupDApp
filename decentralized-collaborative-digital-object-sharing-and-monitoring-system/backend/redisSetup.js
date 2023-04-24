const Redis = require("ioredis");

const redisClient = new Redis();

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready");
});

redisClient.on("error", (error) => {
  console.error("Error in Redis client:", error);
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting");
});

redisClient.on("end", () => {
  console.log("Redis client connection closed");
});

redisClient.on("warning", (warning) => {
  console.warn("Redis client warning:", warning);
});

module.exports = { redisClient };
