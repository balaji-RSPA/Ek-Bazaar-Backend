const Contact = require('../models/contactSchema')

module.exports.addContact = (data) => new Promise((resolve, reject) => {

    Contact.create(data).then((doc) => {

        resolve(doc)

    }).catch(reject)
});