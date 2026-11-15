const Parser = require("rss-parser");


const parser = new Parser({
  timeout: 10000,
});

const NEWS_SOURCES = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
];

// Categorize articles using keywords
const categorizeArticle = (article) => {
  const text = `${article.title} ${article.description}`.toLowerCase();

  const categories = {
    "AI & Innovation": [
      "artificial intelligence",
      "chatgpt",
      "openai",
      "gemini",
      "machine learning",
      "llm",
      "generative ai",
    ],

    Layoffs: [
      "layoff",
      "job cuts",
      "workforce reduction",
      "fired",
      "staff cuts",
    ],

    "Startups & Funding": [
      "startup",
      "funding",
      "venture capital",
      "series a",
      "series b",
      "raised",
      "investment",
    ],

    Cybersecurity: [
      "cybersecurity",
      "data breach",
      "hacker",
      "ransomware",
      "malware",
      "security vulnerability",
    ],

    "Big Tech": [
      "google",
      "microsoft",
      "apple",
      "amazon",
      "meta",
      "nvidia",
      "tesla",
    ],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "Tech Industry";
};

const fetchTechNews = async () => {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);

      return feed.items.map((item) => {
        const article = {
          id: item.guid || item.link,
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.summary || "",
          source: source.name,
          publishedAt: item.isoDate || item.pubDate || null,
        };

        return {
          ...article,
          category: categorizeArticle(article),
        };
      });
    }),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.log(`${NEWS_SOURCES[index].name} failed:`, result.reason.message);
    } else {
      console.log(
        `${NEWS_SOURCES[index].name}:`,
        result.value.length,
        "articles",
      );
    }
  });

  const articles = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);

  const uniqueArticles = [
    ...new Map(
      articles
        .filter((article) => article.link && article.title)
        .map((article) => [article.link, article]),
    ).values(),
  ];

  return uniqueArticles
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 30);
};

module.exports = fetchTechNews;
