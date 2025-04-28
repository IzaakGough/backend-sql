const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const app = require("../app/app")
const request = require("supertest")

/* Set up your beforeEach & afterAll functions here */

beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end()
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
  test.only("200: Responds with an array of topic objects each of which have a slug and description property", () => {
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
  test.only("404: Responds with error object if non-existent endpoint given", () => {
    return request(app)
    .get("/notARoute")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({status: 404, msg: "Non-existent endpoint"})
    })
  })

})