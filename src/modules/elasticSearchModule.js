const mongoose = require("mongoose");
const esClient = require("../../config/db").esClient;
const { INDEXNAME } = require("../utils/globalConstants");
const { Sellers } = require("../models");
const { getCatId, getSecCatId } = require('../modules/categoryModule')
// const { getCatId } = category

module.exports.addSellerBulkIndex = async () => {

  try {
    const data = await Sellers.estimatedDocumentCount(); // Getting total seller count
    const limit = 1000; // Limited for 1000
    const ratio = data / limit;
    let skip = 0;
    let successCounter = 0;
    let failureCounter = 0;
    console.log(ratio, "ratio");
    for (skip; skip <= data; skip += limit) {
      // making a batch 1000 records
      const foundDoc = await Sellers.find()
        .skip(skip)
        .limit(limit)
        // .populate("primaryCatId", "name venderId")
        .populate("location.state", "name region")
        .populate("location.country", "name")
        .populate("location.city", "name")
        .populate("sellerType.name", "name")
        .populate("sellerType.cities.city", "name")
        .populate("sellerType.cities.state", "name region")
        .populate({
          path: 'sellerProductId',
          model: 'sellerproducts',
          select: 'sellerId serviceType parentCategoryId primaryCategoryId secondaryCategoryId poductId',
          populate: [
            {
              path: 'serviceType',
              model: 'sellerTypes',
              select: 'name',
            },
            {
              path: 'parentCategoryId',
              model: 'parentcategories',
              select: 'name'
            }, {
              path: 'primaryCategoryId',
              model: 'primarycategories',
              select: 'name'
            }, {
              path: 'secondaryCategoryId',
              model: 'secondarycategories',
              select: 'name'
            }, {
              path: 'poductId',
              model: 'products',
              select: 'name'
            }
          ]
        })
        .lean();

      try {
        await this.bulkStoreInElastic(foundDoc); // added to the ES
        successCounter++;
      } catch (error) {
        console.log(error, "es index error");
        failureCounter++;
      }
      // console.log("module.exports.addSellerBulkIndex -> const", foundDoc)
      // return foundDoc;
    }
    return Promise.resolve(
      `Successfully indexed ${(successCounter - failureCounter) * limit
      } out of ${data} items`
    );
  } catch (error) {
    return Promise.reject(error);
  }

}

exports.bulkStoreInElastic = (foundDoc) =>
  new Promise((resolve, reject) => {
    const bulkBody = [];
    foundDoc.forEach((item) => {
      // Makes a structure to insert in ES

      const index = {
        index: {
          _index: INDEXNAME,
          _id: item._id,
        },
      };
      bulkBody.push(index);
      const docData = item;
      delete docData._id;
      bulkBody.push(docData);
    });

    esClient
      .bulk({
        body: bulkBody,
      })
      .then((response) => {
        // After insert

        let errorCount = 0;
        response.items.forEach((item) => {
          if (item.index && item.index.error) {
            // Checks for any error in insert

            ++errorCount;
            reject(new Error("err"));
          }
        });
        console.log(
          `Successfully indexed ${bulkBody.length - errorCount} out of ${bulkBody.length
          } items`
        );
        resolve("ok");
      })
      .catch(reject);
  });

exports.sellerSearch = async (reqQuery) => {

  const { cityId, productId, secondaryId, primaryId, parentId, keyword } = reqQuery
  let catId = ''
  let query = {
    bool: {
      should: [],
      must: [],
      must_not: [],
      filter: []
    },
  };

  if (keyword) {
    const { searchProductsBy } = reqQuery
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 139 ~ exports.sellerSearch= ~ searchProductsBy", searchProductsBy)
    const keywordMatch = []
    const productMatch = []
    if (searchProductsBy.serviceType) {
      keywordMatch.push({
        "match": {
          "sellerProductId.serviceType._id": searchProductsBy.serviceType.id,
        }
      })
    }
    if (searchProductsBy.city) {
      keywordMatch.push({
        "match": {
          "sellerType.cities.city._id": searchProductsBy.city.id,
        }
      })
    }
    if (searchProductsBy.state) {
      keywordMatch.push({
        match: {
          "sellerType.cities.state._id": searchProductsBy.state.id,
        }
      })
    }
    if (searchProductsBy.product) {

      /** product **/
      productMatch.push({
        "match_phrase": {
          "sellerProductId.poductId.name": searchProductsBy.product,
        }
      })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.poductId.name.keyword": searchProductsBy.product
      //   }
      // })

      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.poductId.name": `* ${searchProductsBy.product}`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.poductId.name": `${searchProductsBy.product} *`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.poductId.name": `* ${searchProductsBy.product} *`
      //   }
      // })

      /** seccat **/
      productMatch.push({
        "match_phrase": {
          "sellerProductId.secondaryCategoryId.name": searchProductsBy.product
        }
      })

      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.secondaryCategoryId.name": `* ${searchProductsBy.product}`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.secondaryCategoryId.name": `${searchProductsBy.product} *`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.secondaryCategoryId.name": `* ${searchProductsBy.product} *`
      //   }
      // })

      /** primcat **/
      productMatch.push({
        "match_phrase": {
          "sellerProductId.primaryCategoryId.name": searchProductsBy.product
        }
      })

      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.primaryCategoryId.name": `* ${searchProductsBy.product}`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.primaryCategoryId.name": `${searchProductsBy.product} *`
      //   }
      // })
      // productMatch.push({
      //   "wildcard": {
      //     "sellerProductId.primaryCategoryId.name": `* ${searchProductsBy.product} *`
      //   }
      // })

      /** name */
      productMatch.push({
        "match": {
          "name": {
            "query": searchProductsBy.product,
            "minimum_should_match": "100%"
          }
        }
      })
    }
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 216 ~ exports.sellerSearch= ~ productMatch", productMatch)
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 226 ~ exports.sellerSearch= ~ keywordMatch", keywordMatch)

    query.bool.should = productMatch
    query.bool["minimum_should_match"] = 1
    query.bool.must = keywordMatch

    // query.bool.filter.push({
    //   "bool": {
    //     "should": productMatch
    //   }
    // })
  }

  if (productId) {
    // const categoryId = await getCatId({_id: productId }, '_id')
    // catId = categoryId
    const categoryMatch = {
      match: {
        "sellerProductId.poductId._id": productId,
      },
    };

    query.bool.must.push(categoryMatch);
  }

  if (secondaryId) {
    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "sellerProductId.secondaryCategoryId._id": secondaryId,
      },
    };
    query.bool.must.push(categoryMatch);
  }

  if (primaryId) {
    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "sellerProductId.primaryCategoryId._id": primaryId,
      },
    };
    query.bool.must.push(categoryMatch);
  }

  if (parentId) {

    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "sellerProductId.parentCategoryId._id": parentId,
      },
    };
    query.bool.must.push(categoryMatch);
  }

  if (cityId) {
    if (Array.isArray(cityId)) {
      query.bool.must.unshift({ bool: { should: [] } });
      cityId.forEach((c) => {
        const locationMatch = {
          term: {
            // "location.city._id": c,
            "sellerType.cities.city._id": c
          },
        };
        query.bool.must[0].bool.should.push(locationMatch);
      });
    } else {
      const locationMatch = {
        term: {
          // "location.city._id": cityId,
          "sellerType.cities.city._id": cityId
        },
      };
      query.bool.must.push(locationMatch);
    }
  }

  return {
    query,
    catId
  }

}

exports.searchFromElastic = (query, range) =>
  new Promise((resolve, reject) => {

    const { skip, limit } = range;
    console.log("range", range, query)
    const body = {
      size: limit || 10,
      from: skip || 0,
      query,/* ,
      highlight, */
      // sort: { "mobile.mobile": "desc" }
    };
    const searchQuery = {
      index: INDEXNAME,
      body,
    };
    esClient
      .search(searchQuery)
      .then(async (results) => {
        const { count } = await this.getCounts(query); // To get exact count
        resolve([
          results.hits.hits,
          count,
        ]);
      })
      .catch(error => reject(error))
  })

exports.getCounts = (query) =>
  new Promise((resolve, reject) => {
    esClient
      .count({
        index: INDEXNAME,
        body: {
          query,
        },
      })
      .then(resolve)
      .catch(reject);
  });

/*

  Update doc

*/

exports.updateESDoc = async (_id, doc) => new Promise((resolve, reject) => {
  const body = {
    doc,
  };
  let id = _id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    id = id.toString();
  }

  const newData = {
    index: INDEXNAME,
    id,
    body,
  };
  console.log('elastic updatedd------------------')
  esClient.update(newData).then(resolve).catch(reject);
});