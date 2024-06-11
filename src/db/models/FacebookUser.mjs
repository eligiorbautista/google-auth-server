import mongoose from "mongoose";

const facebookUserSchema = new mongoose.Schema({
  facebookId: {
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
  accountType: {
    type: String,
    default: "facebook-account",
  },
});

const FacebookUser = mongoose.model("FacebookUser", facebookUserSchema);

export default FacebookUser;
