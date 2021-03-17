const { SellerPlanLog } = require('../models')

/**
   * Add seller plan log
*/
module.exports.addSellerPlanLog = (data) =>
    new Promise((resolve, reject) => {
        SellerPlanLog.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })