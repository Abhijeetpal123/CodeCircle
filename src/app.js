const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const { validateSignUpData } = require("./utils/validate.js");
const cookieParser = require("cookie-parser");

//Middlewares
// check to read the data convet json into js object
app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth.js")
const profileRouter = require("./routes/profile.js")
const requestRouter = require("./routes/request.js")

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)


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
