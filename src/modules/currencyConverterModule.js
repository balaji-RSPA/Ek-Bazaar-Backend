const { CurrencyConvters } = require('../models')


exports.findCurrencyConverter = () =>
    new Promise((resolve, reject) => {
        CurrencyConvters.find()
            .then((doc) => {
                resolve(doc)
            })
            .catch(error => reject(error))
})

exports.addConverter = (data) =>
    new Promise((resolve, reject) => {
        CurrencyConvters.create(data)
            .then((doc) => {
                resolve(doc);
            })
            .catch((error) => reject(error));
});