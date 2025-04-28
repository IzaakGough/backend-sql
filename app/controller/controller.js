
const endpoints = require("../../endpoints.json")



exports.getDescription = (req, res, next) => {
    res.status(200).send({endpoints: endpoints})
}