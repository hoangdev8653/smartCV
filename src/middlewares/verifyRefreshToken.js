import jwt from "jsonwebtoken";

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, payload) => {
      if (err) {
        console.log("Error: ", err);
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};

export default verifyRefreshToken;
