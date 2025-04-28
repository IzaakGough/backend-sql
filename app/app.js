const express = require("express")
const app = express();
const db = require("../db/connection")

const {
    getDescription
} = require("./controller/controller")

app.use(express.json())


app.get("/api", getDescription)








module.exports = app




















