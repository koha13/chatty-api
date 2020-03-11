const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");

router.post("/register", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    status: "offline",
    avatar: req.body.avatar
  });

  try {
    const savedUser = await user.save();
    const io = req.app.get("socketio");
    io.emit("newUser", savedUser);
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = jwt.sign(
      { _id: user._id },
      user.password,
      {
        header: { _id: user.id }
      },
      {
        expiredIn: "1 day"
      }
    );

    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/test", verifyToken, (req, res) => res.send("ok"));

module.exports = router;
