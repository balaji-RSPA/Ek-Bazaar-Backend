const { CurrencyConvters, currencyExcenges } = require('../models')


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

exports.findCurrencyConverter2 = (query) => 
    new Promise((resolve, reject) => {
        currencyExcenges.find(query)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => {
                reject(error)
            })
    })


exports.addCurrencyExcenge = async (data) => new Promise(async (resolve, reject) => {
    currencyExcenges.create(data)
        .then((doc) => {

            console.log(data,'------------',doc)
            resolve(doc)
        })
        .catch((error) => {
            reject(error)
        })
});

exports.updateCurrencyExcenge = async (query, data) => new Promise((resolve, reject) => {
    currencyExcenges.findOneAndUpdate(query,{$set : data},{new:true})
        .then(doc => {
            console.log(data, query, '------------', doc)
            resolve(doc)
        })
        .catch((err) => {
            reject(err)
        })
})

exports.getAllCurrency = async (query) => new Promise((resolve, reject) => {
    currencyExcenges.find(query)
        .then((doc) => {
            console.log("🚀 ~ file: currencyConverterModule.js:60 ~ .then ~ doc:", doc)
            resolve(doc)
        })
        .catch((error) => {
            reject(error)
        })
})