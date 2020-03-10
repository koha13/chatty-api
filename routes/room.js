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
      let { type, createdAt, updatedAt, _id, users, name } = user.rooms[i];
      let info = false;
      for (let j = 0; j < user.infos.length; j++) {
        if (String(user.infos[j].room) === String(_id)) {
          info = user.infos[j].read;
        }
      }
      if (name) {
        user.rooms[i] = {
          type,
          createdAt,
          updatedAt,
          _id,
          users,
          read: info,
          name
        };
      } else
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
    let userlist = req.body.users;
    if (idRoom === null || userlist === null) {
      return res.status(500).send({ error: "Bad request" });
    }
    const room = await Room.findById(idRoom);
    if (room === null) {
      return res.status(400).send({ error: "Can't find this room" });
    } else if (room.type === "private")
      return res.status(400).send({ error: "This room is private" });
    if (!room.users.includes(req.user._id)) {
      return res
        .status(401)
        .send({ error: "You're not in this room! Can't send this message" });
    }

    let infoList = [];
    let usersAdded = [];

    userlist.map(async user => {
      let userAdded = await User.findById(user);
      if (userAdded !== null && !room.users.includes(userAdded._id)) {
        room.users.push(userAdded._id);
        infoList.push({ user: userAdded._id, room: room._id, read: false });
        usersAdded.push(userAdded);
      }
    });
    await room.save();
    await Info.insertMany(infoList);
    res.send(usersAdded);
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

//Get info(a.k.a read status) of rooms
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

// Create room
router.post("/create", verifyToken, async (req, res) => {
  try {
    let { users, name } = req.body;
    if (!users) throw new Error("No users in room");
    if (users.length === 1) {
      let existRoom1 = await Room.find({ users: [users[0], req.user._id] });
      let existRoom2 = await Room.find({ users: [req.user._id, users[0]] });
      if (!_.isEmpty(existRoom1) || !_.isEmpty(existRoom2))
        throw new Error("Room already exist");
    }
    let type = users.length === 1 ? "private" : "group";
    let newRoom = new Room({ users: [...users, req.user._id], type, name });

    await newRoom.save();
    await newRoom
      .populate({
        path: "users"
      })
      .execPopulate();
    console.log(newRoom);
    let arrInfo = users.map(user => ({ user, room: newRoom._id, read: false }));
    arrInfo.push({ user: req.user._id, room: newRoom._id, read: true });
    Info.insertMany(arrInfo);
    let dataRes = {
      users: newRoom.users,
      type: newRoom.type,
      createdAt: newRoom.createdAt,
      updatedAt: newRoom.updatedAt,
      _id: newRoom._id,
      read: false
    };
    if (newRoom.name) {
      dataRes = { ...dataRes, name: newRoom.name };
    }
    const io = req.app.get("socketio");
    users.map(user => {
      io.in(user).emit("newRoom", dataRes);
    });

    res.send(dataRes);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
