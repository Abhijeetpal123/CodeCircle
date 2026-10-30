require("dotenv").config();
const path = require("path");
const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const { validateSignUpData } = require("./utils/validate.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
//Middlewares
// check to read the data convet json into js object
const allowedOrigins = [
  "http://localhost:5173",
  "https://code-circle-frontend-flame.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");
const postRouter = require("./routes/postrouter.js");
const chatRouter = require("./routes/chat.js");
const initializeSocket = require("./utils/socket.js");
const aiRouter = require("./routes/ai.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", postRouter);
app.use("/", chatRouter);
app.use("/", aiRouter);
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database Connection Successfully Established");
    server.listen(7777, () => {
      console.log("Server is Successfully running on Port 7777");
    });
  })
  .catch((err) => {
    console.error("Database is not Successfully Connected", err);
  });
