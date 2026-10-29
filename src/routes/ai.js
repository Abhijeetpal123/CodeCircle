const express = require("express");
const aiRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { generateBio } = require("../services/aiService");

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

module.exports = aiRouter;