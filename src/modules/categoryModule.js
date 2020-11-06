const mongoose = require("mongoose");
const { PrimaryCategory, ParentCategory, SecondaryCategory, Products, SellerTypes } = require("../models");
const { populate } = require("../models/rfpSchema");

module.exports.addSellerType = (data) => new Promise ((resolve, reject) => {
    
    SellerTypes.create(data).then((doc) => {
        resolve(doc)
    }).catch(reject)

})

module.exports.getAllSellerTypes = () => new Promise ((resolve, reject) => {

    SellerTypes.find({}).then((doc) => {
        resolve(doc)
    }).catch(reject)

})
module.exports.getAllCategories = (query) => new Promise((resolve, reject) => {

    ParentCategory.find(query)
      .populate({
        path: "primaryCategotyId",
        model: PrimaryCategory,
        select: "name vendorId",
        populate: {
          path: "secondaryCategotyId",
          model: SecondaryCategory,
          select: "name vendorId",
          // populate: {
          //   path: "productId",
          //   model: Products,
          //   // select: "name vendorId",
          // },
        },
      })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

// Parent Category
module.exports.addParentCategories = (data) =>
  new Promise((resolve, reject) => {
    ParentCategory.insertMany(data, {
        ordered: false
    }).then((doc) => {

        resolve(doc)

    }).catch(reject)

})

module.exports.addParentCategory = (data) => new Promise((resolve, reject) => {

    ParentCategory.create(data).then((doc) => {
        resolve(doc)
    }).catch(reject)

})

module.exports.getParentCat = (query) => new Promise((resolve, reject) => {
  ParentCategory.findOne(query)
  .then((doc) => {
    resolve(doc)
  }).catch(reject)
})

module.exports.getParentCategory = (reqQuery) => new Promise((resolve, reject) => {
  
  const skip = parseInt(reqQuery.skip) || 0
  const limit = parseInt(reqQuery.limit) || 1000
  const search = reqQuery.search|| ''
  const status = reqQuery.status || true
  const id = reqQuery.id
  
  const query = {
    _id: reqQuery.id,
    status,
  }

    ParentCategory.findOne(query)
    .populate({
        path: 'primaryCategotyId', 
        model: PrimaryCategory,
        select: 'name vendorId',
        match : {
        $and: [
                 { name: {
                    $regex: `^${search}`,
                    $options: 'i'
                }}
            ]
    },
        populate: {
            path: 'secondaryCategotyId',
            model: SecondaryCategory,
            select: 'name vendorId'
        }
    })
    // .slice(PrimaryCategory, -1)
    // .select(PrimaryCategory)
    .lean()
    .then((doc) => {
        resolve(doc)
    }).catch(reject)

})

exports.updateParentCategory = (id, newData) => new Promise((resolve, reject) => {

  ParentCategory.findByIdAndUpdate(id, {
    $set: newData
  }, {
    new: true
  }).then((doc) => {

    resolve(doc)

  }).catch(reject)

})

exports.checkParentCategory = (query) => new Promise((resolve, reject) => {
  ParentCategory.findOne(query)
  .then((doc) => {
    resolve(doc._id)
  }).catch(reject)
})


// Primary Category
module.exports.addPrimaryCategories = (data) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.insertMany(data/* , {
      ordered: false,
    } */) /* .select('_id') */
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.addPrimaryCategory = (data) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getPrimaryCategory = (id) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.findById(id)
    .populate('secondaryCategotyId', 'name vendorId')
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
});

module.exports.getPrimaryCat = (query) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
});

exports.updatePrimaryCategory = (id, newData) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.findByIdAndUpdate(
      id,
      {
        $set: newData,
      },
      {
        new: true,
      }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

// Secondary Category

module.exports.addSecondaryCategories = (data) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.insertMany(data, {
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.addSecondaryCategory = (data) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getSecondaryCategory = (id) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.findById(id)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
});

module.exports.getSecondaryCat = (query) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
});

exports.updateSecondaryCategory = (id, newData) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.findByIdAndUpdate(
      id,
      {
        $set: newData,
      },
      {
        new: true,
      }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

// Products

module.exports.addProductCategories = (data) =>
  new Promise((resolve, reject) => {
    Products.insertMany(data, {
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.addProductCategory = (data) =>
  new Promise((resolve, reject) => {
    Products.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getProductCategory = (id) =>
  new Promise((resolve, reject) => {
    Products.findById(id)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.updateProductCategory = (id, newData) =>
  new Promise((resolve, reject) => {
    Products.findByIdAndUpdate(
      id,
      {
        $set: newData,
      },
      {
        new: true,
      }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

  exports.getCatId = (query, id) => new Promise((resolve, reject) => {
    Products.findOne(query)
    .populate({
      path: "secondaryId",
      model: SecondaryCategory,
      populate: {
          path: "primaryCatId",
          model: PrimaryCategory
      },
    })
    .then((doc) => {
      resolve(doc && id ? doc.secondaryId.primaryCatId._id : doc)
    }).catch(reject)
  })


  exports.getSecCatId = (query, id) => new Promise((resolve, reject) => {
    SecondaryCategory.findOne(query)
    .populate({
      path: "primaryCatId",
      model: PrimaryCategory,
      select: 'name venderId'
    }).select('name venderId')
    .then((doc) => {
      resolve(doc && id ? doc.primaryCatId._id : doc)
    }).catch(reject)
  })
// find( { $and: [ productId: {$exists: true, $eq: []}, { 'vendorId': {'$regex': '^L3FB'} } ] } )

  exports.getAllProducts = (reqQuery) => new Promise((resolve, reject) => {

    const skip = parseInt(reqQuery.skip) || 0
    const limit = parseInt(reqQuery.limit) || 1000
    const search = reqQuery.search || ''

    let execQuery;
    execQuery = Products.aggregate([{
      $match: {
        name: {
          $regex: `^${search}`,
          $options: 'i'
        }
      }
    }, {
      $skip: skip
    }, {
      $limit: limit
    }])

    execQuery.then((products) => {

      resolve(products)

    }).catch(reject)

  })

  