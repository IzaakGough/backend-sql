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

exports.selectArticles = (sortQuery, orderQuery) => {
    let queryStr = `
    SELECT
    articles.author,
    articles.title,
    articles.article_id,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    COUNT(comments.comment_id)::INT AS comment_count
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
    ORDER BY
    `
    const validCols = 

    [
        "author",
        "title",
        "article_id",
        "body",
        "topic",
        "created_at",
        "votes",
        "article_img_url"
    ]

    const validOrders = ["ASC", "DESC"]

    let sort_by = "created_at"
    let order = "DESC"

    if (sortQuery && validCols.includes(sortQuery)) {
        sort_by = sortQuery
    } else if (sortQuery && !validCols.includes(sortQuery)) {
        return Promise.reject({
            status: 400,
            msg: "Invalid query"
        })
    } 

    if (orderQuery && validOrders.includes(orderQuery.toUpperCase())) {
        order = orderQuery
    } else if (orderQuery && !validOrders.includes(orderQuery.toUpperCase())) {
        return Promise.reject({
            status: 400,
            msg: "Invalid query"
        })
    }
    
    queryStr += ` ${sort_by}`
    queryStr += ` ${order.toUpperCase()};`

    return db.query(
        queryStr
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

exports.deleteCommentRecord = (id) => {
    return db.query(
        `
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *
        ;`
    , [id])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({
                status: 404,
                msg: "Invalid ID"
            })
        } else {
            return rows
        }
    })
}

exports.selectUsers = () => {
    return db.query(
        `
        SELECT * FROM users;
        `
    )
}




























