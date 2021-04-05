const { reject } = require('lodash')
const mongoose = require("mongoose");
const { MasterCollection } = require('../models')

const { esClient } = require("../../config/db");

exports.addToElastic = (doc) =>
  new Promise((resolve, reject) => {
    if (!doc) {
      reject(new Error("Tender didn't save in db!"));
    }
    const { _id } = doc;
    console.log(_id , 'add to elastic')
    const body = {
      index: 'tradedb.mastercollections',
      id: _id.toString(),
    };

    const docData = JSON.parse(JSON.stringify(doc));
    delete docData._id;

    body.body = docData;
    console.log(body, ' elastic body---------')

    esClient.index(body, (err, resp, status) => {
      if (err) {
        console.error(err, "Tender didn't save in Elastic!");
        resolve(err);
      } else {
        console.log(_id, " Elastic Added");
        resolve("Done!");
      }
    });
  });

  exports.insertManyEslint = async(data) => {

    try {

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            const esData = JSON.parse(JSON.stringify(element));
            console.log("1111111111111111111111111111111111", esData)
            await this.addToElastic(esData);
            
        }
        
    } catch (error) {
        
    }

  }


//   await this.updateESDoc(doc._id, esData); // and updated to ES
exports.updateESDoc = async (_id, doc) =>
  new Promise((resolve, reject) => {
console.log("11111111111111111111111111", _id, doc)
    const body = {
      doc,
    };
    let id = _id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      id = id.toString();
    }

    const newData = {
      index: 'tradedb.mastercollections',
      id,
      body,
    };
    console.log("2222222222222222222222", newData)
    esClient.update(newData).then(resolve).catch(reject);
  });


module.exports.getMaster = (reqQuery, range) => new Promise((resolve, reject) => {

    const skip = parseInt(range.skip) || 0;
    const limit = parseInt(range.limit) || 100;
    // console.log("🚀 ~ file: masterModule.js ~ line 5 ~ module.exports.getMaster= ~ reqQuery", reqQuery, range)

    MasterCollection.find(reqQuery)
        .skip(skip).
        limit(limit)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.addMaster = (data) => new Promise((resolve, reject) => {

    MasterCollection.create(data)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})
module.exports.insertManyMaster = (data) => new Promise((resolve, reject) => {

    MasterCollection.insertMany(data)
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.updateMaster = (query, data) => new Promise((resolve, reject) => {

    MasterCollection.findOneAndUpdate(query, data, { new: true })
        .then((doc) => {
            // if(doc){
            //     const esData = JSON.parse(JSON.stringify(doc));
            //     // await this.updateESDoc(doc._id, esData); // and updated to ES
            // }
            resolve(doc);
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})

module.exports.deleteMasterProduct = (data) =>
    new Promise((resolve, reject) => {
        MasterCollection.findByIdAndDelete({
            _id: data
        })
            .then((doc) => {
                resolve(doc)
            })
            .catch(reject)
    })

module.exports.updateMasterBulkProducts = (query, data) => new Promise((resolve, reject) => {
    MasterCollection.updateMany(query, data, {
        new: true
    })
        .then((doc) => {
            resolve(doc)
        })
        .catch((error) => reject(error))
})

module.exports.getMasterRecords = (reqQuery, range) => new Promise((resolve, reject) => {

    const skip = parseInt(range.skip) || 0;
    const limit = parseInt(range.limit) || 100;

    MasterCollection.find(reqQuery)
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 })
        .populate('sellerId._id')
        .lean()
        .then((doc) => {
            resolve(doc)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })

})