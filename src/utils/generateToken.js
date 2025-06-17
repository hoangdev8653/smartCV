import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ userId, role }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

export default generateToken;
