const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  //  Read the token from the req cookies

  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token is Not Valid ");
    }

    const decodedObj = await jwt.verify(token, "Abhi@0307");
    console.log("Token user ID:", decodedObj._id);

    const { _id } = decodedObj;

    const user = await User.findById(_id);
    console.log("Database user:", user);
    if (!user) {
      throw new Error("User Not Found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
};

module.exports = { userAuth };
