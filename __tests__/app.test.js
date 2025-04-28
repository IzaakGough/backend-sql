const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const app = require("../app/app")
const request = require("supertest")
const {convertTimestampToDate} = require("../db/seeds/utils")
require("jest-sorted")

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end()
})

test("404: Responds with error object if non-existent endpoint given", () => {
  return request(app)
  .get("/notARoute")
  .expect(404)
  .then(({body}) => {
    expect(body).toEqual({status: 404, msg: "Non-existent endpoint"})
  })
})


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});


describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects each of which have a slug and description property", () => {
    return request(app)
    .get("/api/topics")
    .expect(200)
    .then(({body}) => {
      expect(body.topics.length).toBe(3)
      body.topics.forEach(obj => {
        expect(typeof obj.slug).toBe("string")
        expect(typeof obj.description).toBe("string")
      })
    })
  })
})


describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the article object corresponding to the given article_id", () => {
    return request(app)
    .get("/api/articles/1")
    .expect(200)
    .then(({body}) => {
      expect(body.author).toBe("butter_bridge")
      expect(body.title).toBe("Living in the shadow of a great man")
      expect(body.article_id).toBe(1)
      expect(body.body).toBe("I find this existence challenging")
      expect(body.topic).toBe("mitch")
      expect(body.created_at).toBe("2020-07-09T20:11:00.000Z")
      expect(body.votes).toBe(100)
      expect(body.article_img_url).toBe(
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
      )
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .get("/api/articles/10000000")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "Invalid ID"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .get("/api/articles/notAnId")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
})

describe("GET /api/articles", () => {
  test("200: Responds with an array of all article objects", () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).toBe(13)
        body.articles.forEach(article => {
          expect(typeof article.author).toBe("string")
          expect(typeof article.title).toBe("string")
          expect(typeof article.article_id).toBe("number")
          expect(typeof article.topic).toBe("string")
          expect(typeof article.created_at).toBe("string")
          expect(typeof article.votes).toBe("number")
          expect(typeof article.article_img_url).toBe("string")
          expect(typeof article.comment_count).toBe("string")
        })
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true
        })
    })
  })
})

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with array of comment objects for article with corresponding id", () => {
    return request(app)
    .get("/api/articles/1/comments")
    .expect(200)
    .then(({body}) => {
      expect(body.comments.length).toBe(11)
      body.comments.forEach(comment => {
        expect(typeof comment.comment_id).toBe("number")
        expect(typeof comment.votes).toBe("number")
        expect(typeof comment.created_at).toBe("string")
        expect(typeof comment.author).toBe("string")
        expect(typeof comment.body).toBe("string")
        expect(typeof comment.article_id).toBe("number")
      })
      expect(body.comments).toBeSortedBy("created_at", {
        descending: true
      })
    })
  })
  test("200: Responds with an empty array when given valid article which has no comments", () => {
    return request(app)
    .get("/api/articles/2/comments")
    .expect(200)
    .then(({body}) => {
      expect(body.comments).toEqual([])
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .get("/api/articles/10000000/comments")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "Invalid ID"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .get("/api/articles/notAnId/comments")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
})

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with posted comment object", () => {
    return request(app)
    .post("/api/articles/1/comments")
    .send({
      username: "testname",
      body: "test comment..."
    })
    .expect(201)
    .then(({body}) => {
      expect(body).toEqual({
        username: "testname",
        body: "test comment..."
      })
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .post("/api/articles/10000000/comments")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "Invalid ID"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .post("/api/articles/notAnId/comments")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
})