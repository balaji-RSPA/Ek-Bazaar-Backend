const { MasterCollection, Cities, Countries, SellerTypes, Suggestions } = require("../models")

const searchSellers = function (query) {
    return new Promise(async function (resolve, reject) {
        try {
            console.log(query)
            const doc = await MasterCollection.aggregate([
                {
                    $search: {
                        index: 'tradedb.mastercollections',
                        compound: {
                            should: [
                                {
                                    text: {
                                        query: 'rice',
                                        path: 'keywords',
                                        fuzzy: {
                                            maxEdits: 1,
                                            prefixLength: 0,
                                            maxExpansions: 100
                                        },
                                        score: { "boost": { "value": 2 } }
                                    },
                                },
                                {
                                    phrase: {
                                        query: "rice",
                                        path: "keywords",
                                        score: { "boost": { "value": 3 } },
                                        slop: 0
                                    }
                                }
                            ],
                            minimumShouldMatch: 1
                        }
                    }
                },
                { $limit: parseInt(query.limit) || 10 },
                { $skip: parseInt(query.skip) || 0 },
                // {
                //     $unwind: {
                //         path: '$genre',
                //         preserveNullAndEmptyArrays: true
                //     }
                // },
                {
                    $group: {
                        _id: null,
                        uniqueGenres: { $addToSet: '$sellerId._id' }
                    }
                }
            ]).exec()
            resolve(doc.map(d => ({ _source: d, _index: 'tradedb.mastercollections', _id: d._id })))
        } catch (error) {
            console.error(error.message);
            reject(error.message)
        }
    })
}

module.exports = Object.assign({}, { searchSellers })
