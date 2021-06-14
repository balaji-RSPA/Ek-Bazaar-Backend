const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types
const { States, Countries, Cities } = require("../models");

module.exports.getAllStates = (reqQuery) =>
  new Promise((resolve, reject) => {
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 300;
    States.find({})
      .skip(skip)
      .limit(limit)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.getAllCountries = (skip, limit) =>
  new Promise((resolve, reject) => {
    Countries.find({})
      .skip(skip)
      .limit(limit)
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

module.exports.countiesBulkInsert = (data) =>
  new Promise((resolve, reject) => {
    Countries.insertMany(data, {
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.addState = (newData) =>
  new Promise((resolve, reject) => {
    States.create(newData)
      .then((doc) => {
        // console.log(doc);
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

module.exports.getCountryData = (query) =>
  new Promise((resolve, reject) => {
    Countries.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
module.exports.updateCountry = (query, data) =>
  new Promise((resolve, reject) => {
    console.log(query, data, ' -------------- Req --------------')
    Countries.findOneAndUpdate(query, data, { new: true, upsert: true })
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
    // console.log(query, 'sdfsd')
    Cities.findOne(query)
      .populate('state', 'name')
      // .select("name state country")
      .then((doc) => {
        resolve(doc && id ? doc._id : doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

exports.getAllCities = (reqQuery) =>
  new Promise((resolve, reject) => {
    // console.log("reqQuery", reqQuery)
    console.log("🚀 ~ file: locationsModule.js ~ line 113 ~ reqQuery", reqQuery)
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 2000 //parseInt(reqQuery.limit) || 2000;
    console.log("🚀 ~ file: locationsModule.js ~ line 117 ~ newPromise ~ limit", limit)
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
          // state: ObjectId()
        }
      };
      if (reqQuery.stateId) match["$match"]["state"] = ObjectId(reqQuery.stateId)
    }
    // console.log("<<<---------------- match -------------->>>", match)

    const execQuery = Cities.aggregate([
      match,
      {
        $sort: {
          name: 1,
        }
      },
      // {
      //   $skip: 0
      // },
      // {
      //   $limit: limit
      // },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state",
        },
      },
      { $unwind: "$state" },
      {
        $project: {
          "_id": 1,
          "name": 1,
          "state.name": 1,
          "state._id": 1,
          "alias": 1,
          "state.country": 1,
        }
      }
    ]);

    execQuery
      .then((cities) => {
        // console.log("cities", cities)
        resolve(cities);
      })
      .catch(reject);
  });

module.exports.checkAndAddCity = (query) =>
  new Promise((resolve, reject) => {
    // console.log(query, ' eeee')
    this.getCity(query)
      .then((doc) => {
        if (doc) {
          // console.log("existing City -------");
          resolve(doc);
        } else {
          this.addCity(query).then((newDoc) => {
            // console.log("New City -------");
            resolve(newDoc)
          }).catch(reject)
        }
      })
      .catch(reject);
  });

module.exports.getServiceCity = (serviceCity) => new Promise((resolve, reject) => {
  match = {
    $match: {
      name: {
        $in: serviceCity.map((name) => (name)),
      }
    },
  };
  const execQuery = Cities.aggregate([
    match,
    {
      $lookup: {
        from: "states",
        localField: "state",
        foreignField: "_id",
        as: "state",
      },
    },
    { $unwind: '$state' },
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
})

module.exports.checkState = (query) =>
  new Promise((resolve, reject) => {
    States.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error.message));
  });

module.exports.updateCity = (query, data) =>
  new Promise((resolve, reject) => {
    // console.log(query,data, ' tyui')
    Cities.findOneAndUpdate(query, data, { new: true, upsert: true })
      .then((doc) => {
        // console.log("🚀 ~ file: locationsModule.js ~ line 229 ~ .then ~ doc", doc)
        resolve(doc);
      })
      .catch((error) => {
        // console.log(error, ' ghjk')
        reject(error);
      });
  });

module.exports.updateState = (query, data) =>
  new Promise((resolve, reject) => {
    States.findOneAndUpdate(query, data, { new: true, upsert: true })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
/*get filtered cities*/
module.exports.getFilteredCities = (query) =>
  new Promise((resolve, reject) => {
    Cities.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.statesBulkInsert = (data) =>
  new Promise((resolve, reject) => {
    States.insertMany(data, {
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.citiesBulkInsert = (data) =>
  new Promise((resolve, reject) => {
    Cities.insertMany(data, {
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  })
module.exports.getSellerTypeAll = (que, range) =>
  new Promise((resolve, reject) => {

    SellerTypes.find(que)
      .skip(range.skip)
      .limit(range.limit)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error.message));
  });

module.exports.getAllCitiesUpdate = (query) =>
  new Promise((resolve, reject) => {
    Cities.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
module.exports.getSellerSelectedCities = (data) =>
  new Promise((resolve, reject) => {
    Cities.find({
      _id: {
        $in: data
      }
    })
      .populate('state')
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
