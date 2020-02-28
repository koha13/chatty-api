const express = require("express");
const app = express();
var cors = require("cors");
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

//Middleware cors
app.use(cors());

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
// room.users.push("5e57b8f1049b802d98c154a5", "5e57e54a43cc4b1b24e8fa62");
// room.save();

const server = require("http").Server(app);
const io = require("socket.io")(server);
io.on("connection", socket => {
  socket.emit("message", { message: "connected" });
});

app.set("socketio", io);

server.listen(3000, () => {
  console.log("Server is running");
});
