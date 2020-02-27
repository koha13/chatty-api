const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 6,
      maxlength: 32,
      required: true
    },
    email: {
      type: String,
      minlength: 6,
      maxlength: 32,
      required: true,
      unique: true
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 32,
      required: true
    },
    status: {
      type: String
    }
  },
  { timestamps: true }
);

//Middleware pre save crypt password before save
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Static function to find by email and password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Email or password is wrong");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email or password is wrong");
  }

  return user;
};

//Hiding private fields
userSchema.methods.toJSON = function() {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;

  return userObj;
};

userSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "users"
});

const User = mongoose.model("User", userSchema);

module.exports = User;
