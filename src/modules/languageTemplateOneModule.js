const { LanguageTemplateOne } = require('../models');

module.exports.createLanguageTemplateOne = (data) => new Promise((resolve, reject) => {
    LanguageTemplateOne.create(data)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.getChatAllTemplatesOne = (query, range) => new Promise((resolve, reject) => {
    const { skip, limit } = range
    LanguageTemplateOne.find(query)
        .skip(skip || 0)
        .limit(limit || 10)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.getChatTemplateOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateOne.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.updateLanguageTemplateOne = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateOne.updateOne(query, { $set: data })
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});