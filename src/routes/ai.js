const express = require("express");
const aiRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { generateBio, generateIceBreaker } = require("../services/aiService");
const { User } = require("../models/user");
aiRouter.post("/ai/bio", userAuth, async (req, res) => {
  try {
    const { firstName, skills, education } = req.user;

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        message: "Please add your skills to your profile first",
      });
    }

    const bio = await generateBio({ firstName, skills, education });

    res.status(200).json({ bio });
  } catch (err) {
    console.error("AI BIO ERROR:", err);

    res.status(500).json({
      message: "Bio Not Generated",
    });
  }
});

aiRouter.post(
  "/ai/conversation-starters/:targetUserId",
  userAuth,
  async (req, res) => {
    try {
      const { targetUserId } = req.params;

      // galat format ki id (jaise "abc") pe Mongoose crash na kare
      if (!mongoose.isValidObjectId(targetUserId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const target = await User.findById(targetUserId).select(
        "firstName skills about",
      );

      if (!target) {
        return res.status(404).json({ message: "User not found" });
      }

      const starters = await generateConversationStarters({
        me: req.user,
        target,
      });

      res.status(200).json({ starters });
    } catch (err) {
      console.error("AI STARTERS ERROR:", err);
      res.status(500).json({ message: "Couldn't generate suggestions" });
    }
  },
);

module.exports = aiRouter;
