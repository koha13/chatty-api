const router = require("express").Router();
const Room = require("../models/Room");
const User = require("../models/User");
const Message = require("../models/Message");
const Info = require("../models/Info");
const verifyToken = require("../middlewares/verifyToken");

// Add message to room
router.post("/:idRoom", verifyToken, async (req, res) => {
  try {
    let room = await Room.findById(req.params.idRoom);
    if (room === null) {
      return res.status(404).send("Room not found");
    }
    if (!room.users.includes(req.user._id)) {
      return res
        .status(401)
        .send({ error: "You're not in this room! Can't send this message" });
    }
    let message = new Message({
      ...req.body,
      user: req.user._id,
      room: room._id
    });
    await message.save(); // Save message
    const io = req.app.get("socketio"); //Get io instance
    let usersToEmit = room.users.filter(
      user => String(user) !== String(req.user._id)
    );
    usersToEmit.map(user => {
      io.in(user).emit("newMessage", message);
    });

    // Update read status
    for (let i = 0; i < usersToEmit.length; i++) {
      await User.findById(usersToEmit[i], async (err, user) => {
        await Info.updateOne(
          { user: user._id, room: room._id },
          {
            read: false
          }
        );
      });
    }

    res.send(message);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get message from room
router.get("/:idRoom", verifyToken, async (req, res) => {
  try {
    let room = await Room.findById(req.params.idRoom);
    if (room === null) {
      return res.status(404).send("Room not found");
    }
    if (!room.users.includes(req.user._id)) {
      return res
        .status(401)
        .send({ error: "You're not in this room! Can't send this message" });
    }
    let skipMessage = req.query.skip ? req.query.skip : 0;
    await room
      .populate({
        path: "messages ",
        options: {
          sort: { createdAt: -1 },
          limit: 20,
          skip: parseInt(skipMessage)
        }
      })
      .execPopulate();

    // Update read status. Dont need to async
    await Info.updateOne(
      { user: req.user._id, room: room._id },
      {
        read: true
      }
    );
    res.send(room.messages);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
