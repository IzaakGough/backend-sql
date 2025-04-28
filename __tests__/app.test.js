const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
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
  test.skip("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
