const router = require("express").Router();
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");

// Get all user
router.get("/", verifyToken, async (req, res) => {
  users = await User.find();
  res.send(users);
});

// Get user by id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      res.status(404).send({ error: "User not found" });
    } else res.send(user);
  } catch (error) {
    res.status(404).send({ error: "User not found" });
  }
});

module.exports = router;
