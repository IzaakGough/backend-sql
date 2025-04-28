
const endpoints = require("../../endpoints.json")

const {
    selectTopics
} = require("../model/model")


exports.getDescription = (req, res, next) => {
    res.status(200).send({endpoints: endpoints})
}

exports.getTopics = (req, res, next) => {
    return selectTopics()
    .then(({rows}) => {
        console.log(rows)
        res.status(200).send(rows)
    })
}