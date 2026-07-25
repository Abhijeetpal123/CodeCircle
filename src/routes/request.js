const express = require('express')
const requestRouter = express.Router()
const { userAuth } = require("../middlewares/auth.js");


requestRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  const user = req.user;

  console.log("Sending a Connection Request");

  res.send("Connection Request Send");
});

module.exports = requestRouter