
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const txRoutes = require("./routes/transactions");
const analyticsRoutes = require("./routes/analytics");
const usersRoutes = require("./routes/users");

const { authLimiter, txLimiter, analyticsLimiter } = require("./middleware/rateLimiter");
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") req.body[key] = xss(req.body[key]);
    }
  }
  next();
});


app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => { console.error(err); process.exit(1); });


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", txLimiter, txRoutes);
app.use("/api/analytics", analyticsLimiter, analyticsRoutes);

app.use("/api/users", usersRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




