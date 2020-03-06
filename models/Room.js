const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User"
      }
    ],
    type: {
      type: String,
      required: true
    },
    name: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

roomSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "room"
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
