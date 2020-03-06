const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");
const Room = require("../models/Room");
const Info = require("../models/Info");
const _ = require("lodash");
//Get all room that current user already in
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user
      .populate({
        path: "rooms",
        populate: {
          path: "users"
        }
      })
      .execPopulate();

    await user
      .populate({
        path: "infos"
      })
      .execPopulate();

    for (let i = 0; i < user.rooms.length; i++) {
      let { type, createdAt, updatedAt, _id, users } = user.rooms[i];
      let info = false;
      for (let j = 0; j < user.infos.length; j++) {
        if (String(user.infos[j].room) === String(_id)) {
          info = user.infos[j].read;
        }
      }
      user.rooms[i] = { type, createdAt, updatedAt, _id, users, read: info };
    }

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
    let info = new Info({ user: idUserAdded, room: room._id, read: false });
    await info.save();
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
    let room = await Room.findById(idRoom);
    if (room.users.includes(req.user._id)) {
      room.users = room.users.filter(user => {
        return String(user) !== String(req.user._id);
      });

      await room.save();
      await Info.deleteOne({ user: req.user._id, room: room._id, read: false });
      return res.send(room);
    }
    res.status(400).send({ error: "User isn't in this room" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Get info of rooms
router.get("/info", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user
      .populate({
        path: "infos"
      })
      .execPopulate();
    res.send(user.infos);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
