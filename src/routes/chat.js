const express = require("express");
const { Chat } = require("../models/Chat");
const {userAuth} = require("../middlewares/auth");

const chatRouter = express.Router();

chatRouter.get(
  "/chat/:targetUserID",
  userAuth,
  async (req, res) => {
    try {
      const { targetUserID } = req.params;
      const userId = req.user._id;

      const chat = await Chat.findOne({
        participants: { $all: [userId, targetUserID] },
      });

      if (!chat) {
        return res.status(200).json([]);
      }

      res.status(200).json(chat.messages);
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch chat history",
        error: err.message,
      });
    }
  }
);

module.exports = chatRouter;