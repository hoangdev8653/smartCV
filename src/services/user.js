import UserModel from "../models/user.js";
import axios from "axios";
import generateToken from "../utils/generateToken.js";
import { hashPassword, passwordMatch } from "../utils/hashPassword.js";
import verifyRefreshToken from "../middlewares/verifyRefreshToken.js";
import passport from "passport";
import GitHubStrategy from "passport-github2";
import GoogleStrategy from "passport-google-oauth20";

const getAllUser = async () => {
  return await UserModel.find({});
};

const register = async ({ username, email, password }) => {
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      throw { message: "Email đã tồn tại" };
    }
    const hashpassword = await hashPassword(password);
    return await UserModel.create({
      email,
      username,
      password: hashpassword,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const login = async ({ email, password }) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!email) {
      throw { message: "Tài khoản chưa tồn tại" };
    }
    const isMatch = passwordMatch(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không chính xác");
    }
    const { accessToken, refreshToken } = generateToken(user.id, user.role);
    return { user, accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const refreshToken = async ({ refreshToken }) => {
  try {
    const { userId, role } = await verifyRefreshToken(refreshToken);
    const newToken = generateToken(userId, role);
    return newToken;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID ||
        "20724781314-k6tm959ibi516ejt22pab8dn8tqbs90l.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        "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",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3003/user/google/callback",
    },
    async function (accessTokenGoogle, refreshTokenGoogle, profile, done) {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, {
            message: "Không lấy được email từ tài khoản Google.",
          });
        }

        let user = await UserModel.findOne({ email });

        if (user) {
          if (user.provider === "local") {
            return done(null, false, {
              message:
                "Email này đã được đăng ký bằng tài khoản thông thường. Vui lòng dùng email/mật khẩu.",
            });
          }
        } else {
          user = await UserModel.create({
            email,
            username: profile.displayName,
            image: profile.photos?.[0]?.value || "",
            password: null,
            googleId: profile.id,
            provider: "google",
          });
        }

        const { accessToken, refreshToken } = generateToken(
          user._id,
          user.role
        );
        user.tokens = { accessToken, refreshToken };

        return done(null, user);
      } catch (err) {
        console.error("GoogleStrategy Error:", err);
        return done(err, false);
      }
    }
  )
);

passport.use(
  new GitHubStrategy.Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "Ov23li2MKqVdbUZIkuAC",
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET ||
        "a8a1790f9d4d6f28a1259122b069a082c6ef2162",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3003/user/github/callback",
    },
    async function (ghAccessToken, ghRefreshToken, profile, done) {
      try {
        let email = null;
        if (!profile.emails || profile.emails.length === 0) {
          const { data } = await axios.get(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `token ${ghAccessToken}`,
                Accept: "application/vnd.github+json",
              },
            }
          );

          const primaryEmail = data.find((e) => e.primary && e.verified);
          email = primaryEmail?.email || data[0]?.email || null;
        } else {
          email = profile.emails[0].value;
        }

        let user = await UserModel.findOne({ email });

        if (user) {
          if (user.provider === "local" || user.provider === "google") {
            return done(null, false, {
              message:
                "Email này đã được đăng ký bằng tài khoản khác. Vui lòng dùng email/mật khẩu.",
            });
          }
        } else {
          user = await UserModel.create({
            email,
            username: profile.username,
            image: profile.photos?.[0]?.value || "",
            password: null,
            githubId: profile.id,
            provider: "github",
            role: "user",
            accountType: "free",
          });
        }

        const { accessToken, refreshToken } = generateToken(
          user._id,
          user.role
        );
        user.tokens = { accessToken, refreshToken };

        return done(null, user);
      } catch (err) {
        console.error("GitHubStrategy Error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const deleteUser = async (id) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw { message: "Người dùng không tồn tại" };
    }
    return await UserModel.deleteOne({ _id: id });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const userService = {
  getAllUser,
  register,
  login,
  refreshToken,
  deleteUser,
};
