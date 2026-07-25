const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validate.js");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth.js");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailID, passWord } = req.body;
    const passwordHash = await bcrypt.hash(passWord, 10);
    console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailID,
      passWord: passwordHash,
    });
    await user.save();
    res.status(201).send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailID, passWord } = req.body;
    console.log("Email:" + emailID);

    const user = await User.findOne({ emailID });
    if (!user) {
      throw new Error("Email is not Present in DB");
    }
    const isPasswordValid = await bcrypt.compare(passWord, user.passWord);
    if (isPasswordValid) {
      // create a JWT Token
      const token = await jwt.sign({ _id: user._id }, "Abhi@0307");
      console.log(token);

      //  add the token  to cookie  and send the response  back to the user
      res.cookie("token", token);
      res.send("Login Successfull");
    } else {
      throw new Error(" Password is not correct");
    }
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
expires: new Date(Date.now())
  });
  res.send("Logout Successfully")
});

module.exports = authRouter;
