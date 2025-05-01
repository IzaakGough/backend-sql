const express = require("express")
const app = express();
const db = require("../db/connection")
const apiRouter = require("../routes/api-router")
app.use(express.json())
app.use("/api", apiRouter)

// 400 error - bad request
app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({msg: "Bad request"})
    } else next(err);
})

// 400 error - Id does not exist 
app.use((err, req, res, next) => {
    if (err.code === "23503") {
        res.status(400).send({msg: "Bad input body"})
    } else next(err);
})

// 400 error 
app.use((err, req, res, next) => {
    if (err.code === "23502") {
        res.status(400).send({msg: "Bad input body"})
    } else next(err);
})

// 404 error
app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({status: err.status, msg: err.msg});
    } else next(err);
})

// 500 error
app.use((err, req, res, next) => {
    console.log(err, "500 error log");
    res.status(500).send({ msg: "Internal Server Error" });
});

// Handling all invalid url's
app.all(/(.*)/, (req, res) => {
    res.status(404).send({status: 404, msg: "Non-existent endpoint"})
})

module.exports = app




















