const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const redis = require("../redisClient");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 10, q, category, type } = req.query;

  let filter = {};
  if (req.user.role === "user") filter.user = req.user.id;
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (q) filter.note = new RegExp(q, "i");

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const transactions = await Transaction.find(filter)
    .populate("user", "username email")
    .sort({ date: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const total = await Transaction.countDocuments(filter);

  res.json({ transactions, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
});

router.post("/", auth, rbac, async (req, res) => {
  const { type, category, amount, note, date } = req.body; 
  const tx = new Transaction({ user: req.user.id, type, category, amount, note, date }); 
  await tx.save();
  await redis.del(`analytics:${req.user.id}`);
  const keys = await redis.keys(`transactions:${req.user.id}*`);
  if (keys.length > 0) await redis.del(keys);
  res.json({ message: "Added successfully", tx });
});

router.put("/:id", auth, rbac, async (req, res) => {
  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id };

  const tx = await Transaction.findOneAndUpdate(filter, req.body, { new: true });
  if (!tx) return res.status(404).json({ message: "Transaction not found or access denied" });

  await redis.del(`analytics:${req.user.id}`);
  res.json({ message: "Updated successfully", tx });
});

router.delete("/:id", auth, rbac, async (req, res) => {
  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id };

  const tx = await Transaction.findOneAndDelete(filter);
  if (!tx) return res.status(404).json({ message: "Transaction not found or access denied" });

  await redis.del(`analytics:${req.user.id}`);
  res.json({ message: "Deleted successfully", tx });
});

module.exports = router;
