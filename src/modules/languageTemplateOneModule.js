const { LanguageTemplateOne, LanguageTemplateL4One, LanguageTemplateL5One } = require('../models');

module.exports.createLanguageTemplateOne = (data) => new Promise((resolve, reject) => {
    LanguageTemplateOne.create(data)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.createLanguageTemplateL4One = (data) => new Promise((resolve, reject) => {
    LanguageTemplateL4One.create(data)
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.createLanguageTemplateL5One = (data) => new Promise((resolve, reject) => {
    LanguageTemplateL5One.create(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

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

module.exports.getL4ChatAllTemplatesOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL4One.find(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

module.exports.getL5ChatAllTemplatesOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL5One.find(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.getChatTemplateOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateOne.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.getL4ChatTemplateOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL4One.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message))
})

module.exports.getL5ChatTemplateOne = (query) => new Promise((resolve, reject) => {
    LanguageTemplateL5One.findOne(query)
        .lean()
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})

module.exports.updateLanguageTemplateOne = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateOne.updateOne(query, { $set: data })
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message));
});

module.exports.updateL4LanguageTemplateOne = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateL4One.updateOne(query, { $set: data })
        .then((doc) => {
            resolve(doc);
        })
        .catch((error) => reject(error.message))
})

module.exports.updateL5LanguageTemplateOne = (query, data) => new Promise((resolve, reject) => {
    LanguageTemplateL5One.updateOne(query, { $set: data })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error.message))
})