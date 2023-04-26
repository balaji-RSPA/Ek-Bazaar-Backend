const { TransportReq } = require('../models');

module.exports.createTransportRequest = (data) => new Promise((resolve, reject) => {
    TransportReq.create(data)
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => {
            reject(error.message);
        })
});