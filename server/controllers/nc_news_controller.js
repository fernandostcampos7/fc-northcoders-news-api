const articles = require("../../db/data/test-data/articles");
const {
  fetchAllTopics,
  fetchArticleById,
  fetchAllArticles,
} = require("../models/nc_news_model");

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

  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const {sort_by, order} = req.query;
  fetchAllArticles(sort_by, order)
    .then((articles) => {
      console.log("All the articles gathered successfully");
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};
