const mongoose = require("mongoose");
const { DocumentList } = require("twilio/lib/rest/preview/sync/service/document");
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
// db.countries.aggregate([
//   {
//     $match: {
//       name: {
//         $regex: "search string",  // replace "search string" with your actual search query
//         $options: "i"  // case-insensitive search
//       }
//     }
//   },
//   {
//     $project: {
//       _id: 0,  // exclude the _id field from the result
//       name: 1   // include the name field in the result
//     }
//   }
// ])

module.exports.getAllCountries = (skip, limit, search) =>
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
//   const query = Countries.aggregate([
//   {
//     $match: {
//       name: {
//         $regex: `^${search}`,  // replace "search string" with your actual search query
//         $options: "i"  // case-insensitive search
//       }
//     }
//   },
//   {
//     $project: {
//       _id: 1,  // exclude the _id field from the result
//       name: 1   // include the name field in the result
//     }
//   }
// ])
  });

module.exports.getTotelCountriesCount = () => 
  new Promise((resolve, reject) => {
    Countries.countDocuments()
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => {
        reject(error)
      })
  })

module.exports._getAllCountries = (query) => new Promise((resolve, reject) => {
  Countries.find(query.query)
    .limit(query.limit)
    .then(doc => resolve(doc))
    .catch(error => reject(error))
})

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
      .populate('country', 'name')
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
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 2000 //parseInt(reqQuery.limit) || 2000;
    const search = reqQuery.search || "";

    let { state, stateId, countryId, indiaCity } = reqQuery;
    let match;

    if (state || stateId) {
      state = state
        ? Array.isArray(state)
          ? state
          : [state]
        : stateId
          ? Array.isArray(stateId)
            ? stateId
            : [stateId]
          : []
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
    } else if (countryId) {
      countryId = Array.isArray(countryId) ? countryId : [countryId];
      match = {
        $match: {
          name: {
            $regex: `^${search}`,
            $options: "i",
          },
          country: {
            $in: countryId.map((id) => ObjectId(id)),
          },
        },
      };
    } else if (indiaCity) {
      match = {
        $match: {
          name: {
            $regex: `^${search}`,
            $options: "i",
          },
          state: {
            $ne: null,
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
    console.log("<<<---------------- match -------------->>>1", match)

    const execQuery = Cities.aggregate([
      match,
      {
        $sort: {
          name: 1,
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
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
        $unwind: {
          path: "$state",
          preserveNullAndEmptyArrays: true
        }
      },
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

exports.getAllCitiesCount = () => 
  new Promise((resolve, reject) => {
    Cities.countDocuments()
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => {
        reject(error)
      })
  })

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

module.exports.getCityList = (query) =>
  new Promise((resolve, reject) => {
    Cities.find()
      // .select('name state country')
      .skip(query.skip)
      .limit(query.limit)
      .populate('state')
      .populate('country')
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });

module.exports.getSelectedCountries = (query) =>
  new Promise((resolve, reject) => {
    Countries.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });
module.exports.getSelectedStates = (query) =>
  new Promise((resolve, reject) => {
    States.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => {
        reject(error);
      });
  });