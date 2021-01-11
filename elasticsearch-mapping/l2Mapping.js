var client = require('../config/db').esClient;
const index = "categoriesl2"
const type = "level2"

const { PrimaryCategory } = require("../src/models")

module.exports.checkIndices = function () {
    return new Promise((resolve, reject) => {
        client.indices.exists({ index }, (err, res, status) => {
            if (res) {
                console.log('index already exists')
                resolve();
            } else {
                client.indices.create({ index, includeTypeName: true }, (err, res, status) => {
                    if (err) {
                        console.log(err)
                        reject(err);
                    }
                    else {
                        console.log(res, status)
                        resolve(res, status)
                    }
                })
            }
        })
    })

}

module.exports.putMapping = function () {
    console.log("Creating Mapping index");
    return new Promise((resolve, reject) => {

        client.indices.existsType({ index, type }, (err, resp, status) => {
            if (err) {
                console.log(err);
                reject(err)
            }
            else {
                console.log(resp, status);
            }
        })
        client.indices.putMapping({
            index,
            includeTypeName: true,
            type,
            body: {
                [type]: {
                    properties: {
                        id: { type: 'text' },
                        name: { type: 'keyword' },
                        vendorId: { type: 'text' },
                        search: { type: "text" }
                    }
                }
            }
        }, async (err, resp, status) => {
            if (err) {
                console.error(err, status);
                reject(err)
            }
            else {

                const data = await structureLevel2Categories()
                client.bulk({
                    body: data
                }, (err, resp, status) => {
                    if (err) {
                        console.log(err)
                        reject()
                    } else {
                        console.log(resp, status)
                    }
                });
                console.log('Successfully Created Index', status, resp);
                resolve(status, resp)
            }
        });
    })
}

module.exports.deleteIndices = function () {
    client.indices.delete({ index }, function (err, resp, status) {
        console.log("delete", resp);
    });
}

module.exports.deleteRecords = function (query) {
    return new Promise((resolve, reject) => {
        client.deleteByQuery({
            index,
            type,
            body: {
                query: {
                    match: query
                }
            }
        }, function (error, response) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                console.log(response);
                resolve(response)
            }
        });
    })
}

function structureLevel2Categories() {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await PrimaryCategory.countDocuments()
        console.log("functionstructureLevel2Categories -> documentCount", documentCount)
        const level2 = await getLevel2Categories();
        level2.forEach(element => {
            bulkBody.push({
                index: {
                    _index: index,
                    _type: type,
                    _id: element._id
                }
            });
            bulkBody.push({
                name: element.name,
                id: element._id,
                vendorId: element.vendorId,
                search: "level2"
            });

        });
        resolve(bulkBody);
    })
}

function getLevel2Categories() {
    return new Promise((resolve, reject) => {
        PrimaryCategory.find({})
            .select("name vendorId")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}
