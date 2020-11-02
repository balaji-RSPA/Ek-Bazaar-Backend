const mongoose = require("mongoose");
const esClient  = require("../../config/db").esClient;
const { INDEXNAME } = require("../utils/globalConstants");
const { Sellers } = require("../models");
const { getCatId, getSecCatId  } = require('../modules/categoryModule')
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
                .populate("primaryCatId", "name venderId")
                .populate("location.state", "name region")
                .populate("location.country", "name")
                .populate("location.city", "name")
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
        `Successfully indexed ${
            (successCounter - failureCounter) * limit
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
          `Successfully indexed ${bulkBody.length - errorCount} out of ${
            bulkBody.length
          } items`
        );
        resolve("ok");
      })
      .catch(reject);
  });

exports.sellerSearch = async(reqQuery) => {

  const { cityId, productId, secondaryId, primaryId } = reqQuery
  let catId=''
    let query = {
    bool: {
      should: [],
      must: [],
      must_not: [],
    },
  };

  if(productId){
    const categoryId = await getCatId({_id: productId }, '_id')
    catId = categoryId
      const categoryMatch = {
        term: {
            "primaryCatId._id": categoryId,
        },
    };
        query.bool.must.push(categoryMatch);
  }

  if(secondaryId){
    const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    catId = categoryId
      const categoryMatch = {
        term: {
            "primaryCatId._id": categoryId,
        },
    };
        query.bool.must.push(categoryMatch);
  }

  if(primaryId){
    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    catId = primaryId
      const categoryMatch = {
        term: {
            "primaryCatId._id": primaryId,
        },
    };
        query.bool.must.push(categoryMatch);
  }
//   const cityId = [ '5e312f988acbee60ab54df37', '5f7c1eaecdb53325e1358a08' ];
  
    if (cityId) {
        if (Array.isArray(cityId)) {
            query.bool.must.unshift({ bool: { should: [] } });
            cityId.forEach((c) => {
            const locationMatch = {
                term: {
                "location.city._id": c,
                },
            };
            query.bool.must[0].bool.should.push(locationMatch);
            });
        } else {
            const locationMatch = {
            term: {
                "location.city._id": cityId,
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
    const body = {
      size: limit || 10,
      from: skip || 0,
      query/* ,
      highlight, */
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