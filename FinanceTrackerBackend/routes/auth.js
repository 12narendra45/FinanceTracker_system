const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, role });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error in registration" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password,role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });
    if(role!=user.role) return res.status(401).json({ message: "Incorrect role" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({message:"User login Successfully",token:token,user: { _id: user._id, username: user.username, email: user.email, role: user.role }})
  } catch (err) {
    res.status(500).json({ message: "Error in login" });
  }
});

module.exports = router;
