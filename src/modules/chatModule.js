const { Chat } = require('../models')

module.exports.createChat = (query, newData) =>
    new Promise((resolve, reject) => {
        // Chat.create(newData)
        //     .then((doc) => {
        //         resolve(doc);
        //     })
        //     .catch((error) => reject(error.message));
        Chat.findOneAndUpdate(query, newData, { new: true, upsert: true })
            .then((doc) => {
                resolve(doc);
            })
            .catch((error) => reject(error.message));
    });

module.exports.getChat = (query) =>
    new Promise((resolve, reject) => {
        Chat.findOne(query)
            .then((doc) => {
                resolve(doc);
            })
            .catch((error) => reject(error.message));
    });

module.exports.createChatSession = (query, data) =>
    new Promise((resolve, reject) => {
        Chat.findOneAndUpdate(query, data, { new: true, upsert: true })
            .then((doc) => {
                resolve(doc);
            })
            .catch((error) => reject(error.message));
    });

module.exports.updateChatSession = (query, data) =>
    new Promise((resolve, reject) => {
        Chat.findOneAndUpdate(query, data, { new: true, upsert: true })
            .then((doc) => {
                resolve(doc);
            })
            .catch((error) => reject(error.message));
    });