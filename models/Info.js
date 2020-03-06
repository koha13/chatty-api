const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  room: {
    type: mongoose.Types.ObjectId,
    ref: "Room"
  },
  read: {
    type: Boolean
  }
});

const Info = mongoose.model("Info", infoSchema);

module.exports = Info;
