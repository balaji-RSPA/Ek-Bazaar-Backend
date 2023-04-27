const { primaryBusinessType } = require("../models");
/* 
 primary BusenessType
*/
module.exports.addPrimaryBT = (data) =>
    new Promise((resolve, reject) => {
        primaryBusinessType.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.getPrimaryBT = (data) =>
    new Promise((resolve, reject) => {
        primaryBusinessType.find({}, { createdAt: 0, updatedAt: 0 })
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })