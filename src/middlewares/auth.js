import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.slipt(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provied" });
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decode.userId;
    req.role = decode.role;
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

export default auth;
