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
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Invalid sort key",
    });
  }

  if (!validOrderValues.includes(order)) {
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

exports.fetchCommentsByArticleId = (article_id) => {
  const id = Number(article_id);
  if (isNaN(id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Invalid article_id",
    });
  }

  const queryStr = `SELECT   comment_id,
  votes,
  created_at,
  author,
  body,
  article_id  FROM comments WHERE article_id = $1`;

  const queryValues = [article_id];

  return db.query(queryStr, queryValues).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Comment not found" });
    }
    return result.rows;
  });
};

exports.insertCommentByArticleId = (article_id, newComment) => {
  const { username, body } = newComment;

  if (isNaN(Number(article_id))) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Invalid article_id",
    });
  }

  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Missing required fields",
    });
  }

  const userQuery = "SELECT username FROM users WHERE username = $1";

  return db.query(userQuery, [username]).then((userResult) => {
    if (userResult.rows.length === 0) {
      return Promise.reject({
        status: 422,
        msg: "Unprocessable Entity: Username does not exist",
      });
    }

    const queryStr = `INSERT INTO comments (article_id, author, body)
  VALUES ($1, $2, $3)
  RETURNING comment_id, votes, created_at, author, body, article_id`;

    const queryValues = [article_id, username, body];

    return db.query(queryStr, queryValues).then((result) => {
      return result.rows[0];
    });
  });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad request - inc_votes required",
    });
  }

  const queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING article_id, title, body, topic, author, created_at, votes, article_img_url;
  `;
  const queryValues = [inc_votes, article_id];

  return db.query(queryStr, queryValues).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "Article not found",
      });
    }
    return result.rows[0];
  });
};

exports.updateArticleVoteCount = (article_id, inc_votes) => {
  // Check if article_id is a valid number
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 404,
      msg: "Not Found - Invalid article ID",
    });
  }

  // Validate inc_votes
  if (typeof inc_votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad request - inc_votes must be a number",
    });
  }

  const queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
  `;
  const queryValues = [inc_votes, article_id];

  return db.query(queryStr, queryValues).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return result.rows[0];
  });
};

