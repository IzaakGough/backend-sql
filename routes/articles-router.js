const articlesRouter = require("express").Router();
const {getArticles,
    postArticle,
    getArticle,
    deleteArticle,
    patchArticle,
    getArticleComments,
    postArticleComment
} = require("../app/controller/controller")

articlesRouter
  .route("/")
  .get(getArticles)
  .post(postArticle)

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .delete(deleteArticle)
  .patch(patchArticle)

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment)

module.exports = articlesRouter;