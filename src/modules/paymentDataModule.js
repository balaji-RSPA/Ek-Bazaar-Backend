const { mongoose } = require('mongoose');
const { PaymentData } = require('../models');

exports.addPaymentData = (data) =>
    new Promise((resolve, reject) => {
        PaymentData.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })