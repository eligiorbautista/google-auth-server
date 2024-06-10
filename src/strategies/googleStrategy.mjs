import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import GoogleUser from "../db/models/GoogleUser.mjs";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
  new Strategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const displayName = profile.displayName;

        let user = await GoogleUser.findOne({ googleId });

        if (!user) {
          // create a new user if not found
          const newUser = new GoogleUser({
            email: email,
            displayName: displayName,
            googleId: googleId,
          });
          user = await newUser.save();
        }

        return done(null, user);
      } catch (error) {
        console.error(error.message);
        return done(error, null);
      }
    }
  )
);

export default passport;
