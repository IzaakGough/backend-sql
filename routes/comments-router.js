const commentsRouter = require("express").Router();
const {deleteComment, patchComment} = require("../app/controller/controller")

commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(patchComment)
 

module.exports = commentsRouter;