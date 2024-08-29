const express = require("express");
const { getAllTopics, getArticleById } = require("./controllers/nc_news_controller");
const endpoints = require("../endpoints.json");
const app = express();

app.use(express.json());

// Routes
app.get("/api/topics", getAllTopics);
app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});
app.get("/api/articles/:article_id", getArticleById);

// General error handling middleware
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.log(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
