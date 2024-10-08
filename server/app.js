const express = require("express");
const cors = require("cors");
const {
  getAllTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchVotesByArticleId,
  patchArticleVotes,
} = require("./controllers/nc_news_controller");
const endpoints = require("../endpoints.json");
const app = express();

app.use(cors()); //To avoid conflicts regaring Cross Origin Resource Sharing

app.use(express.json());

// Routes
app.get("/api/topics", getAllTopics);
app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchVotesByArticleId);
app.patch("/api/articles/:article_id/votes", patchArticleVotes);

// General error handling middleware
app.use((err, req, res, next) => {
  // console.log(err);
  // console.error(err.stack);
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request - Invalid article_id" });
  }
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.log("What is going on?");
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
