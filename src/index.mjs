import express from "express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import User from "./db/models/User.mjs";
import GoogleUser from "./db/models/GoogleUser.mjs";
import { hashPassword } from "./utils/passwordHelper.mjs";
import "./strategies/localStrategy.mjs";
import "./strategies/googleStrategy.mjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN, // frontend URL
    credentials: true, // enable credentials (cookies, authorization headers, etc.)
  })
);

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 * 60 },
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  const userType = user.googleId ? "google" : "local";
  done(null, { id: user.id, type: userType });
});

passport.deserializeUser(async (obj, done) => {
  try {
    let user;
    if (obj.type === "google") {
      user = await GoogleUser.findById(obj.id);
    } else {
      user = await User.findById(obj.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ROUTES

// REGISTER USER
app.post("/api/users", async (req, res) => {
  const { body } = req;
  body.password = await hashPassword(body.password);
  const newUser = new User(body);
  const savedUser = await newUser.save();
  return res.status(200).json({ msg: "Successfully registered", savedUser });
});

// LOGIN USER
app.post("/api/auth", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ msg: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        msg: "User Logged In",
        user: {
          id: user.id,
          accountType: user.accountType,
        },
      });
    });
  })(req, res, next);
});

// LOGIN USER VIA GOOGLE
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// HANDLE GOOGLE REDIRECT (for both login and registration)
app.get(
  "/api/auth/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, send user info
    res.redirect("/api/auth/status");
  }
);

// CHECK STATUS
app.get("/api/auth/status", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ msg: "User not logged in" });
  }
  return res.status(200).json({ msg: "User Logged In", user: req.user });
});

// LOGOUT USER
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ msg: err });
    return res.status(200).json({ msg: "User Logged Out" });
  });
});

// USER PROFILE
app.get("/api/auth/user/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ msg: "User Profile", user: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
