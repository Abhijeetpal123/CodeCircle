const express = require("express");
const Post = require("../models/post");
const postRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

postRouter.post("/post", userAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user._id;

    const newPost = new Post({
      title,
      content,
      createdBy,
    });

    await newPost.save();

    // Populate author details before sending the new post
    await newPost.populate(
      "createdBy",
      "firstName lastName profilePic",
    );

    res.status(201).json(newPost);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);

    res.status(500).json({
      error: "Failed to create Post",
    });
  }
});

postRouter.get("/post", userAuth, async (req, res) => {
  try {
    const posts = await Post.find({}).populate(
      "createdBy",
      "firstName lastName profilePic",
    );
    res.send(posts);
  } catch (err) {
    res.status(400).send("ERRROR" + err.message);
  }
});

postRouter.get("/post/:postId", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId)
      .select("title content createdBy")
      .populate("createdBy", "firstName lastName");
    if (!post) {
      return res.status(404).json("Post Not Found");
    }

    res.status(200).json({
      message: "Post Fetched Successfull",
      data: post,
    });
  } catch (err) {
    res.status(400).send("ERROR" + err.message);
  }
});

postRouter.patch("/post/:postId", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json("Post Not Found");
    }

    if (!post.createdBy.equals(req.user._id)) {
      return res.status(403).json("Edit Post");
    }

    post.title = title;
    post.content = content;

    await post.save();

    res.status(200).json({
      message: "Post Updated Successfully",
      data: post,
    });
  } catch (err) {
    res.status(400).json("ERROR " + err.message);
  }
});

postRouter.delete("/post/:postId", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json("Post Not Found");
    }

    if (!post.createdBy.equals(req.user._id)) {
      return res.status(403).json("Deelete The Post");
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: "Post Deleted Successfully",
    });
  } catch (err) {
    res.status(400).json("ERROR " + err.message);
  }
});
module.exports = postRouter;
