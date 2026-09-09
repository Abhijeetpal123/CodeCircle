const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const { validateSignUpData } = require("./utils/validate.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//Middlewares
// check to read the data convet json into js object
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const postRouter = require("./routes/postrouter.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", postRouter);

connectDB()
  .then(() => {
    console.log("Database Connection Successfully Established");
    app.listen(7777, () => {
      console.log("Server is Successfully running on Port 7777");
    });
  })
  .catch((err) => {
    console.error("Database is not Successfully Connected", err);
  });
