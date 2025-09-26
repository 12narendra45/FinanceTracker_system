const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");
const redis = require("../redisClient");
const moment = require("moment");

const router = express.Router();
const CACHE_EXPIRATION_ANALYTICS = 900; 

router.get("/", auth, async (req, res) => {

  const cacheKey = req.user.role === 'admin' ? 'analytics:admin' : `analytics:${req.user.id}`;

  try {
    const cachedAnalytics = await redis.get(cacheKey);
    if (cachedAnalytics) {
      console.log("Serving analytics from cache");
      return res.json(JSON.parse(cachedAnalytics));
    }

    console.log("Generating analytics from database");
    const matchFilter = {};
    if (req.user.role === "user" || req.user.role === "read-only") {
      matchFilter.user = req.user.id;
    }

   
    const pieDataAgg = await Transaction.aggregate([
      { $match: { ...matchFilter, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);
    const pieData = {
      labels: pieDataAgg.map((item) => item._id),
      datasets: [{
        label: "Expenses by Category",
        data: pieDataAgg.map((item) => item.total),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
      }],
    };

    const sixMonthsAgo = moment().subtract(6, "months").toDate();
    const monthlyDataAgg = await Transaction.aggregate([
        { $match: { ...matchFilter, date: { $gte: sixMonthsAgo } } }, 
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type",
                },
                total: { $sum: "$amount" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const labels = [...new Set(monthlyDataAgg.map(item => moment(`${item._id.year}-${item._id.month}-01`).format("MMM YYYY")))];
    const incomeData = new Array(labels.length).fill(0);
    const expenseData = new Array(labels.length).fill(0);

    monthlyDataAgg.forEach(item => {
        const label = moment(`${item._id.year}-${item._id.month}-01`).format("MMM YYYY");
        const index = labels.indexOf(label);
        if (item._id.type === 'income') {
            incomeData[index] = item.total;
        } else {
            expenseData[index] = item.total;
        }
    });

    const barData = {
        labels,
        datasets: [
            { label: 'Income', data: incomeData, backgroundColor: '#4BC0C0' },
            { label: 'Expense', data: expenseData, backgroundColor: '#FF6384' },
        ],
    };

    const lineData = {
        labels,
        datasets: [
            { label: 'Income', data: incomeData, borderColor: '#4BC0C0', fill: false },
            { label: 'Expense', data: expenseData, borderColor: '#FF6384', fill: false },
        ],
    };

    const analyticsData = { pieData, barData, lineData };

    await redis.setEx(cacheKey, CACHE_EXPIRATION_ANALYTICS, JSON.stringify(analyticsData));

    res.json(analyticsData);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;