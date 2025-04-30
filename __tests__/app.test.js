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
      expect(body.article.author).toBe("butter_bridge")
      expect(body.article.title).toBe("Living in the shadow of a great man")
      expect(body.article.article_id).toBe(1)
      expect(body.article.body).toBe("I find this existence challenging")
      expect(body.article.topic).toBe("mitch")
      expect(body.article.created_at).toBe("2020-07-09T20:11:00.000Z")
      expect(body.article.votes).toBe(100)
      expect(body.article.article_img_url).toBe(
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
      expect(body.articles.length).not.toBe(0)
        body.articles.forEach(article => {
          expect(typeof article.author).toBe("string")
          expect(typeof article.title).toBe("string")
          expect(typeof article.article_id).toBe("number")
          expect(typeof article.topic).toBe("string")
          expect(typeof article.created_at).toBe("string")
          expect(typeof article.votes).toBe("number")
          expect(typeof article.article_img_url).toBe("string")
          expect(typeof article.comment_count).toBe("number")
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
  test("201: Responds with posted comment object when given username of user in database", () => {
    return request(app)
    .post("/api/articles/1/comments")
    .send({
      username: "butter_bridge",
      body: "test comment..."
    })
    .expect(201)
    .then(({body}) => {
      expect(body.postedComment.comment_id).toBe(19)
      expect(body.postedComment.article_id).toBe(1)
      expect(body.postedComment.body).toBe("test comment...")
      expect(body.postedComment.votes).toBe(0)
      expect(body.postedComment.author).toBe("butter_bridge")
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .post("/api/articles/10000000/comments")
    .send({
      username: "butter_bridge",
      body: "test comment..."
    })
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "ID does not exist"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .post("/api/articles/notAnId/comments")
    .send({
      username: "butter_bridge",
      body: "test comment..."
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
  test("400: Responds with error object when given body with incorrect fields", () => {
    return request(app)
    .post("/api/articles/1/comments")
    .send({})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  })
  test("400: Responds with error object when given body with correct fields, but incorrect values", () => {
    return request(app)
    .post("/api/articles/1/comments")
    .send({
      username: 1,
      body: 1
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  })
  test("400: Responds with error object when username of comment is not in the database", () => {
    return request(app)
    .post("/api/articles/1/comments")
    .send({
      username: "izaak",
      body: "test comment..."
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
})
})

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with updated article object when given positive number", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({inc_votes: 2})
    .expect(200)
    .then(({body}) => {
      expect(body.updatedArticle).toEqual( 
        {
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 102,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
        }
      )
    })
  })
  test("200: Responds with updated article object when given negative number", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({inc_votes: -2})
    .expect(200)
    .then(({body}) => {
      expect(body.updatedArticle).toEqual( 
        {
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: 'mitch',
          author: 'butter_bridge',
          body: 'I find this existence challenging',
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 98,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
        }
      )
    })
  })
  test("400: Responds with error object when body given has incorrect fields", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
  test("400: Responds with error object when body given has incorrect value type", () => {
    return request(app)
    .patch("/api/articles/1")
    .send({inc_votes: "one"})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .patch("/api/articles/10000000")
    .send({inc_votes: 1})
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({status: 404, msg: "Article does not exist"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .patch("/api/articles/notAnId")
    .send({inc_votes: 1})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
})

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with no content", () => {
    return request(app)
    .delete("/api/comments/1")
    .expect(204)
    .then(({body}) => {
      expect(body).toEqual({})
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .delete("/api/comments/10000000")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({status: 404, msg: "Comment does not exist"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .delete("/api/comments/notAnId")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
})

describe("GET /api/users", () => {
  test("200: Responds with an array of all user objects", () => {
    return request(app)
    .get("/api/users")
    .expect(200)
    .then(({body}) => {
      expect(body.users.length).toBe(4)
      body.users.forEach(user => {
        expect(typeof user.username).toBe("string")
        expect(typeof user.name).toBe("string")
        expect(typeof user.avatar_url).toBe("string")
      })
    })
  })
})

describe("GET /api/articles (sorting queries)", () => {
  test("200: Responds with articles sorted and ordered by given queries", () => {
    return request(app)
    .get("/api/articles?sort_by=article_id&order=asc")
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).not.toBe(0)
      body.articles.forEach(article => {
        expect(typeof article.author).toBe("string")
        expect(typeof article.title).toBe("string")
        expect(typeof article.article_id).toBe("number")
        expect(typeof article.topic).toBe("string")
        expect(typeof article.created_at).toBe("string")
        expect(typeof article.votes).toBe("number")
        expect(typeof article.article_img_url).toBe("string")
        expect(typeof article.comment_count).toBe("number")
        })
        expect(body.articles).toBeSortedBy("article_id", {
          descending: false
        })
    })
  })
  test("400: Responds with error object when given invalid sort_by query", () => {
    return request(app)
    .get("/api/articles?sort_by=cheese&order=asc")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual(
        {
          status: 400,
          msg: "Invalid query"
        }
      )
    })
  })
  test("400: Responds with error object when given invalid order query", () => {
    return request(app)
    .get("/api/articles?sort_by=article_id&order=cheese")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual(
        {
          status: 400,
          msg: "Invalid query"
          
        }
      )
    })
  })
})

describe("GET /api/articles (topic query)", () => {
  test("200: Responds with articles filtered by topic given", () => {
    return request(app)
    .get("/api/articles?topic=mitch")
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).not.toBe(0)
      body.articles.forEach(article => {
        expect(typeof article.author).toBe("string")
        expect(typeof article.title).toBe("string")
        expect(typeof article.article_id).toBe("number")
        expect(article.topic).toBe("mitch")
        expect(typeof article.created_at).toBe("string")
        expect(typeof article.votes).toBe("number")
        expect(typeof article.article_img_url).toBe("string")
        expect(typeof article.comment_count).toBe("number")
        })
    })
  })
  test("404: Responds with an error object if given a topic not in the database", () => {
    return request(app)
    .get("/api/articles?topic=cheese")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "Topic does not exist"
      })
    })
  })
  test("200: Responds with an empty array if given a valid topic with no articles", () => {
    return request(app)
    .get("/api/articles?topic=paper")
    .expect(200)
    .then(({body}) => {
      expect(body.articles).toEqual([])
    })
  })
  test("200: Topic query works when chained with sort_by and order queries", () => {
    return request(app)
    .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
    .expect(200)
    .then(({body}) => {
      expect(body.articles.length).not.toBe(0)
      body.articles.forEach(article => {
        expect(typeof article.author).toBe("string")
        expect(typeof article.title).toBe("string")
        expect(typeof article.article_id).toBe("number")
        expect(article.topic).toBe("mitch")
        expect(typeof article.created_at).toBe("string")
        expect(typeof article.votes).toBe("number")
        expect(typeof article.article_img_url).toBe("string")
        expect(typeof article.comment_count).toBe("number")
        })
      expect(body.articles).toBeSortedBy("article_id", {
        descending: false
      })
    })
  })
})

describe("GET /api/articles/:article_id (comment_count)", () => {
  test("200: Responds with the article object corresponding to the given article_id", () => {
    return request(app)
    .get("/api/articles/1")
    .expect(200)
    .then(({body}) => {
      expect(body.article.comment_count).toBe(11)
    })
  })
})

describe("GET /api/users/", () => {
  test("200: Responds with user object corresponding to given username", () => {
    return request(app)
    .get("/api/users/butter_bridge")
    .expect(200)
    .then(({body}) => {
      expect(body.user.username).toBe("butter_bridge")
      expect(body.user.name).toBe("jonny")
      expect(body.user.avatar_url).toBe("https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg")
    })
  });
  test("404: Responds with error object when given username not in database", () => {
    return request(app)
    .get("/api/users/izaak")
    .expect(404)
    .expect(({body}) => {
      expect(body).toEqual({
        status: 404,
        msg: "User does not exist"
    })
    })
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Responds with ", () => {
    return request(app)
    .patch("/api/comments/1")
    .send({inc_votes: 2})
    .expect(200)
    .then(({body}) => {
      expect(body.updatedComment).toEqual(
        {
          comment_id: 1,
          article_id: 9,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 18,
          author: 'butter_bridge',
          created_at: "2020-04-06T12:17:00.000Z"
        }
      )
    })
  });
  test("400: Responds with error object when body given has incorrect fields", () => {
    return request(app)
    .patch("/api/comments/1")
    .send({})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
  test("400: Responds with error object when body given has incorrect value type", () => {
    return request(app)
    .patch("/api/comments/1")
    .send({inc_votes: "one"})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
  test("404: Responds with error object when given a valid ID which is not in the database", () => {
    return request(app)
    .patch("/api/comments/10000000")
    .send({inc_votes: 1})
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({status: 404, msg: "Comment does not exist"})
    })
  })
  test("400: Responds with error object when given an invalid ID", () => {
    return request(app)
    .patch("/api/comments/notAnId")
    .send({inc_votes: 1})
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  })
});

describe("POST /api/articles", () => {
  test("201: Responds with posted article object", () => {
    return request(app)
    .post("/api/articles")
    .send({
      author: "butter_bridge",
      title: "test_title",
      body: "test_body",
      topic: "mitch",
      article_img_url: "test_url"
    })
    .expect(201)
    .then(({body}) => {
      expect(body.postedArticle.article_id).toBe(14)
      expect(body.postedArticle.title).toBe("test_title")
      expect(body.postedArticle.topic).toBe("mitch")
      expect(body.postedArticle.author).toBe("butter_bridge")
      expect(body.postedArticle.body).toBe("test_body")
      expect(typeof body.postedArticle.created_at).toBe("string")
      expect(body.postedArticle.votes).toBe(0)
      expect(body.postedArticle.article_img_url).toBe("test_url")
      expect(body.postedArticle.comment_count).toBe(0)
    })
  });
  test("400: Responds with error object if input body missing any fields except url", () => {
    return request(app)
    .post("/api/articles")
    .send({
      author: "butter_bridge",
      title: "test_title",
      topic: "mitch",
      article_img_url: "test_url"
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  });
  test("400: Responds with error object if given topic not in database", () => {
    return request(app)
    .post("/api/articles")
    .send({
      author: "butter_bridge",
      title: "test_title",
      body: "test_body",
      topic: "cheese",
      article_img_url: "test_url"
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  });
  test("400: Responds with error object if given author is not a user", () => {
    return request(app)
    .post("/api/articles")
    .send({
      author: "izaak",
      title: "test_title",
      body: "test_body",
      topic: "mitch",
      article_img_url: "test_url"
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  });
  test("201: Responds with posted article object with default img url when not provided", () => {
    return request(app)
    .post("/api/articles")
    .send({
      author: "butter_bridge",
      title: "test_title",
      body: "test_body",
      topic: "mitch"
    })
    .expect(201)
    .then(({body}) => {
      expect(body.postedArticle.article_id).toBe(14)
      expect(body.postedArticle.title).toBe("test_title")
      expect(body.postedArticle.topic).toBe("mitch")
      expect(body.postedArticle.author).toBe("butter_bridge")
      expect(body.postedArticle.body).toBe("test_body")
      expect(typeof body.postedArticle.created_at).toBe("string")
      expect(body.postedArticle.votes).toBe(0)
      expect(body.postedArticle.article_img_url).toBe("default_url")
      expect(body.postedArticle.comment_count).toBe(0)
    })
  });
});

describe("GET /api/articles (pagination)", () => {
  test("200: Responds with required articleswhen given limit and page queries", () => {
    return request(app)
    .get("/api/articles?limit=3&p=2")
    .expect(200)
    .then(({body}) => {
      expect(body.total_count).toBe(13)
      expect(body.articles).toEqual([
        {
          author: 'icellusedkars',
          title: 'Sony Vaio; or, The Laptop',
          article_id: 2,
          topic: 'mitch',
          created_at: "2020-10-16T05:03:00.000Z",
          votes: 0,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          comment_count: 0
        },
        {
          author: 'butter_bridge',
          title: 'Another article about Mitch',
          article_id: 13,
          topic: 'mitch',
          created_at: "2020-10-11T11:24:00.000Z",
          votes: 0,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          comment_count: 0
        },
        {
          author: 'butter_bridge',
          title: 'Moustache',
          article_id: 12,
          topic: 'mitch',
          created_at: "2020-10-11T11:24:00.000Z",
          votes: 0,
          article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
          comment_count: 0
        }
      ])
    })
  });
});

describe.only("GET /api/articles/:article_id/comments (pagination)", () => {
  test("200: Responds with required comments when given limit and page number", () => {
    return request(app)
    .get("/api/articles/1/comments?limit=3&p=1")
    .expect(200)
    .then(({body}) => {
      expect(body.comments).toEqual(
        [
          {
            "article_id": 1,
            "author": "icellusedkars",
            "body": "Fruit pastilles",
            "comment_id": 13,
            "created_at": "2020-06-15T10:25:00.000Z",
            "votes": 0
          },
          {
            "article_id": 1,
            "author": "icellusedkars",
            "body": "Lobster pot",
            "comment_id": 7,
            "created_at": "2020-05-15T20:19:00.000Z",
            "votes": 0
          },
          {
            "article_id": 1,
            "author": "icellusedkars",
            "body": "Delicious crackerbreads",
            "comment_id": 8,
            "created_at": "2020-04-14T20:19:00.000Z",
            "votes": 0
          }
        ]
      )
    })
  });
});

describe("POST /api/topics", () => {
  test("200: Reponds with posted topic", () => {
    return request(app)
    .post("/api/topics")
    .send({
      slug: "test_topic_name",
      description: "test_topic_description"
    })
    .expect(200)
    .then(({body}) => {
      expect(body.postedTopic).toEqual(
        {
          description: "test_topic_description",
          img_url: "",
          slug: "test_topic_name"
        }
      )
    })
  });
  test("400: Responds with error object if input body missing required fields", () => {
    return request(app)
    .post("/api/topics")
    .send({
      description: "test_topic_description"
    })
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad input body"})
    })
  });
});

describe("DELETE /api/articles/:article_id", () => {
  test("204: Responds with no content", () => {
    return request(app)
    .delete("/api/articles/1")
    .expect(204)
    .then(({body}) => {
      expect(body).toEqual({})
    })
  });
  test("404: Responds with error object when given out of range ID", () => {
    return request(app)
    .delete("/api/articles/1000000")
    .expect(404)
    .then(({body}) => {
      expect(body).toEqual({status: 404, msg: "Article does not exist"})
    })
  });
  test("400: Responds with error object when given invalid ID", () => {
    return request(app)
    .delete("/api/articles/notAnId")
    .expect(400)
    .then(({body}) => {
      expect(body).toEqual({msg: "Bad request"})
    })
  });
});
