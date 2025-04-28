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























app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "Internal Server Error" });
});


app.all(/(.*)/, (req, res) => {
    res.status(404).send({status: 404, msg: "Non-existent endpoint"})
})





module.exports = app




















