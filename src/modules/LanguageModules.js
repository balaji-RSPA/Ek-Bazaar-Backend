const { Languages } = require("../models");

module.exports.addLanguage = (data) =>
    new Promise((resolve, reject) => {
        Languages.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.getLanguage = (data) =>
    new Promise((resolve, reject) => {
        Languages.find({}, { createdAt: 0, updatedAt :0})
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })