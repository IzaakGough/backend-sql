
const endpoints = require("../../endpoints.json")

const {
    selectTopics,
    selectArticle,
    selectArticles,
    selectArticleComments,
    insertArticleComment,
    updateArticle,
    deleteCommentRecord

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
        res.status(200).send(article)
    })
    .catch(err => {
        next(err)
    })
}

exports.getArticles = (req, res, next) => {
    return selectArticles()
    .then(({rows}) => {
        res.status(200).send({articles: rows})
    })
}

exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    return selectArticleComments(article_id)
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
    if (!username || !body || !(typeof username === "string") || !(typeof body === "string")) {
        res.status(400).send({msg: "Bad request"})
    } else {
        const created_at = new Date()
        return insertArticleComment(article_id, username, created_at, body)
        .then(({rows}) => {
            res.status(201).send(rows[0])
        })
        .catch(err => {
            next(err)
        })
    }
}

exports.patchArticle = (req, res, next) => {
    const {article_id} = req.params
    const {inc_votes} = req.body
    if (!inc_votes || !(typeof inc_votes === "number")) {
        res.status(400).send({msg: "Bad request"})
    } else {
        return updateArticle(article_id, inc_votes)
        .then(({rows}) => {
            res.status(200).send(rows[0])
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

