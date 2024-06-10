import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    required: true,
    type: String,
    length: {
      min: 6,
      max: 100,
      message: "Password must be at least 6 characters.",
    },
  },
  accountType: {
    type: String,
    default: "local-account",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
