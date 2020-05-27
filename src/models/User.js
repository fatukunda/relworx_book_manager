import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nameValidator, emailValidator } from "../validations/userValidation";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    validate: nameValidator,
  },
  lastName: {
    type: String,
    required: true,
    validate: nameValidator,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: emailValidator,
  },
  password: {
    type: String,
    required: true,
  },
});

// Before saving/editing a user, hash their password.
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
// Generate an auth token for the user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );
  return token;
};
// Search for a user by email and password.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { error: "Invalid Login credentials." };
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return { error: "Invalid Login credentials." };
  }
  return user;
};
// Check if email of a user already exists
userSchema.statics.isUserExist = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return false;
  }
  return true;
};
// Remove some sensitive properties like password from the user response data.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
