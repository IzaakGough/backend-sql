
const endpoints = require("../../endpoints.json")

const {
    selectTopics,
    selectArticle
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