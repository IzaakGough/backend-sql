const {convertTimestampToDate} = require("./utils")
const db = require("../connection")
const format = require('pg-format')



const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(`DROP TABLE IF EXISTS comments;`)
  .then(result => {
    return db.query(`DROP TABLE IF EXISTS articles;`)
  })
  .then(result => {
    return db.query(`DROP TABLE IF EXISTS users;`)
    .then(result => {
      return db.query('DROP TABLE IF EXISTS topics;')
    })
    .then(result => {
      return db.query(`CREATE TABLE topics 
      (
      slug VARCHAR(100) PRIMARY KEY,
      description VARCHAR(100) NOT NULL,
      img_url VARCHAR(1000) NOT NULL
      )
      ;`)
      .then(result => {
        return db.query(`CREATE TABLE users
            (
            username VARCHAR(100) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            avatar_url VARCHAR(1000) NOT NULL
            )
            ;`)
      })
      .then(result => {
        return db.query(`CREATE TABLE articles
          (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          topic VARCHAR(100) REFERENCES topics(slug),
          author VARCHAR(100) REFERENCES users(username),
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000) NOT NULL
          )
          ;`)
        .then(result => {
          return db.query(`CREATE TABLE comments
            (
            comment_id SERIAL PRIMARY KEY,
            article_id INT REFERENCES articles(article_id),
            body TEXT NOT NULL,
            votes INT DEFAULT 0,
            author VARCHAR(100) REFERENCES users(username),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ;`)
          .then(result => {
            const topicDataNest = topicData.map(obj => [obj.slug, obj.description, obj.img_url])
            const topicFormat = format(`
              INSERT INTO topics (slug, description, img_url)
              VALUES %L`, topicDataNest)
            return db.query(topicFormat)
            .then(result => {
              const userDataNest = userData.map(obj => [obj.username, obj.name, obj.avatar_url])
              const userFormat = format(`
                INSERT INTO users (username, name, avatar_url)
                VALUES %L`, userDataNest)
              return db.query(userFormat) 
              .then(result => {
                const articleDataNew = articleData.map(obj => convertTimestampToDate(obj))
                const articleDataNest = articleDataNew.map(obj => [
                  obj.title, 
                  obj.topic, 
                  obj.author, 
                  obj.body,
                  obj.created_at,
                  obj.votes,
                  obj.article_img_url
                ])
                const articleFormat = format(`
                  INSERT INTO articles (
                  title,
                  topic,
                  author,
                  body,
                  created_at,
                  votes,
                  article_img_url
                  )
                  VALUES %L
                  RETURNING *;
                  `, articleDataNest)
                  return db.query(articleFormat)
                .then(result => {
                  const data = result.rows.map(obj => [obj.article_id, obj.title]).flat()
                  const commentDataNew = commentData.map(obj => convertTimestampToDate(obj))
                    const commentDataNest = commentDataNew.map(obj => 
                      [
                        data[data.indexOf(obj.article_title) - 1],
                        obj.body,
                        obj.votes,
                        obj.author,
                        obj.created_at
                      ]

                    )
                    const commentFormat = format(`                    
                      INSERT INTO comments (
                      article_id,
                      body,
                      votes,
                      author,
                      created_at
                      )
                      VALUES %L
                      RETURNING *;
                      `, commentDataNest)
                      return db.query(commentFormat)
                      //.then(result => console.log(result))
              })
    
              }
              )
            })
          }) 
        })
      })
    })
  })
}
module.exports = seed;

















