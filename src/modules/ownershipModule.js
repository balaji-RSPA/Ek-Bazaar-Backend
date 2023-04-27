const { OwnershipType } = require("../models");
/* 
 primary BusenessType
*/
module.exports.addOwnershipType = (data) =>
    new Promise((resolve, reject) => {
        OwnershipType.create(data)
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })

module.exports.getOwnershipType = (data) =>
    new Promise((resolve, reject) => {
        OwnershipType.find({}, { createdAt: 0, updatedAt: 0 })
            .then((doc) => {
                resolve(doc)
            })
            .catch((error) => reject(error))
    })