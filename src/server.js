import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { connectDB } from "./configs/connectDb.js";
import { corsOptions } from "./configs/cors.js";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import { routers } from "./routers/index.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
connectDB();
const app = express();

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/user", routers.user);

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
