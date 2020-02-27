const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User"
      }
    ]
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
