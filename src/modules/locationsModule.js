const mongoose = require("mongoose");

const { States, Countries, Cities } = require("../models");

module.exports.getAllStates = () =>
  new Promise((resolve, reject) => {
    States.find({})
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.getAllCountries = () =>
  new Promise((resolve, reject) => {
    Countries.find({})
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.addState = (newData) =>
  new Promise((resolve, reject) => {
    States.create(newData)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error.message));
  });

module.exports.addCountry = (newData) =>
  new Promise((resolve, reject) => {
    Countries.create(newData)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
  
module.exports.addCity = (newData) =>
  new Promise((resolve, reject) => {
    Cities.create(newData)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

exports.getAllCities = (reqQuery) => new Promise((resolve, reject) => {

  const skip = parseInt(reqQuery.skip) || 0
  const limit = parseInt(reqQuery.limit) || 1000
  const search = reqQuery.search || ''

  let { state } = reqQuery
  let match;

  if (state) {

    state = Array.isArray(state) ? state : [state]
    match = {
      $match: {
        name: {
          $regex: `^${search}`,
          $options: 'i'
        },
        state: {
          $in: state.map((id) => ObjectId(id))
        }
      }
    }

  } else {

    match = {
      $match: {
        name: {
          $regex: `^${search}`,
          $options: 'i'
        }
      }
    }

  }

  const execQuery = Cities.aggregate([match, {
    $sort: {
      name: 1
    }
  }, {
    $skip: skip
  }, {
    $limit: limit
  }])

  execQuery.then((cities) => {

    resolve(cities)

  }).catch(reject)

})
