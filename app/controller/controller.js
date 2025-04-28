
const endpoints = require("../../endpoints.json")

const {
    selectTopics,
    selectArticle,
    selectArticles,
    selectArticleComments

} = require("../model/model")


exports.getDescription = (req, res, next) => {
    res.status(200).send({endpoints: endpoints})
}

exports.getTopics = (req, res, next) => {
    return selectTopics()
    .then(({rows}) => {
        res.status(200).send(rows)
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
        res.status(200).send(rows)
    })
}

exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    return selectArticleComments(article_id)
    .then(({rows}) => {
        res.status(200).send(rows)
    })
    .catch(err => {
        next(err)
    })
}