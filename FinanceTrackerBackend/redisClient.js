const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL
});
client.connect()
  .then(() => console.log("Redis connected"))
  .catch(err => console.log("Redis connection error:", err));

module.exports = client;
