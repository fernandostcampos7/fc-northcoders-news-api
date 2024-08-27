const { fetchAllTopics } = require("../models/nc_news_model");

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err); //Pass errors to error-handling middleware
    });
};
