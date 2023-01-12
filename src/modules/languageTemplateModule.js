const { reject } = require('lodash');
const { LanguageTemplate, LanguageTemplateL4, LanguageTemplateL5 } = require('../models')

module.exports.createLanguageTemplate = (data) => new Promise((resolve, reject) => {
    LanguageTemplate.create(data)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.createLanguageTemplateL4 = (data) => new Promise((resolve, reject) => {
    LanguageTemplateL4.create(data)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.createLanguageTemplateL5 = (data) => new Promise((resolve, reject) => {
    LanguageTemplateL5.create(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

module.exports.getChatAllTemplates = (query, range) => new Promise((resolve, reject) => {
    const { skip, limit } = range
    LanguageTemplate.find(query)
        .skip(skip || 0)
        .limit(limit || 10)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.getL4ChatAllTemplates = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL4.find(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

module.exports.getL5ChatAllTemplates = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL5.find(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.getChatTemplate = (query) => new Promise((resolve, reject) => {
    LanguageTemplate.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.getL4ChatTemplate = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL4.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message))
})

module.exports.getL5ChatTemplate = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL5.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

module.exports.updateLanguageTemplate = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplate.updateOne(query, { $set: data })
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.updateL4LanguageTemplate = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateL4.updateOne(query, {$set: data})
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message))
})

module.exports.updateL5LanguageTemplate = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateL5.updateOne(query,{$set: data})
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})