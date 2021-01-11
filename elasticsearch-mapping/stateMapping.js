var client = require('../config/db').esClient;
const {getAllStates} = require("../src/modules/locationsModule")
const index = "states"
const type = "_doc"

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
                    }
                }
            }
        }, async (err, resp, status) => {
            if (err) {
                console.error(err, status);
                reject(err)
            }
            else {

                let data = await getAllStates(0, 2000)
                const bulkBody = []
                data.forEach(state => {
                    bulkBody.push({
                        index: {
                            _index: index,
                            _type: type,
                            _id: state._id
                        }
                    })
                    bulkBody.push({id: state._id, name: state.name})
                })
                client.bulk({
                    body: bulkBody
                }, (err, resp, status) => {
                    if (err) {
                        console.log(err)
                        reject()
                    } else {
                        console.log(resp, status)
                    }
                });
                console.log('Successfully Created Index', status);
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
