const db = require("../../db/connection")
const { sort } = require("../../db/data/test-data/articles")


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

exports.selectArticles = (queries) => {
    let queryStr = ``
    let queryStrFirst = 
    `
    SELECT articles.author,
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
    `
    let queryStrSecond = 
    `GROUP BY 
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

    const {limit = 10, p = 0} = queries

    queryArr.push(limit, p)

    let articlesPromise
    let countPromise

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

    if (queries.topic) {
        return db.query(
            `
            SELECT * FROM topics
            WHERE slug = $1
            `
        , [queries.topic])
        .then(({rows}) => {
            if (!rows.length) {
                return Promise.reject({status: 404, msg: "Topic does not exist"})
            } else {
                queryArr.push(queries.topic)
                queryStr += queryStrFirst + ` WHERE articles.topic = $3 ` + queryStrSecond
                queryStr += ` ORDER BY ${sort_by} ${order.toUpperCase()}`
                queryStr += ` LIMIT $1 OFFSET $2;`
                articlesPromise = db.query(queryStr, queryArr)
                countPromise = db.query(
                    `
                    SELECT COUNT(*)::INT AS total_count
                    FROM articles
                    WHERE topic = $1;
                    `
                , [queries.topic])
                return Promise.all([articlesPromise, countPromise])
                .then(result => {
                    return [result[0].rows, result[1].rows]
                })
            }
        })
    } else {
        queryStr += queryStrFirst + queryStrSecond
        queryStr += ` ORDER BY ${sort_by} ${order.toUpperCase()}`
        queryStr += ` LIMIT $1 OFFSET $2;`
        articlesPromise = db.query(queryStr, queryArr)
    }

    countPromise = db.query( `SELECT COUNT(*)::INT AS total_count FROM articles;`)
    return Promise.all([articlesPromise, countPromise])
    .then(result => {
        return [result[0].rows, result[1].rows]
    })
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

exports.selectUser = (username) => {
    return db.query(
        `
        SELECT * FROM users
        WHERE username = $1;
        `
    , [username])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({
                status: 404,
                msg: "User does not exist"
            })
        } else {
            return rows
        }
    })
}

exports.updateComment = (id, incVotes) => {
    return db.query(
        `
        SELECT * FROM comments
        WHERE comment_id = $1;
        `
    , [id])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({
                status: 404,
                msg: "Comment does not exist"
            })
        } else {
            return db.query(
                `
                UPDATE comments
                SET votes = votes + $2
                WHERE comment_id = $1
                RETURNING *;
                `
            , [id, incVotes])
        }
    })
}

exports.insertArticle = (article) => {
    const {author, title, body, topic, article_img_url = "default_url"} 
    = article

        return db.query(
            `
            INSERT INTO articles
            (author, title, body, topic, article_img_url)
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING *;
            `
        , [author, title, body, topic, article_img_url])
        .then(({rows}) => {
            const {article_id} = rows[0]
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
            , [article_id])
        })
}

exports.deleteArticleRecord = (id) => {
    return db.query(
        `
        SELECT * FROM articles
        WHERE article_id = $1
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
                DELETE FROM comments
                WHERE article_id = $1
                RETURNING *;
                `
            , [id])
            .then(({rows}) => {
                return db.query(
                    `
                    DELETE FROM articles
                    WHERE article_id = $1
                    RETURNING *;
                    `
                , [id])
            })
        }
    })
}




























