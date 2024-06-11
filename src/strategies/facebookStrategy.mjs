import { Strategy } from "passport-facebook";
import FacebookUser from "../db/models/FacebookUser.mjs";
import dotenv from "dotenv";

dotenv.config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL;

const facebookStrategy = new Strategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: FACEBOOK_CALLBACK_URL,
    profileFields: ["id", "displayName", "emails"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const facebookId = profile.id;
      const displayName = profile.displayName;

      let user = await FacebookUser.findOne({ facebookId });

      if (!user) {
        // create a new user if not found
        const newUser = new FacebookUser({
          email: email,
          displayName: displayName,
          facebookId: facebookId,
        });
        user = await newUser.save();
      }

      return done(null, user);
    } catch (error) {
      console.error(error.message);
      return done(error, null);
    }
  }
);

export default facebookStrategy;
