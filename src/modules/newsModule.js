const {News} = require("../models");

module.exports.createNews = (newsData) => {
    new Promise((resolve, reject) => {
        News.create(newsData).then((news) => {
            resolve(news);
        }).catch((error) => reject(error));
    })
}

module.exports.getAllNews = () => {
    new Promise((resolve, reject) => {
        News.find().then((newsData) => {
            resolve(newsData);
        }).catch((error) => reject(error));
    })

}