const express = require("express");
const {
  getAllTopics,
  getArticleById,
} = require("./controllers/nc_news_controller");
const endpoints = require("../endpoints.json");
const app = express();

app.use(express.json());

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.use("/api", (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
