const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many login/register attempts, please try again later.",
});

const txLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 100, 
  message: "Too many transaction requests, please try again later.",
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50, 
  message: "Too many analytics requests, please try again later.",
});

module.exports = {
  authLimiter,
  txLimiter,
  analyticsLimiter,
};
