const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};


exports.createRef = (articles) => {
  if (articles.length === 0){
    return {}
  }
  let result = {}
  articles.forEach(article => result[article.title] = article.article_id)
  return result
};


