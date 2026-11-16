const express = require("express");
const fetchTechNews = require("../services/techNewsService");

const router = express.Router();

router.get("/tech-news", async (req, res) => {
  try {
    const articles = await fetchTechNews();

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("TECH NEWS ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch technology news",
    });
  }
});

router.get("/tech-news/refresh", async (req, res) => {
  try {
    const articles = await fetchTechNews(true);
    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
      message: "Technology news Refreshed Successfully",
    });
  } catch (error) {
    console.error("Tech News Refresh Error :", error.message);
    res.status(500).json({
        success:false,
        message:"Unable to Refresh Technology News"
    })
  }
});

module.exports = router;
