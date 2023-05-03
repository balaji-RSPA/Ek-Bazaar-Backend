const {WhatsappTemplate, WhatsAppNotification} = require('../models');



module.exports.createWhatsaapTemplate = (data) => new Promise((resolve, reject) => {
    WhatsappTemplate.create(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplatemodule.js:12 ~ module.exports.createWhatsaapTemplate= ~ error:", error)
            reject(error.message);
        })
});


module.exports.getSingleTemplateById = (query) => new Promise((resolve, reject) => {
    WhatsappTemplate.findOne(query)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => {
            console.log("🚀 ~ file: whatsappTemplatemodule.js:12 ~ module.exports.createWhatsaapTemplate= ~ error:", error)
            reject(error.message);
        })
});

module.exports.createWhatsappNotifictionDoc = (data) => new Promise((resolve, reject) => {
    WhatsAppNotification.create(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => {
            reject(error)
        })
})

module.exports.updateWhatsappNotificationDoc = (query, data) => new Promise((resolve, reject) => {
    WhatsAppNotification.findOneAndUpdate(query, data,{new: true})
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => {
            reject(error)
        })
})