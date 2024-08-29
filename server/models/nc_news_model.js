const db = require("../../db/connection");

exports.fetchAllTopics = () => {
  return db.query("SELECT slug, description FROM topics").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleByID = (articleId) => {
  return db
    .query(
      "SELECT  author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1",
      [articleId]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }

      return result.rows[0];
    });
};
