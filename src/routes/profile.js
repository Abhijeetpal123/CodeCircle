const upload = require("../middlewares/upload");
const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { validateProfileData } = require("../utils/validate.js");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user.toObject();

    delete user.passWord;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();

    res.send(`${loggedInUser.firstName}, your profile updated successfully`);
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

profileRouter.patch(
    "/profile/photo",
    userAuth,
    upload.single("profilePic"),
    async (req, res) => {
      try {
        console.log("FILE:", req.file);

        if (!req.file) {
          return res.status(400).json({
            message: "Please select an image",
          });
           }

        const profilePic = `/uploads/${req.file.filename}`;

        req.user.profilePic = profilePic;

        await req.user.save();

        res.status(200).json({
          message: "Profile picture updated successfully",
          profilePic,
        });
      } catch (err) {
        console.error("PROFILE PHOTO ERROR:", err);

        res.status(500).json({
          message: "Failed to update profile picture",
        });
      }
    },
  );

profileRouter.delete("/profile/photo", userAuth, async (req, res) => {
  try {
    req.user.profilePic = null;

    await req.user.save();

    res.status(200).json({
      message: "Profile picture removed successfully",
    });
  } catch (err) {
    console.error("PROFILE PHOTO DELETE ERROR:", err);

    res.status(500).json({
      message: "Failed to remove profile picture",
    });
  }
});


module.exports = profileRouter;
