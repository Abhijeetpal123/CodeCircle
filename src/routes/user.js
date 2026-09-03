const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

//Get All the pending connection request for loggedin user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const receivedRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName"]);
    res.json({
      message: "Data Fetched Successfully",
      data: receivedRequest,
    });
  } catch (err) {
    res.status(400).json("Error" + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const receivedRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "about", "skills"])
      .populate("toUserId", ["firstName", "lastName", "about", "skills"]);

    const data = receivedRequest.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Connections fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json("Error" + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    // user should see all the connection request
    //0. His Own Card
    //1 His Connections
    //2 Ignored People
    //3 Already Sent The Connection Request
    const loggedInUser = req.user;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    //Find all connections request(sent+received)
    const receivedRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hiddenUsersFromFeed = new Set();

    hiddenUsersFromFeed.add(loggedInUser._id.toString());

    receivedRequest.forEach((connection) => {
      hiddenUsersFromFeed.add(connection.fromUserId.toString());
      hiddenUsersFromFeed.add(connection.toUserId.toString());
    });

    // console.log(hiddenUsersFromFeed);

    const user = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName  age about skills")
      .skip(skip)
      .limit(limit);
    res.json({
      message: "Feed fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json("Error" + err.message);
  }
});

userRouter.get("/user/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "firstName lastName about skills education",
    );
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    res.json({
      message: "User Fetched Successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json("Error" + err.message);
  }
});

module.exports = userRouter;
