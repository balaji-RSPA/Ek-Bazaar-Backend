const { News } = require("../models");

/**create news*/
module.exports.createNews = newsData =>
  new Promise((resolve, reject) => {
    News.create(newsData)
      .then(news => {
        resolve(news);
      })
      .catch(error => reject(error));
  });

/**get all News*/
module.exports.getAllNews = (searchQuery) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery.search
      ? searchQuery.search
      : {};
    News.find(searchQry)
      // .skip(skip)
      // .limit(limit)
      .sort({ updatedAt: -1 })
      .then(newsData => {
        resolve(newsData);
      })
      .catch(error => reject(error));
  });

/**get specific news*/
module.exports.getNews = query =>
  new Promise((resolve, reject) => {
    News.findOne(query)
      .then(news => {
        resolve(news);
      })
      .catch(error => reject(error));
  });

/**update news*/
module.exports.updateNews = (query, data) =>
  new Promise((resolve, reject) => {
    News.findOneAndUpdate(query, data, {
      new: true
    })
      .then(updatedNews => {
        resolve(updatedNews);
      })
      .catch(error => reject(error));
  });

/**delete news*/
module.exports.deleteNews = query =>
  new Promise((resolve, reject) => {
    News.deleteMany(query)
      .then(deleteNews => {
        resolve(deleteNews);
      })
      .catch(error => reject(error));
  });
