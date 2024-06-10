import mongoose from "mongoose";

const googleUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  accountTye: {
    type: String,
    default: "google-account",
  },
});

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);

export default GoogleUser;
