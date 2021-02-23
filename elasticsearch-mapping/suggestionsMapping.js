var client = require('../config/db').esClient;
const index =  process.env.NODE_ENV === "production" ? "tradedb.suggestions" : "suggestions" //"trade-live.suggestions"
const type = "_doc"

const { ParentCategory, PrimaryCategory, SecondaryCategory, Products, ProductsSubCategories, Suggestions } = require("../src/models")

client.cluster.health({}, function (err, resp, status) {
    console.log("-- Client Health --", resp);
});

module.exports.checkIndices = function () {
    return new Promise((resolve, reject) => {
        client.indices.exists({ index: index }, (err, res, status) => {
            if (res) {
                console.log('index already exists')
                resolve();
            } else {
                client.indices.create({ index: index, includeTypeName: true }, (err, res, status) => {
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
                        "name": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    // "ignore_above": 256.0,
                                    "type": "keyword"
                                }
                            }
                        },
                        "name": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    // "ignore_above": 256.0,
                                    "type": "keyword"
                                }
                            }
                        },
                        "vendorId": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    // "ignore_above": 256.0,
                                    "type": "keyword"
                                }
                            }
                        },
                        "search": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    // "ignore_above": 256.0,
                                    "type": "keyword"
                                }
                            }
                        }
                    }
                }
            }
        }, async (err, resp, status) => {
            if (err) {
                console.error(err, status);
                reject(err)
            }
            else {

                const level1 = await structureLevel1Categories()
                const level2 = await structureLevel2Categories()
                const level3 = await structureLevel3Categories()
                const level4 = await structureLevel4Categories()
                const level5 = await structureLevel5Categories()
                const data = level1.concat(level2.concat(level3.concat(level4.concat(level5))))
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
    client.indices.delete({ index: index }, function (err, resp, status) {
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

function structureLevel1Categories() {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await ParentCategory.countDocuments()
        console.log("functionstructureLevel1Categories -> documentCount", documentCount)
        const level1 = await getLevel1Categories();
        level1.forEach(element => {
            bulkBody.push({
                index: {
                    _index: index,
                    _type: type,
                    _id: element._id
                }
            });
            bulkBody.push({
                name: element.name.toLowerCase(),
                id: element._id,
                vendorId: element.vendorId,
                search: "level1"
            });

        });
        resolve(bulkBody);
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
                name: element.name.toLowerCase(),
                id: element._id,
                vendorId: element.vendorId,
                search: "level2"
            });

        });
        resolve(bulkBody);
    })
}

function structureLevel3Categories() {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await SecondaryCategory.countDocuments()
        console.log("functionstructureLevel3Categories -> documentCount", documentCount)
        const level3 = await getLevel3Categories();
        level3.forEach(element => {
            bulkBody.push({
                index: {
                    _index: index,
                    _type: type,
                    _id: element._id
                }
            });
            bulkBody.push({
                name: element.name.toLowerCase(),
                id: element._id,
                vendorId: element.vendorId,
                search: "level3"
            });

        });
        resolve(bulkBody);
    })
}

function structureLevel4Categories() {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await Products.countDocuments()
        let skip = 0, limit = 1000
        console.log("functionstructureLevel4Categories -> documentCount", documentCount)
        for(skip; skip<=documentCount; skip+=limit) {
            const level4 = await getLevel4Categories({skip, limit});
            level4.forEach(element => {
                bulkBody.push({
                    index: {
                        _index: index,
                        _type: type,
                        _id: element._id
                    }
                });
                bulkBody.push({
                    name: element.name.toLowerCase(),
                    id: element._id,
                    vendorId: element.vendorId,
                    search: "level4"
                });
    
            });
        }
        resolve(bulkBody);
    })
}

function structureLevel5Categories() {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await ProductsSubCategories.countDocuments()
        console.log("functionstructureLevel5Categories -> documentCount", documentCount)
        const level5 = await getLevel5Categories();
        level5.forEach(element => {
            bulkBody.push({
                index: {
                    _index: index,
                    _type: type,
                    _id: element._id
                }
            });
            bulkBody.push({
                name: element.name.toLowerCase(),
                id: element._id,
                vendorId: element.vendorId,
                search: "level5"
            });

        });
        resolve(bulkBody);
    })
}

module.exports.suggestionsMapping = () => new Promise( async (resolve, reject) => {

    try {
        console.log('suggestions maaping')

        console.log(' Level 1 Start ----')
        const level1 = await this.mapLevel1Suggestions()
        console.log(' Level 1 Completed ----')
        
        console.log(' Level 2 Start ----')
        const level2 = await this.mapLevel2Suggestions()
        console.log(' Level 2 Completed ----')

        console.log(' Level 3 Start ----')
        const level3 = await this.mapLevel3Suggestions()
        console.log(' Level 3 Completed ----')

        console.log(' Level 4 Start ----')
        const level4 = await this.mapLevel4Suggestions()
        console.log(' Level 4 Completed ----')

        console.log(' Level 5 Start ----')
        const level5 = await this.mapLevel5Suggestions()
        console.log(' Level 5 Completed ----')

        console.log('------- COmpleted all level category suggestions ----')
        resolve();
        
    } catch (error) {
        console.log(error)
        reject(error)
    }

})

module.exports.mapLevel1Suggestions = function () {
    return new Promise(async (resolve, reject) => {

        const bulkBody = [];
        const documentCount = await ParentCategory.countDocuments()
        console.log("functionstructureLevel1Categories -> documentCount", documentCount)
        const level1 = await _getLevel1Categories();
        level1.forEach(element => {
            bulkBody.push({
                name: element.name.toLowerCase(),
                _id: element._id,
                id: element._id,
                l1:element.vendorId,
                vendorId: element.vendorId,
                search: "level1"
            });

        });
        await bulkInsertSuggestions(bulkBody)
        console.log('Level 1 indexing limit')
        // console.log(bulkBody)
        resolve();
    })
}

module.exports.mapLevel2Suggestions = function () {
    return new Promise(async (resolve, reject) => {

        const documentCount = await PrimaryCategory.countDocuments()
        console.log("functionstructureLevel2Categories -> documentCount", documentCount)
        let skip = 0, limit = 500
        for (skip; skip <= documentCount; skip += limit) {
            const level2 = await _getLevel2Categories({ skip, limit });
            console.log("module.exports.mapLevel2Suggestions -> level2", level2.length)
            const bulkBody = [];
            
            level2.forEach(element => {
                bulkBody.push({
                    name: element.name.toLowerCase(),
                    _id: element._id,
                    id: element._id,
                    l1: element.l1,
                    vendorId: element.vendorId,
                    search: "level2"
                });

            });
            await bulkInsertSuggestions(bulkBody)
            console.log('Level 2 indexing limit --', limit)
        }

        resolve();
    })
}

module.exports.mapLevel3Suggestions = function () {
    return new Promise(async (resolve, reject) => {

        const documentCount = await SecondaryCategory.countDocuments()
        console.log("functionstructureLevel3Categories -> documentCount", documentCount)
        let skip = 0, limit = 500
        for (skip; skip <= documentCount; skip += limit) {
            const level3 = await _getLevel3Categories({ skip, limit });
            const bulkBody = [];
            level3.forEach(element => {
                bulkBody.push({
                    name: element.name.toLowerCase(),
                    _id: element._id,
                    id: element._id,
                    vendorId: element.vendorId,
                    l1: element.l1,
                    search: "level3"
                });

            });
            await bulkInsertSuggestions(bulkBody)
            console.log('Level 3 indexing limit --', limit)
        }
        resolve();
    })
}

module.exports.mapLevel4Suggestions = function () {
    return new Promise(async (resolve, reject) => {

        const documentCount = await Products.countDocuments()
        console.log("functionstructureLevel4Categories -> documentCount", documentCount)
        let skip = 0, limit = 1000
        for (skip; skip <= documentCount; skip += limit) {
            const level4 = await _getLevel4Categories({ skip, limit });
            const bulkBody = [];
            level4.forEach(element => {
                bulkBody.push({
                    name: element.name.toLowerCase(),
                    _id: element._id,
                    id: element._id,
                    vendorId: element.vendorId,
                    l1: element.l1,
                    search: "level4"
                });

            });
            await bulkInsertSuggestions(bulkBody)
            console.log('Level 4 indexing limit --', limit)
        }

        resolve();
    })
}

module.exports.mapLevel5Suggestions = function () {
    return new Promise(async (resolve, reject) => {

        const documentCount = await ProductsSubCategories.countDocuments()
        console.log("functionstructureLevel5Categories -> documentCount", documentCount)
        let skip = 0, limit = 1000
        for (skip; skip <= documentCount; skip += limit) {
            const level5 = await _getLevel5Categories({ skip, limit });
            const bulkBody = [];
            level5.forEach(element => {
                bulkBody.push({
                    name: element.name.toLowerCase(),
                    _id: element._id,
                    id: element._id,
                    vendorId: element.vendorId,
                    l1: element.l1,
                    search: "level5"
                });

            });
            await bulkInsertSuggestions(bulkBody)
            console.log('Level 4 indexing limit --', limit)
        }
        resolve();
    })
}

function getLevel1Categories() {
    return new Promise((resolve, reject) => {
        ParentCategory.find({})
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function getLevel2Categories() {
    return new Promise((resolve, reject) => {
        PrimaryCategory.find({})
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function getLevel3Categories() {
    return new Promise((resolve, reject) => {
        SecondaryCategory.find({})
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function getLevel4Categories(range) {
    return new Promise((resolve, reject) => {
        Products.find({})
            .skip(range.skip)
            .limit(range.limit)
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function getLevel5Categories() {
    return new Promise((resolve, reject) => {
        ProductsSubCategories.find({})
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}


function _getLevel1Categories() {
    return new Promise((resolve, reject) => {
        ParentCategory.find({})
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function _getLevel2Categories(range) {
    return new Promise((resolve, reject) => {
        PrimaryCategory.find({})
            .select("name vendorId l1")
            .skip(range.skip)
            .limit(range.limit)
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function _getLevel3Categories(range) {
    return new Promise((resolve, reject) => {
        SecondaryCategory.find({})
            .select("name vendorId l1")
            .skip(range.skip)
            .limit(range.limit)
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function _getLevel4Categories(range) {
    return new Promise((resolve, reject) => {
        Products.find({})
            .skip(range.skip)
            .limit(range.limit)
            .select("name vendorId l1")
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function _getLevel5Categories(range) {
    return new Promise((resolve, reject) => {
        ProductsSubCategories.find({})
            .select("name vendorId l1")
            .skip(range.skip)
            .limit(range.limit)
            .then(doc => resolve(doc))
            .catch(error => reject(error))
    })
}

function bulkInsertSuggestions(data) {
    return new Promise((resolve, reject) => {
        Suggestions.insertMany(data, {
            ordered: false,
        })
            .then((doc) => {
                resolve(doc);
            })
            .catch(reject);
    })
}

