const Test = require("supertest/lib/test");
const db = require("../../db/connection");

exports.fetchAllTopics = () => {
  return db.query("SELECT slug, description FROM topics").then((result) => {
    return result.rows;
  });
};

exports.fetchArticleById = (articleId) => {
  if (isNaN(Number(articleId))) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  return db
    .query(
      `SELECT 
        author, 
        title, 
        article_id, 
        body, 
        topic, 
        created_at, 
        votes, 
        article_img_url 
     FROM articles 
     WHERE article_id = $1`,
      [articleId],
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    });
};

exports.fetchAllArticles = (sort_by = "created_at", order = "desc") => {
  const validSortByFields = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrderValues = ["asc", "desc"];

  if (!validSortByFields.includes(sort_by)) {
    console.log(`Invalid sort_by detected: ${sort_by}`);
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Invalid sort key",
    });
  }

  if (!validOrderValues.includes(order)) {
    console.log(`Invalid order detected: ${order}`);
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Invalid order value",
    });
  }

  const queryStr = `
    SELECT 
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM 
      articles
    LEFT JOIN 
      comments ON comments.article_id = articles.article_id
    GROUP BY 
      articles.article_id
    ORDER BY 
      ${sort_by} ${order};
  `;

  return db.query(queryStr).then((result) => {
    return result.rows;
  });
};
