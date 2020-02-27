const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");
const Room = require("../models/Room");

//Get all room that current user already in
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.populate("rooms").execPopulate();
    res.send(user.rooms);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Add user to a room
router.post("/:idRoom/add", verifyToken, async (req, res) => {
  try {
    let idRoom = req.params.idRoom;
    let idUserAdded = req.query._id;
    if (idRoom === null || idUserAdded === null) {
      return res.status(500).send({ error: "Bad request" });
    }
    const room = await Room.findById(idRoom);
    if (room === null) {
      return res.status(400).send({ error: "Can't find this room" });
    }
    if (!room.users.includes(req.user._id)) {
      return res
        .status(401)
        .send({ error: "You're not in this room! Can't send this message" });
    }
    let userAdded = await User.findById(idUserAdded);
    if (userAdded === null) {
      return res.status(400).send({ error: "Can't find this user" });
    }
    if (room.users.includes(userAdded._id)) {
      return res.status(400).send({ error: "User already in this room" });
    }
    room.users.push(userAdded._id);
    await room.save();
    res.send(room);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//User out room
router.post("/:idRoom/out", verifyToken, async (req, res) => {
  try {
    let idRoom = req.params.idRoom;
    if (idRoom === null) {
      res.status(500).send({ error: "Bad request" });
    }
    console.log(req.user._id);
    let room = await Room.findById(idRoom);
    if (room.users.includes(req.user._id)) {
      room.users = room.users.filter(user => {
        return user != req.user._id;
      });

      await room.save();
      return res.send(room);
    }
    res.status(400).send({ error: "User isn't in this room" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
