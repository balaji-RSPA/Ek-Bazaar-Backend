var client = require('../config/db').esClient;
const index = process.env.NODE_ENV !== "production" ? "tradedb.mastercollections" : "trade-live.mastercollections"
const type = "_doc"
const { config } = require("./mapping")

client.cluster.health({}, function (err, resp, status) {
    console.log("-- Client Health --", resp);
});

const settings = {
    "number_of_shards": 6,
    "number_of_replicas": 2,
    "analysis": {
        "filter": {
            "name_ngrams": {
                "side": "front",
                "max_gram": 50,
                "min_gram": 2,
                "type": "edgeNGram"
            }/* ,
            "name_ngrams_back": {
                "side": "back",
                "max_gram": 50,
                "min_gram": 2,
                "type": "edgeNGram"
            },
            "name_middle_ngrams": {
                "type": "nGram",
                "max_gram": 50,
                "min_gram": 2
            } */
        },
        "analyzer": {
            "full_name": {
                "filter": [
                    // "standard",
                    "lowercase",
                    "asciifolding"
                ],
                "type": "custom",
                "tokenizer": "standard"
            },
            "partial_name": {
                "filter": [
                    // "standard",
                    "lowercase",
                    "asciifolding",
                    "name_ngrams"
                ],
                "type": "custom",
                "tokenizer": "standard"
            }/* ,
            "partial_name_back": {
                "filter": [
                    "standard",
                    "lowercase",
                    "asciifolding",
                    "name_ngrams_back"
                ],
                "type": "custom",
                "tokenizer": "standard"
            },
            "partial_middle_name": {
                "filter": [
                    "standard",
                    "lowercase",
                    "asciifolding",
                    "name_middle_ngrams"
                ],
                "type": "custom",
                "tokenizer": "standard"
            } */
        }
    }
}

module.exports.checkIndicesMaster = function () {
    return new Promise((resolve, reject) => {
        client.indices.exists({ index }, (err, res, status) => {
            if (res) {
                console.log('index already exists')
                resolve();
            } else {
                client.indices.create({ index, includeTypeName: true, body: { settings } }, (err, res, status) => {
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

module.exports.putMappingMaster = function () {
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
                [type]: config
            }
        }, async (err, resp, status) => {
            if (err) {
                console.error(err, status);
                reject(err)
            }
            else {
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
