const request = require("supertest");
const app = require("../server/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("Get /api/topics", () => {
  test("Should respond with status 200 and an array of topic objects, each with slug and description proprities", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const { body } = res;
        expect(Array.isArray(body.topics)).toBe(true);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("'Get /api", () => {
  test("Status should be 200 responding with all available API endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Status 200, responds with the correct article for a valid ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const { article } = res.body;
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });

  test("status 404, responds with an error if the article is not found", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Article not found" });
      });
  });

  test("status 400, responds with an error if article ID is invalid", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Bad Request" });
      });
  });
});

describe("GET /api/articles", () => {
  test("Should return status 200 and respond with articles array of articles objects based on specified proprieties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const { articles } = res.body;

        expect(Array.isArray(articles)).toBe(true);
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });

        for (let i = 0; i < articles.length - 1; i++) {
          const currentArticleDate = new Date(articles[i].created_at).getTime();
          const nextArticleDate = new Date(
            articles[i + 1].created_at,
          ).getTime();

          expect(currentArticleDate).toBeGreaterThanOrEqual(nextArticleDate);
        }
      });
  });

  test("Status 400, error if an invalid sort_by and order values", () => {
    const invalidSortByRequest = request(app)
      .get("/api/articles?sort_by=invalid_field")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Bad Request: Invalid sort key" });
      });
    const invalidOrderRequest = request(app)
      .get("/api/articles?sort_by=created_at&order=invalidOrder")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Bad Request: Invalid order value" });
      });
    return Promise.all([invalidSortByRequest, invalidOrderRequest]);
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status 200, responds with an array of comments for a given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const { comments } = res.body;
        expect(Array.isArray(comments)).toBe(true);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });

  test("Status 400, responds with an error when provided an invalid article_id", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Bad Request: Invalid article_id" });
      });
  });

  test("Status 404, responds with an error when comment not displayed due to id not found", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Comment not found" });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status 201, responds with a commet posted to one valid article id", () => {
    const newComment = {
      username: "icellusedkars",
      body: "This is the icellusedkars new comment!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        const { comment } = res.body;
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("votes");
        expect(comment).toHaveProperty("created_at");
        expect(comment).toHaveProperty("author", newComment.username);
        expect(comment).toHaveProperty("body", newComment.body);
        expect(comment).toHaveProperty("article_id", 1);
      });
  });

  test("Status 400, error if article_id is not valid", () => {
    const newComment = {
      username: "tickle122",
      body: "This is a test comment",
    };
    return request(app)
      .post("/api/articles/invalid_id/comments")
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({ msg: "Bad Request: Invalid article_id" });
      });
  });

  test("Status 400, error if username or body is missing", () => {
    const invalidNewComment = {
      username: "tickle122",
      // body missing
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(invalidNewComment)
      .expect(400)
      .then((res) => {
        expect(res.body).toEqual({
          msg: "Bad Request: Missing required fields",
        });
      });
  });

  test("Status 422, error if username does not exist", () => {
    const newComment = {
      username: "non-existent-user",
      body: "This is a test comment",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(422)
      .then((res) => {
        expect(res.body).toEqual({
          msg: "Unprocessable Entity: Username does not exist",
        });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("Status 200: responds with updated article when provided with valid article_id and inc_votes", () => {
    const updateVotes = { inc_votes: 1 }; // You're adding 1 vote here

    return request(app)
      .get("/api/articles/1") // First, get the current votes for the article
      .then((res) => {
        const initialVotes = res.body.article.votes; // Store the initial votes (likely 200)

        return request(app)
          .patch("/api/articles/1") // Now, update the votes
          .send(updateVotes)
          .expect(200)
          .then((response) => {
            const { article } = response.body;
            expect(article).toHaveProperty("article_id", 1);
            expect(article).toHaveProperty("votes");

            // Expect the new vote count to be initialVotes + inc_votes
            expect(article.votes).toBe(initialVotes + updateVotes.inc_votes);
          });
      });
  });

  test("Status 400: responds with error when inc_votes is missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request - inc_votes required");
      });
  });

  test("Status 400: responds with error when inc_votes is not a number", () => {
    const updateVotes = { inc_votes: "ten" };

    return request(app)
      .patch("/api/articles/1")
      .send(updateVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request - inc_votes required");
      });
  });

  test("Status 404: responds with error when article_id does not exist", () => {
    const updateVotes = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/9999")
      .send(updateVotes)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article not found");
      });
  });

  test("Status 400: responds with error when article_id is invalid", () => {
    const updateVotes = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/invalid_id")
      .send(updateVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad request - Invalid article_id");
      });
  });
});

describe("Patch /api/articles/:article_id/votes", () => {
  test("200: updates vote count and returns the updated article", () => {
    return request(app)
      .patch("/api/articles/1/votes")
      .send({ inc_votes: 1 })
      .expect(200)
      .then((response) => {
       
        expect(response.body.article.votes).toBe(101);
      });
  });

  test("400: responds with error if inc_votes is missing or invalid", () => {
    return request(app)
      .patch("/api/articles/1/votes")
      .send({})
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request - inc_votes must be a number",
        );
      });
  });

  test("404: responds with error if the article_id does not exist", () => {
    return request(app)
      .patch("/api/articles/999/votes")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Article not found");
      });
  });

  test("400: responds with error if inc_votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1/votes")
      .send({ inc_votes: "invalid_data" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          "Bad request - inc_votes must be a number",
        );
      });
  });

  test("404: responds with error if the article_id is not valid", () => {
    return request(app)
      .patch("/api/articles/invalid-id/votes")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not Found - Invalid article ID");
      });
  });
});
