const { LanguageTemplate } = require('../models')

module.exports.createLanguageTemplate = (query) => new Promise((resolve, reject) => {
    LanguageTemplate.create(newData)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});