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
      expect(body.length).toBe(3)
      body.forEach(obj => {
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
  test.only("200: Responds with an array of all article objects", () => {
    return request(app)
    .get("/api/articles")
    .expect(200)
    .then(({body}) => {
      expect(body.length).toBe(13)
    })
  })
})