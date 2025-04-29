const express = require("express")
const app = express();
const db = require("../db/connection")

const {
    getDescription,
    getTopics,
    getArticle,
    getArticles,
    getArticleComments,
    postArticleComment,
    patchArticle,
    deleteComment,
    getUsers

} = require("./controller/controller")

app.use(express.json())


app.get("/api", getDescription)

app.get("/api/topics", getTopics)

app.get("/api/articles/:article_id", getArticle)

app.get("/api/articles", getArticles)

app.get("/api/articles/:article_id/comments", getArticleComments)

app.post("/api/articles/:article_id/comments", postArticleComment)

app.patch("/api/articles/:article_id", patchArticle)

app.delete("/api/comments/:comment_id", deleteComment)

app.get("/api/users", getUsers)

// 400 error - invalid id
app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({msg: "Bad request"})
    } else next(err);
})

// 400 error - id out of range
app.use((err, req, res, next) => {
    if (err.code === "23503") {
        res.status(404).send({msg: "ID out of range"})
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




















