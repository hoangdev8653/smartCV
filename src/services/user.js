import UserModel from "../models/user.js";

import generateToken from "../utils/generateToken.js";
import { hashPassword, passwordMatch } from "../utils/hashPassword.js";
import verifyRefreshToken from "../middlewares/verifyRefreshToken.js";

const getAllUser = async () => {
  return await UserModel.find({});
};

const register = async ({ username, email, password }) => {
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      throw { message: "Email đã tồn tại" };
    }
    const hashpassword = hashPassword(password);
    return await UserModel.create({
      email,
      username,
      password: hashpassword,
      phone,
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

export const userService = {
  getAllUser,
  register,
  login,
  refreshToken,
};
