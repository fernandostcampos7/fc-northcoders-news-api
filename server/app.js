const express = require("express");
const { getAllTopics } = require("./controllers/nc_news_controller");
const app = express();

app.get("/api/topics", getAllTopics);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
