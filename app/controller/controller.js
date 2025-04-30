const endpoints = require("../../endpoints.json")

const {
    selectTopics,
    selectArticle,
    selectArticles,
    selectArticleComments,
    insertArticleComment,
    updateArticle,
    deleteCommentRecord,
    selectUsers,
    selectUser,
    updateComment,
    insertArticle,
    deleteArticleRecord,
    insertTopic

} = require("../model/model")


exports.getDescription = (req, res, next) => {
    res.status(200).send({endpoints: endpoints})
}

exports.getTopics = (req, res, next) => {
    return selectTopics()
    .then(({rows}) => {
        res.status(200).send({topics: rows})
    })
}

exports.getArticle = (req, res, next) => {
    const {article_id} = req.params
    return selectArticle(article_id)
    .then(article => {
        res.status(200).send({article: article})
    })
    .catch(err => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    const queries = req.query
    return selectArticles(queries)
    .then(result => {
        res.status(200).send({articles: result[0], total_count: result[1][0].total_count})
    })
    .catch(err => {
        next(err)
    })
}

exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    const queries = req.query
    return selectArticleComments(article_id, queries)
    .then(({rows}) => {
        res.status(200).send({comments: rows})
    })
    .catch(err => {
        next(err)
    })
}

exports.postArticleComment = (req, res, next) => {
    const {article_id} = req.params
    const {username, body} = req.body
    return insertArticleComment(article_id, username, body)
    .then(({rows}) => {
        res.status(201).send({postedComment: rows[0]})
    })
    .catch(err => {
        next(err)
    })
}

exports.patchArticle = (req, res, next) => {
    const {article_id} = req.params
    const {inc_votes} = req.body
    if (!inc_votes || !(typeof inc_votes === "number")) {
        res.status(400).send({msg: "Bad request"})
    } else {
        return updateArticle(article_id, inc_votes)
        .then(({rows}) => {
            res.status(200).send({updatedArticle: rows[0]})
        })
        .catch(err => {
            next(err)
        })
    }
}

exports.deleteComment = (req, res, next) => {
    const {comment_id} = req.params
    return deleteCommentRecord(comment_id)
    .then(() => {
        res.status(204).send({})
    })
    .catch(err => {
        next(err)
    })
}

exports.getUsers = (req, res, next) => {
    return selectUsers()
    .then(({rows}) => {
        res.status(200).send({users: rows})
    })
    .catch(err => {
        next(err)
    })
}

exports.getUser = (req, res, next) => {
    const {username} = req.params
    return selectUser(username)
    .then(rows => {
        res.status(200).send({user: rows[0]})
    })
    .catch(err => {
        next(err)
    })
}

exports.patchComment = (req, res, next) => {
    const {comment_id} = req.params
    const {inc_votes} = req.body
    if (!inc_votes || !(typeof inc_votes === "number")) {
        res.status(400).send({msg: "Bad request"})
    } else {
        return updateComment(comment_id, inc_votes)
        .then(({rows}) => {
            res.status(200).send({updatedComment: rows[0]})
        })
        .catch(err => {
            next(err)
        })
    }
}

exports.postArticle = (req, res, next) => {
    const article = req.body
    return insertArticle(article)
    .then(({rows}) => {
        res.status(201).send({postedArticle: rows[0]})
    })
    .catch(err => {
        next(err)
    })
}

exports.deleteArticle = (req, res, next) => {
    const {article_id} = req.params
    return deleteArticleRecord(article_id)
    .then(({rows}) => {
        res.status(204).send({})
    })
    .catch(err => {
        next(err)
    })
}

exports.postTopic = (req, res, next) => {
    const topic = req.body
    return insertTopic(topic)
    .then(({rows}) => {
        res.status(200).send({postedTopic: rows[0]})
    })
    .catch(err => {
        next(err)
    })
}