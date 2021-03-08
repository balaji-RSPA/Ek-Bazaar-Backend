const { Pincodes } = require("../models");

exports.create = (data) =>
  new Promise((resolve, reject) => {
    Pincodes.insertMany(data)
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })