const express = require("express");
const app = express();
const mongooes = require("mongoose");
const dotenv = require("dotenv");

//Get enviroment variables
dotenv.config();

//Connect DB
mongooes.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true
  },
  () => console.log("Connected to DB")
);

//Middleware convert to JSON
app.use(express.json());

//Import routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const messageRoute = require("./routes/message");
const roomRoute = require("./routes/room");

//Apply route
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/room", roomRoute);

// const Room = require("./models/Room");
// const room = new Room();
// room.users.push("5e57b8f1049b802d98c154a5");
// room.save();

app.listen(3000, () => {
  console.log("Server is running");
});
