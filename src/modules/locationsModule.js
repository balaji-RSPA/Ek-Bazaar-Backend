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

module.exports.getCountry = (id) =>
  new Promise((resolve, reject) => {
    Countries.findById(id)
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

module.exports.getState = (id) =>
  new Promise((resolve, reject) => {
    States.findById(id)
      .then((doc) => {
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

module.exports.addCity = (newData, id) =>
  new Promise((resolve, reject) => {
    Cities.create(newData)
      .then((doc) => {
        resolve(doc && id ? doc._id : doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.getCity = (query, id) =>
  new Promise((resolve, reject) => {
    Cities.findOne(query)
      // .populate('state', 'name')
      .then((doc) => {
        resolve(doc && id ? doc._id : doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

exports.getAllCities = (reqQuery) =>
  new Promise((resolve, reject) => {
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 1000;
    const search = reqQuery.search || "";

    let { state } = reqQuery;
    let match;

    if (state) {
      state = Array.isArray(state) ? state : [state];
      match = {
        $match: {
          name: {
            $regex: `^${search}`,
            $options: "i",
          },
          state: {
            $in: state.map((id) => ObjectId(id)),
          },
        },
      };
    } else {
      match = {
        $match: {
          name: {
            $regex: `^${search}`,
            $options: "i",
          },
        },
      };
    }

    const execQuery = Cities.aggregate([
      match,
      {
        $sort: {
          name: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state",
        },
      },
      {
        $project: {
          "_id": 1,
          "name": 1,
          "state.name": 1,
          "state._id": 1
        }
      }      
    ]);

    execQuery
      .then((cities) => {
        resolve(cities);
      })
      .catch(reject);
  });

module.exports.checkAndAddCity = (query) =>
  new Promise((resolve, reject) => {
    this.getCity(query)
      .then((doc) => {
        if (doc) {
          console.log("existing City -------");
          resolve(doc);
        } else {
          // this.addCity(query).then((newDoc) => {
          console.log("New City -------");
          //   resolve(newDoc)
          // }).catch(reject)
        }
      })
      .catch(reject);
  });
