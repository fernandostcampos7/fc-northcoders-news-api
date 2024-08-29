const articles = require("../../db/data/test-data/articles");
const { fetchAllTopics, fetchArticleById } = require("../models/nc_news_model");

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err); //Pass errors to error-handling middleware
    });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  console.log("Controller received article_id:", article_id);

  fetchArticleById(article_id)
    .then((article) => {
      console.log("Article found sucessfully");
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
