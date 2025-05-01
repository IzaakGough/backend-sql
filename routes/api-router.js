const apiRouter = require("express").Router();
const usersRouter = require("./users-router");
const commentsRouter = require("./comments-router")
const topicsRouter = require("./topics-router");
const articlesRouter = require("./articles-router");
const {getDescription} = require("../app/controller/controller")

apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);

apiRouter.get("/", getDescription);

module.exports = apiRouter;