const User = require("../models/User");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    //Get header part of token and decode
    const _id = JSON.parse(
      Buffer.from(token.split(".")[0], "base64").toString()
    )._id;
    //Get user from _id in header
    const user = await User.findById(_id);

    if (!user) throw new Error("Token is missing or invalid");

    //Decode token by user's password as secret key
    const payload = jwt.verify(token, user.password);

    //Check if _id in header part is same with id in payload
    if (_id !== payload._id) throw new Error("Token is missing or invalid");

    //Add user in req and next chain
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

async function getUserFromToken(token) {
  try {
    //Get header part of token and decode
    const _id = JSON.parse(
      Buffer.from(token.split(".")[0], "base64").toString()
    )._id;
    //Get user from _id in header
    const user = await User.findById(_id);

    if (!user) throw new Error("Token is missing or invalid");

    //Decode token by user's password as secret key
    const payload = jwt.verify(token, user.password);

    //Check if _id in header part is same with id in payload
    if (_id !== payload._id) return null;

    return user;
  } catch (error) {
    return null;
  }
}

module.exports = verifyToken;
module.exports.getUserFromToken = getUserFromToken;
