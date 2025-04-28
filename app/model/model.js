const db = require("../../db/connection")


exports.selectTopics = () => {
    return db.query(
        `
        SELECT slug, description FROM topics
        ;`
    )
}

exports.selectArticle = (id) => {
    return db.query(
        `
        SELECT * FROM articles
        WHERE article_id = $1
        ;`
    , [id])
    .then(({rows}) => {
        const article = rows[0]
        if (!article) {
            return Promise.reject({
                status: 404,
                msg: "Invalid ID"
            })
        } else {
            return article
        }
    })
}

































