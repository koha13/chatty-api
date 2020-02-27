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

//Apply route
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.listen(3000, () => {
  console.log("Server is running");
});
