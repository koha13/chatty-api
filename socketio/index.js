const getUserFromToken = require("../middlewares/verifyToken").getUserFromToken;
const User = require("../models/User");
const Info = require("../models/Info");

module.exports = function(io) {
  io.use(async (socket, next) => {
    let token = socket.handshake.query.token;
    let user = await getUserFromToken(token);
    if (user) {
      socket.handshake.user = user;
      next();
    } else next(new Error("Connect is failed"));
  });

  io.on("connection", async socket => {
    //   Update status of user
    await User.updateOne(
      { _id: socket.handshake.user._id },
      {
        status: "online"
      }
    );

    // Add user to room equal user's id
    socket.join(socket.handshake.user._id);

    //   Broadcast to all socket that user is onlone
    socket.broadcast.emit("onlineUser", { user: socket.handshake.user });

    // Handle ondisconnect socket
    socket.on("disconnect", async () => {
      // Update status of offline user
      await User.updateOne(
        { _id: socket.handshake.user._id },
        {
          status: "offline"
        }
      );
      //   Broadcast to all socket that user is offline
      socket.broadcast.emit("offlineUser", { user: socket.handshake.user });
    });

    // Online user unread message
    socket.on("updateReadStatus", async data => {
      await Info.updateOne(
        { user: data.user, room: data.room },
        {
          read: true
        }
      );
    });
  });
};
