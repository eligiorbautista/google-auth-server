import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../db/models/User.mjs";
import { comparePassword } from "../utils/passwordHelper.mjs";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: "Bad Credentials" });
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

export default passport;
