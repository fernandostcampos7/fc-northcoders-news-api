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
        console.log(res.body, "{articles}");
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

          console.log(currentArticleDate, nextArticleDate);

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
