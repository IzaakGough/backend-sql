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
    SELECT articles.*, 
    COUNT(comments.comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN
    comments on articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY
    articles.article_id
    ;
    `
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





// `
//         SELECT * FROM articles
//         WHERE article_id = $1
//         ;`








exports.selectArticles = (queries) => {

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
    `
    const queryArr = []
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

    //console.log(queryStr[317])

    if (queries.topic) {
        queryArr.push(queries.topic)
        queryStr = queryStr.slice(0,317) + "WHERE articles.topic = $1" + queryStr.slice(317,) 
    }

    if (queries.sort_by && validCols.includes(queries.sort_by)) {
        sort_by = queries.sort_by
    } else if (queries.sort_by && !validCols.includes(queries.sort_by)) {
        return Promise.reject({
            status: 400,
            msg: "Invalid query"
        })
    } 

    if (queries.order && validOrders.includes(queries.order.toUpperCase())) {
        order = queries.order
    } else if (queries.order && !validOrders.includes(queries.order.toUpperCase())) {
        return Promise.reject({
            status: 400,
            msg: "Invalid query"
        })
    }
    
    queryStr += `ORDER BY ${sort_by}`
    queryStr += ` ${order.toUpperCase()};`

    return db.query(
        queryStr
    , queryArr)
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

exports.insertArticleComment = (id, username, body) => {
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
                msg: "ID does not exist"
            })
        } else {
            return db.query(
                `
                INSERT INTO comments
                (article_id, author, body)
                VALUES 
                ($1, $2, $3)
                RETURNING *;
                `
            , [id, username, body])
        }
    })

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
                msg: "Article does not exist"
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
                msg: "Comment does not exist"
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




























