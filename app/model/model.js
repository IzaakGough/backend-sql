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

exports.selectArticles = () => {
    return db.query(
        `
        SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN 
        comments ON articles.article_id = comments.article_id
        GROUP BY 
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url
        ORDER BY articles.created_at DESC;
        `
    )
}

exports.selectArticleComments = (id) => {
    return db.query(
        `
        SELECT * FROM articles
        WHERE article_id = $1;
        `
    , [id])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({
                status: 404,
                msg: "Invalid ID"
            })
        } else {
            return db.query(
                `
                SELECT * FROM comments
                WHERE article_id = $1
                ORDER BY created_at DESC;
                `
            , [id])
        }
    })
}

exports.insertArticleComment = (id, username, created_at, body) => {
    return db.query(
        `
        INSERT INTO comments
        (article_id, author, created_at, body)
        VALUES 
        ($1, $2, $3, $4)
        RETURNING author, body;
        `
    , [id, username, created_at, body])
}

exports.updateArticle = (id, incVotes) => {
    return db.query(
        `
        SELECT * FROM articles
        WHERE article_id = $1;
        `
    , [id])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({
                status: 404,
                msg: "Invalid ID"
            })
        } else {
            return db.query(
                `
                UPDATE articles
                SET votes = votes + $2
                WHERE article_id = $1
                RETURNING *;
                `
            , [id, incVotes])
        }
    })
}





























