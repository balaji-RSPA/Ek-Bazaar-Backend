const {
  Buyers,
  RFP,
  SellerOffferContacts
} = require("../models");
const User = require('../../config/tenderdb').userModel
module.exports.postRFP = (data) => new Promise((resolve, reject) => {
  RFP.create(data)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))

})

module.exports.updateRFP = (query, data) => new Promise((resolve, reject) => {
  RFP.findOneAndUpdate(query, data, { new: true, upsert: true })
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))

})

module.exports.getRFPData = (query, range) => new Promise((resolve, reject) => {
  const skip = range && range.skip || 0
  const limit = range && range.limit || 10000
  RFP.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
    .populate({
      path: 'buyerDetails.location.city buyerDetails.location.state'
    })
    .then(doc => {
      resolve(doc)
    })
    .catch(error => resolve(error.message))

})

module.exports.checkBuyerExistOrNot = (query) =>
  new Promise((resolve, reject) => {
    Buyers.find(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addBuyer = (data) =>
  new Promise((resolve, reject) => {
    Buyers.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getBuyer = (id, query) =>
  new Promise((resolve, reject) => {
    let _query = query || { userId: id }
    console.log("🚀 ~ file: buyersModule.js ~ line 62 ~ newPromise ~ _query", _query)
    Buyers.findOne(_query)
      .populate({
        path: "location.city",
        model: "cities",
        select: "name"
      })
      .populate({
        path: "location.state",
        model: "states",
        select: "name"
      })
      .populate({
        path: "location.country",
        model: "countries",
        select: "name"
      })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyer = (query, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate(query, data, { new: true, upsert: true })
      .populate({
        path: "location.city",
        model: "cities",
        select: "name"
      })
      .populate({
        path: "location.state",
        model: "states",
        select: "name"
      })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getAllBuyers = (searchQuery, skip, limit) =>
  new Promise((resolve, reject) => {
    let searchQry = searchQuery ? {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { mobile: { $regex: searchQuery, $options: 'i' } }
      ]
    } : {};
    Buyers.find(searchQry)
      .skip(skip)
      .limit(limit)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateBuyerPassword = (mobile, data) =>
  new Promise((resolve, reject) => {
    Buyers.findOneAndUpdate({ mobile }, data, { new: true })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
/*Buyer admin api*/
module.exports.getBuyerAdmin = (query) =>
  new Promise((resolve, reject) => {
    Buyers.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });
// /**
//    * Create RFP
//   */
// module.exports.postRFP = (data) => new Promise((resolve, reject) => {
//   RFP.create(data)
//     .then(doc => {
//       resolve(doc)
//     })
//     .catch(error => reject(error))

// })
/**
 * Get Specific RFP Without limit
 */
module.exports.getRFP = (query) => new Promise((resolve, reject) => {
  RFP.find(query)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})
/**
 * 
 * Email verification code  
 */
exports.getUserFromUserHash = (hashcode) => new Promise((resolve, reject) => {
  User.find({
    "userHash.encryptedData": hashcode
  }, {
    _id: 0,
    userHash: 1,
    mobile: 1,
    name: 1
  })
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})

exports.updateEmailVerification = (hash, newData) => new Promise((resolve, reject) => {
  User.update({
    'userHash.encryptedData': hash
  }, {
    $set: {
      isEmailVerified: 2,
      email: newData.userEmail
    }
  }, {
    new: true
  })
    .then((doc) => resolve(doc))
    .catch(reject)
})

exports.deleteBuyer = (query) => new Promise((resolve, reject) => {
  Buyers.deleteOne(query)
    .then((doc) => {
      resolve(doc);
    })
    .catch((error) => {
      reject(error);
    });
})
exports.deleteBuyers = (query) => new Promise((resolve, reject) => {
  Buyers.deleteMany(query)
    .then((doc) => {
      resolve(doc);
    })
    .catch((error) => {
      reject(error);
    });
})

module.exports.createSellerContact = (data) => new Promise((resolve, reject) => {
  SellerOffferContacts.create(data)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))

})

module.exports.deleteBuyerRequest = (query) => new Promise((resolve, reject) => {
  RFP.deleteOne(query)
    .then((doc) => {
      resolve(doc);
    })
    .catch((error) => {
      reject(error);
    });

})

exports.getUserList = (query, limit) => new Promise((resolve, reject) => {
  User.find(query)
    .limit(limit)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})

// exports.getUserList = (reqQuery = '') => new Promise((resolve, reject) => {
//     console.log("🚀 ~ file: buyersModule.js ~ line 230 ~ exports.getUserList= ~ reqQuery", reqQuery)
//     // const skip = parseInt(reqQuery.skip);
//     // const limit = parseInt(reqQuery.limit);
//     const search = reqQuery.search || ''
//     console.log("🚀 ~ file: buyersModule.js ~ line 234 ~ exports.getUserList= ~ search", search)

//     const match = {
//       $match: {
//         $or: [{
//           mobile: parseInt(search)
//         }]

//       }
//     }
//     console.log("🚀 ~ file: buyersModule.js ~ line 259 ~ exports.getUserList= ~ match", JSON.stringify(match))

//     const execQuery = User.aggregate([match])

//     execQuery.then((doc) => {

//       resolve(doc)

//     }).catch(reject)

// });
exports.deleteUser = (query) => new Promise((resolve, reject) => {
  User.deleteMany(query)
    .then(doc => {
      resolve(doc)
    })
    .catch(error => reject(error))
})