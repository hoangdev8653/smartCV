import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUser();
    return res
      .status(StatusCodes.OK)
      .json({ status: 200, message: "Xử lý thành công", content: users });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Error: "Server Error" });
  }
};

const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = await userService.register({ email, username, password });
    return res
      .status(StatusCodes.CREATED)
      .json({ status: 201, message: "Đăng kí thành công", content: user });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Error: "Server Error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userService.login({ email, password });
    return res
      .status(StatusCodes.OK)
      .json({ status: 200, message: "Đăng nhập thành công", content: user });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Error: "Server Error" });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = userService.refreshToken({ refreshToken });
    return res
      .status(StatusCodes.OK)
      .json({ status: 200, message: "Xử lý thành công", content: user });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ Error: "Server Error" });
  }
};

export const userController = {
  getAllUsers,
  register,
  login,
  refreshToken,
};
