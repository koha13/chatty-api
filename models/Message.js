const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User"
    },
    type: {
      type: String,
      default: "message",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    room: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Room"
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
