import express from "express";
import passport from "passport";
import { userController } from "../controllers/user.js";
const router = express.Router();

router.route("/").get(userController.getAllUsers);
router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/refreshToken").post(userController.refreshToken);
router.route("/delete").delete(userController.deleteUser);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const tokens = user.tokens || {};
    res.json({
      message: "Đăng nhập Google thành công!",
      user: req.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const tokens = user.tokens || {};
    res.json({
      message: "Đăng nhập Google thành công!",
      user: req.user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }
);

export default router;
