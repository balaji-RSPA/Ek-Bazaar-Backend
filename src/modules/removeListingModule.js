const {
  RemoveListing
} = require("../models");

exports.create = (query) =>
  new Promise((resolve, reject) => {
    RemoveListing.create(query)
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })
