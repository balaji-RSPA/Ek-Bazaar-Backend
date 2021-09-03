const { News } = require("../models");

module.exports.createNews = newsData =>
  new Promise((resolve, reject) => {
    News.create(newsData)
      .then(news => {
        resolve(news);
      })
      .catch(error => reject(error));
  });

module.exports.getAllNews = (searchQuery, skip, limit) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery ? {
      $or: [
        { news: { $regex: searchQuery, $options: 'i' } },
      ]
    } : {};
    News.find(searchQry)
      .skip(skip)
      .limit(limit)
      .then(newsData => {
        resolve(newsData);
      })
      .catch(error => reject(error));
  });

module.exports.getNews = query =>
  new Promise((resolve, reject) => {
    News.findOne(query)
      .then(news => {
        resolve(news);
      })
      .catch(error => reject(error));
  });

module.exports.updateNews = (query, data) =>
  new Promise((resolve, reject) => {
    News.findOneAndUpdate(query, data, {
      new: true
    })
      .then(updatedNews => {
        console.log(updatedNews);
        resolve(updatedNews);
      })
      .catch(error => reject(error));
  });

module.exports.deleteNews = query =>
  new Promise((resolve, reject) => {
    News.deleteOne(query)
      .then(deleteNews => {
        console.log({ deleteNews });
        resolve(deleteNews);
      })
      .catch(error => reject(error));
  });
