const mongoose = require("mongoose");
const {
  PrimaryCategory,
  ParentCategory,
  SecondaryCategory,
  Products,
  SellerTypes,
  Sellers,
  SellerProducts
} = require("../models");
const {
  searchProducts
} = require("./sellerProductModule");

module.exports.addSellerType = (data, id) =>
  new Promise((resolve, reject) => {
    SellerTypes.create(data)
      .then((doc) => {
        resolve(doc && id ? doc._id : doc);
      })
      .catch(reject);
  });

module.exports.getSellerType = (query, id) =>
  new Promise((resolve, reject) => {
    SellerTypes.findOne(query)
      .then((doc) => {
        resolve(doc && id ? doc._id : doc);
      })
      .catch(reject);
  });

module.exports.checkAndAddSellerType = (query) =>
  new Promise((resolve, reject) => {
    this.getSellerType(query, "_id")
      .then((doc) => {
        if (doc) {
          console.log("existing seller type +++++");
          resolve(doc);
        } else {
          this.addSellerType(query, "_id")
            .then((newDoc) => {
              console.log("New seller type ++++");
              resolve(newDoc);
            })
            .catch(reject);
        }
      })
      .catch(reject);
  });

module.exports.getAllSellerTypes = () =>
  new Promise((resolve, reject) => {
    // const query = {
    //   _id: {
    //     $in: [
    //       "5f97ace6b9a4b5524568716b",
    //       "5fa4fac96eb907267c7d15ce",
    //       "5fa5506e0524f35f355955f2",
    //       "5fa61d53520fd81fba4a1d6d",
    //       "5fb39af634d3932a93e10025",
    //       "5fb397c072e59028f0d17e32",
    //       "5fb46f021135863cd3c66664",
    //       "5fb5f268805ec7db145b4e58"
    //     ],
    //   },
    // };
    SellerTypes.find({})
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });
module.exports.getAllCategories = (query) =>
  new Promise((resolve, reject) => {
    ParentCategory.find({
      _id: {
        $in: [
          "5f9a60b98420b75666d810d6",
          "5f9a60b98420b75666d810d8",
          "5f9a60b98420b75666d810e2",
          "5f9a60b98420b75666d810e8",
        ],
      },
    })
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
      ordered: false,
    })
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.addParentCategory = (data) =>
  new Promise((resolve, reject) => {
    ParentCategory.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getParentCat = (query) =>
  new Promise((resolve, reject) => {
    ParentCategory.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.deleteSellers = query => new Promise((resolve, reject) => {
  Sellers.deleteMany(query)
    .then(doc => resolve(doc))
    .catch(error => reject(error))
})

module.exports.deletel3 = query => new Promise((resolve, reject) => {
  SecondaryCategory.deleteMany(query)
    .then(doc => resolve(doc))
    .catch(error => reject(error))
})

module.exports.deletel4 = query => new Promise((resolve, reject) => {
  Products.deleteMany(query)
    .then(doc => resolve(doc))
    .catch(error => reject(error))
})

module.exports.getParentCategory = (reqQuery) =>
  new Promise(async (resolve, reject) => {
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 1000;
    const search = reqQuery.search || "";
    const status = reqQuery.status || true;
    const id = reqQuery.id;

    const query = {
      _id: reqQuery.id,
      status,
    };

<<<<<<< HEAD
    ParentCategory.findById(query)
    .skip(skip)
    .limit(limit)
    .populate({
        path: 'primaryCategotyId', 
=======
    ParentCategory.findOne(query)
      .populate({
        path: "primaryCategotyId",
>>>>>>> staging
        model: PrimaryCategory,
        select: "name vendorId",
        match: {
          $and: [{
            name: {
              $regex: `^${search}`,
              $options: "i",
            },
          },],
        },
        populate: {
          path: "secondaryCategotyId",
          model: SecondaryCategory,
          select: "name vendorId",
        },
      })
      // .slice(PrimaryCategory, -1)
      // .select(PrimaryCategory)
      .lean()
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.updateParentCategory = (id, newData) =>
  new Promise((resolve, reject) => {
    ParentCategory.findByIdAndUpdate(
      id, {
      $set: newData,
    }, {
      new: true,
    }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.checkParentCategory = (query) =>
  new Promise((resolve, reject) => {
    ParentCategory.findOne(query)
      .then((doc) => {
        resolve(doc._id);
      })
      .catch(reject);
  });

// Primary Category
<<<<<<< HEAD
module.exports.addPrimaryCategories = (data) => new Promise((resolve, reject) => {

    PrimaryCategory.insertMany(data, {
        ordered: false
    })/* .select('_id') */.then((doc) => {

        resolve(doc)

    }).catch(reject)

})

module.exports.addPrimaryCategory = (data) => new Promise((resolve, reject) => {

    PrimaryCategory.create(data).then((doc) => {
        resolve(doc)
    }).catch(reject)

})

module.exports.getPrimaryCategory = (reqQuery) => new Promise((resolve, reject) => {

    const skip = parseInt(reqQuery.skip) || 0
    const limit = parseInt(reqQuery.limit) || 1000
    PrimaryCategory.findById(reqQuery.id)
    .populate({
        path: 'secondaryCategotyId',
        model: SecondaryCategory,
        select: 'name vendorId'
    })
    .then((doc) => {
        resolve(doc)
    }).catch(reject)

})

exports.updatePrimaryCategory = (id, newData) => new Promise((resolve, reject) => {

  PrimaryCategory.findByIdAndUpdate(id, {
    $set: newData
  }, {
    new: true
  }).then((doc) => {

    resolve(doc)

  }).catch(reject)

=======
module.exports.addPrimaryCategories = (data) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.insertMany(
      data
      /* , {
           ordered: false,
         } */
    ) /* .select('_id') */
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
      .populate("secondaryCategotyId", "name vendorId")
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getRelatedPrimaryCategory = (id) =>
  new Promise((resolve, reject) => {
    PrimaryCategory.findById(id)
      .skip(0)
      .limit(2)
      .populate("secondaryCategotyId", "name vendorId")
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
      id, {
      $set: newData,
    }, {
      new: true,
    }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.getAllPrimaryCategory = () =>
  new Promise((resolve, reject) => {
    PrimaryCategory.find({})
      .then((doc) => resolve(doc))
      .catch((error) => reject(error));
  });

module.exports.getPrimaryCategories = (query) => new Promise((resolve, reject) => {
  console.log(query, "vande matram ..................................")
  PrimaryCategory.findOne({
    _id: query._id
  })
    .limit(query.limit)
    .skip(query.skip)
    .populate("secondaryCategotyId")
    .populate({
      path: "secondaryCategotyId",
      populate: {
        path: "productId",
        model: "products"
      }
    })
    .then(doc => resolve(doc))
    .catch(error => reject(error))
>>>>>>> staging
})

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
      id, {
      $set: newData,
    }, {
      new: true,
    }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.getAllSecondaryCategory = () =>
  new Promise((resolve, reject) => {
    SecondaryCategory.find({})
      .then((doc) => resolve(doc))
      .catch((error) => reject(error));
  });

exports.getAllSecondaryCategories = () => new Promise((resolve, reject) => {
  SecondaryCategory.find({})
    .limit(4)
    .sort({
      _id: -1
    })
    .populate("productId")
    .then((doc) => {
      resolve(doc)
    })
    .catch((error) => reject(error));
})

// Products

module.exports.getProducts = (query) => new Promise((resolve, reject) => {
  // Products.find(query.search || query)
  //   .limit(query.limit || 10)
  //   .sort({ _id: -1 })
  //   .then((doc) => {
  //     resolve(doc);
  //   })
  //   .catch(reject);

  let params = [
    {
      $lookup: {
        from: SecondaryCategory.collection.name,
        localField: "secondaryId",
        foreignField: "_id",
        as: "secondaryId",
      },
    },
    {
      $unwind: "$secondaryId"
    },
    {
      $lookup: {
        from: PrimaryCategory.collection.name,
        localField: "secondaryId.primaryCatId",
        foreignField: "_id",
        as: "primaryCatId",
      },
    },
    {
      $unwind: "$primaryCatId"
    },
    {
      $lookup: {
        from: ParentCategory.collection.name,
        localField: "primaryCatId.parentCatId",
        foreignField: "_id",
        as: "parentCatId",
      },
    },
    {
      $unwind: "$parentCatId"
    },
    {
      $project: {
        _id: 1,
        name: 1,
        vendorId: 1,
        "secondaryId._id": 1,
        "secondaryId.name": 1,
        "secondaryId.vendorId": 1,
        // "secondaryId.primaryCatId": 1,
        "primaryCatId._id": 1,
        "primaryCatId.name": 1,
        "parentCatId._id": 1,
        "parentCatId.name": 1,
      },
    },
  ]
  if (query.search) {
    params.unshift({
      $match: {
        name: {
          $regex: `${query.search}`,
          $options: "i",
        },
      },
    })
  }
  Products.aggregate(params)
    .limit(query.limit || 10)
    .sort({
      _id: -1
    })
    .then((doc) => {
      resolve(doc);
    })
    .catch(reject);
})

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

module.exports.getProductCategoryBySecCat = (query) =>
  new Promise((resolve, reject) => {
    Products.findOne(query)
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.updateProductCategory = (id, newData) =>
  new Promise((resolve, reject) => {
    Products.findByIdAndUpdate(
      id, {
      $set: newData,
    }, {
      new: true,
    }
    )
      .then((doc) => {
        resolve(doc);
      })
      .catch(reject);
  });

exports.getCatId = (query, id) =>
  new Promise((resolve, reject) => {
    if (query.productId) {
      Products.findOne({
        _id: query.productId
      })
        .populate({
          path: "secondaryId",
          model: SecondaryCategory,
          populate: {
            path: "primaryCatId",
            model: PrimaryCategory,
          },
        })
        .then((doc) => {
          resolve(doc && id ? doc.secondaryId.primaryCatId._id : doc);
        })
        .catch(reject);
    } else if (query.secondaryId) {
      SecondaryCategory.findOne({
        _id: query.secondaryId
      })
        .populate({
          path: "primaryCatId",
          model: PrimaryCategory,
        })
        .then((doc) => {
          resolve(doc && id ? doc.primaryCatId._id : doc);
        })
        .catch(reject);
    } else if (query.primaryId) {
      PrimaryCategory.findOne({
        _id: query.primaryId
      })
        .then((doc) => {
          resolve(doc && id ? doc._id : doc);
        })
        .catch(reject);
    }
  });

exports.getSecCatId = (query, id) =>
  new Promise((resolve, reject) => {
    SecondaryCategory.findOne(query)
      .populate({
        path: "primaryCatId",
        model: PrimaryCategory,
        select: "name venderId",
      })
      .select("name venderId")
      .then((doc) => {
        resolve(doc && id ? doc.primaryCatId._id : doc);
      })
      .catch(reject);
  });
// find( { $and: [ productId: {$exists: true, $eq: []}, { 'vendorId': {'$regex': '^L3FB'} } ] } )

exports.getAllProducts = (reqQuery) =>
  new Promise((resolve, reject) => {
    const skip = parseInt(reqQuery.skip) || 0;
    const limit = parseInt(reqQuery.limit) || 1000;
    const search = reqQuery.search || "";

    let execQuery;
    execQuery = Products.aggregate([{
      $match: {
        name: {
          $regex: `^${search}`,
          $options: "i",
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    ]);

    execQuery
      .then((products) => {
        resolve(products);
      })
      .catch(reject);
  });

exports.getAllProductsToSearch = () =>
  new Promise((resolve, reject) => {
    Products.find({})
      .then((doc) => resolve(doc))
      .catch((error) => reject(error));
  });

exports.getProductByName = (query) => new Promise((resolve, reject) => {
  Products.findOne(query)
    // .limit(1)
    .then((doc) => resolve(doc))
    .catch((error) => reject(error));
})

exports.getLevelOneCategoryList = (list) =>
  new Promise((resolve, reject) => {
    match = {
      $match: {
        vendorId: {
          $in: list.map((vendorId) => vendorId),
        },
      },
    };
    const execQuery = ParentCategory.aggregate([
      match,
      {
        $project: {
          _id: 1,
          name: 1,
          vendorId: 1,
        },
      },
    ]);
    execQuery
      .then((l1) => {
        resolve(l1);
      })
      .catch(reject);
  });

exports.getLevelTwoCategoryList = (list) =>
  new Promise((resolve, reject) => {
    match = {
      $match: {
        vendorId: {
          $in: list.map((vendorId) => vendorId),
        },
      },
    };
    const execQuery = PrimaryCategory.aggregate([
      match,
      {
        $project: {
          _id: 1,
          name: 1,
          vendorId: 1,
        },
      },
    ]);
    execQuery
      .then((l1) => {
        resolve(l1);
      })
      .catch(reject);
  });

exports.getLevelThreeCategoryList = (list) =>
  new Promise((resolve, reject) => {
    match = {
      $match: {
        vendorId: {
          $in: list.map((vendorId) => vendorId),
        },
      },
    };
    const execQuery = SecondaryCategory.aggregate([
      match,
      {
        $project: {
          _id: 1,
          name: 1,
          vendorId: 1,
        },
      },
    ]);
    execQuery
      .then((l1) => {
        resolve(l1);
      })
      .catch(reject);
  });

exports.getLevelFourCategoryList = (list) =>
  new Promise((resolve, reject) => {
    match = {
      $match: {
        vendorId: {
          $in: list.map((vendorId) => vendorId),
        },
      },
    };
    const execQuery = Products.aggregate([
      match,
      {
        $lookup: {
          from: SecondaryCategory.collection.name,
          localField: "secondaryId",
          foreignField: "_id",
          as: "secondaryId",
        },
      },
      {
        $unwind: "$secondaryId"
      },
      {
        $lookup: {
          from: PrimaryCategory.collection.name,
          localField: "secondaryId.primaryCatId",
          foreignField: "_id",
          as: "primaryCatId",
        },
      },
      {
        $unwind: "$primaryCatId"
      },
      {
        $lookup: {
          from: ParentCategory.collection.name,
          localField: "primaryCatId.parentCatId",
          foreignField: "_id",
          as: "parentCatId",
        },
      },
      {
        $unwind: "$parentCatId"
      },
      {
        $project: {
          _id: 1,
          name: 1,
          vendorId: 1,
          "secondaryId._id": 1,
          "secondaryId.name": 1,
          "secondaryId.vendorId": 1,
          // "secondaryId.primaryCatId": 1,
          "primaryCatId._id": 1,
          "primaryCatId.name": 1,
          "parentCatId._id": 1,
          "parentCatId.name": 1,
        },
      },
    ]);
    execQuery
      .then((l1) => {
        resolve(l1);
      })
      .catch(reject);
  });