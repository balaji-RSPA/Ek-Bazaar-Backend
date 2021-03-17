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
exports.listAll = (query) =>
  new Promise((resolve, reject) => {
  const skip = parseInt(query.skip);
  const limit = parseInt(query.limit);
    RemoveListing.find({})
    .skip(skip)
    .limit(limit)
    .then((doc) => {
      resolve(doc)
    })
    .catch(reject)
  })
