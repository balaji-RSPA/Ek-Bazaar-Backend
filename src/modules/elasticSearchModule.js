const mongoose = require("mongoose");
const esClient  = require("../../config/db");
const { INDEXNAME } = require("../utils/globalConstants");
const { Sellers } = require("../models");

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