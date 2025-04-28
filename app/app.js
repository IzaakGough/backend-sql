const express = require("express")
const app = express();
const db = require("../db/connection")

const {
    getDescription,
    getTopics

} = require("./controller/controller")

app.use(express.json())


app.get("/api", getDescription)

app.get("/api/topics", getTopics)





module.exports = app




















