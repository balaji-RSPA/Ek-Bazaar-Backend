const { respSuccess, respError } = require("../../utils/respHadler");
const { sellerSearch, searchFromElastic, getSuggestions } = require('../../modules/elasticSearchModule')
const { buyers } = require("../../modules");
const {
    getRFPData,
    postRFP,
    getRFP,
    createSellerContact,
    deleteBuyerRequest
} = buyers;
const { sendSMS } = require("../../utils/utils");
const isProd = process.env.NODE_ENV === "production";
const _ = require('lodash')
const moment = require("moment")

module.exports.getAllOffers = async (req, res) => {

    try {
        const requestIds = []
        let newRecords = []
        const q1 = {
            requestType: 11, $or: [/* {
                "productDetails.validity": {
                    $gte: new Date().toISOString(),
                }
            }, */ {
                    "productDetails.validity": {
                        $gte: new Date(moment().startOf('day')),
                    }
                }]
        }
        const buyerRequest = await getRFP(q1)
        // console.log("🚀 ~ file: offersController.js ~ line 33 ~ module.exports.getAllOffers= ~ buyerRequest", buyerRequest.length)
        const requestIds1 = buyerRequest && buyerRequest.length && buyerRequest.map((val) => {
            // console.log("🚀 ~ file: offersController.js ~ line 35 ~ requestIds1 ~ val", val.productDetails.name)
            if (val.productDetails.name.search !== 'level1') {
                val.productDetails.name.level1 && val.productDetails.name.level1.id && requestIds.push(val.productDetails.name.level1 && val.productDetails.name.level1.id)

                // val.productDetails.name.level2 && val.productDetails.name.level2.id && requestIds.push(val.productDetails.name.level2 && val.productDetails.name.level2.id)

                val.productDetails.name && val.productDetails.name.search === 'level2' ? requestIds.push(val.productDetails.name.id || null) : val.productDetails.name.level2 && val.productDetails.name.level2.id && requestIds.push(val.productDetails.name.level2 && val.productDetails.name.level2.id)

            } else {
                requestIds.push(val.productDetails.name.id)
            }
        }) || []

        const query = {
            "bool": {
                "must": [
                    {
                        exists: {
                            field: "status"
                        }
                    },
                    {
                        term: {
                            "status": true
                        }
                    },
                    {
                        "exists": {
                            "field": "offers"
                        }
                    },
                    {
                        "range": {
                            "offers.validity.toDate": {
                                // "gte": new Date().toISOString()
                                "gte": new Date(moment.utc().startOf('day'))
                            }
                        }
                    }
                ]
            }
        }

        const aggs = {
            "aggs": {
                "level1": {
                    "terms": {
                        "field": "parentCategoryId._id.keyword"
                    },
                    "aggs": {
                        "level2": {
                            "terms": {
                                "field": "primaryCategoryId._id.keyword"
                            },
                            "aggs": {
                                "level3": {
                                    "terms": {
                                        "field": "secondaryCategoryId._id.keyword"
                                    },
                                    "aggs": {
                                        "level4": {
                                            "terms": {
                                                "field": "poductId._id.keyword"
                                            },
                                            "aggs": {
                                                "level5": {
                                                    "terms": {
                                                        "field": "productSubcategoryId._id.keyword"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const data = await searchFromElastic(query, { skip: 0, limit: 2000 }, aggs);
        // data[0].forEach(elem => console.log("________source", elem._source))
        // console.log("🚀 ~ file: offersController.js ~ line 102 ~ module.exports.getAllOffers= ~ data", data)
        let aggsCount = data[2];
        let arrayObj = []
        let level2Array = []
        let level1 = aggsCount.level1 && aggsCount.level1.buckets

        for (let i = 0; i < level1.length; i++) {
            let item = level1[i]
            let documentCount = item.doc_count
            let obj = {}

            const query = {
                "bool": {
                    "must": {
                        "match": {
                            "id": item.key
                        }
                    }
                }
            }
            let cat = await getSuggestions(query, { skip: 0, limit: 1 }, false, {})
            if (cat && cat.length) {
                cat = cat[0] && cat[0].length ? cat[0][0]["_source"] : {}
                // console.log("🚀 ~ file: offersController.js ~ line 119 ~ module.exports.getAllOffers= ~ cat", cat)
                if (cat.id) { obj._id = cat.id; obj.vendorId = cat.vendorId }
            }

            // console.log("🚀 ~ file: offersController.js ~ line 128 ~ module.exports.getAllOffers= ~ requestIds", requestIds, item.key)
            const catExist = requestIds && requestIds.length && requestIds.filter((val) => (val === item.key)).length
            if (catExist) {
                documentCount += catExist
            } else {

            }


            let products = item.level2.buckets && item.level2.buckets.length && await Promise.all(item.level2.buckets.map(async elem => {


                let _count = elem.doc_count
                const _catExist = requestIds && requestIds.length && requestIds.filter((val) => val === elem.key).length

                if (_catExist) {
                    _count = elem.doc_count + _catExist
                }
                let _obj = {
                    count: _count
                }

                query.bool.must.match.id = elem.key
                let _cat = await getSuggestions(query, { skip: 0, limit: 1 }, false, {})
                if (_cat && _cat.length) {
                    _cat = _cat[0] && _cat[0].length ? _cat[0][0]["_source"] : {}
                    if (_cat.id) { _obj._id = _cat.id; _obj.key = _cat.name }
                }


                return _obj

            }))


            let _prdcts = buyerRequest.filter(req => products && products.length && products.findIndex(item => item._id === (req.productDetails && req.productDetails.name && req.productDetails.name.level2 && req.productDetails.name.level2.id)) === -1)

            _prdcts && _prdcts.length ? products
                .push(..._prdcts.filter(item => (item.productDetails && item.productDetails.name && item.productDetails.name.level1 && item.productDetails.name.level1.id) === obj._id)
                    .map(item => (item.productDetails && item.productDetails.name && item.productDetails.name.search && item.productDetails.name.search === 'level2'
                        ? {
                            _id: item.productDetails && item.productDetails.name && item.productDetails.name.id && item.productDetails.name.id,

                            key: item.productDetails && item.productDetails.name && item.productDetails.name.name && item.productDetails.name.name,

                            count: buyerRequest.filter(elem => elem.productDetails && elem.productDetails.name && elem.productDetails.name.name.toString().trim() === (item.productDetails && item.productDetails.name && item.productDetails.name.name && item.productDetails.name.name.toString().trim())).length
                        }
                        : item.productDetails.name.level2 && {
                            _id: item.productDetails && item.productDetails.name && item.productDetails.name.level2 && item.productDetails.name.level2.id,

                            key: item.productDetails && item.productDetails.name && item.productDetails.name.level2 && item.productDetails.name.level2.name,

                            // count: buyerRequest.filter(elem => elem.productDetails && elem.productDetails.name && elem.productDetails.name.level2 && elem.productDetails.name.level2.name == item.productDetails && item.productDetails.name && item.productDetails.name.level2 && item.productDetails.name.level2.name).length,

                            count: buyerRequest.filter(elem => elem.productDetails && elem.productDetails.name && elem.productDetails.name.level2 && elem.productDetails.name.level2.name && elem.productDetails.name.level2.name.toString().trim() === (item.productDetails && item.productDetails.name && item.productDetails.name.level2 && item.productDetails.name.level2.name && item.productDetails.name.level2.name.toString().trim())).length
                        }))) : ""
            products = products && products.length && products.filter((b) => b) || []
            // Extra Line added
            products = Array.from(new Set(products.map(a => a._id))).map(id => {
                return products.find(a => a._id === id)
            })

            obj = {
                ...obj,
                // title: `${cat.name} (${documentCount})`,
                title: `${cat.name}`,
                products
            }
            console.log(obj," 1111111111111111111111111111111")
            arrayObj.push(obj)

        }

        buyerRequest && buyerRequest.length && /* await Promise.all */(buyerRequest.forEach(req => {
            if (req.productDetails.name.level1 && req.productDetails.name.level1.id) {
                let index = arrayObj.findIndex(elem => elem._id === req.productDetails.name.level1.id)

                // if (index === -1 && new Date(req.productDetails.validity).toLocaleString() > new Date().toLocaleString()) {
                //     let _products = []
                //     let productsCount = buyerRequest.filter(_req => _req.productDetails.name.level1.id === req.productDetails.name.level1.id).reduce((acc, curr) => {
                //         if (curr.productDetails.name.level2) {
                //             if (!acc.hasOwnProperty(curr.productDetails.name.level2.name)) {
                //                 acc[curr.productDetails.name.level2.name] = 1
                //             } else {
                //                 acc[curr.productDetails.name.level2.name] = acc[curr.productDetails.name.level2.name] + 1
                //             }
                //         } else if (!curr.productDetails.name.level2) {
                //             if (!acc.hasOwnProperty(curr.productDetails.name.level2.name)) {
                //                 acc[curr.productDetails.name.name] = 1
                //             } else {
                //                 acc[curr.productDetails.name.name] = acc[curr.productDetails.name.name] + 1
                //             }
                //         }
                //         return acc
                //     }, {})
                //     _products = Object.keys(productsCount).map(count => {
                //         let __products = buyerRequest.find(item => item.productDetails && item.productDetails.name.level2 && item.productDetails.name.level2.name === count)

                //         let _obj = {
                //             key: count,
                //             count: productsCount[count],
                //             _id: __products && __products["productDetails"] && __products["productDetails"]["name"] && __products["productDetails"]["name"]["level2"] && __products["productDetails"]["name"]["level2"]["id"]
                //         }

                //         return _obj
                //     })
                //     let obj = {
                //         _id: req.productDetails.name.level1.id,
                //         title: `${req.productDetails.name.level1.name} (${buyerRequest.filter(item => item.productDetails.name.level1.id === req.productDetails.name.level1.id).length})`,
                //         products: _products,
                //         vendorId: req.productDetails.name.level1.vendorId
                //     }
                //     arrayObj.push(obj)
                // }

                if (index === -1 && new Date(req.productDetails.validity).toLocaleString() > new Date().toLocaleString()) {
                    let _products = []

                    let productsCount = buyerRequest.filter(_req => {
                        return ((_req.productDetails && _req.productDetails.name && _req.productDetails.name.level1 && _req.productDetails.name.level1.id) && _req.productDetails.name.level1.id === (req.productDetails && req.productDetails.name && req.productDetails.name.level1 && req.productDetails.name.level1.id) && req.productDetails.name.level1.id)
                    })
                    productsCount = productsCount.reduce((acc, curr) => {
                        if (curr.productDetails.name.level2) {
                            if (!acc.hasOwnProperty(curr.productDetails.name.level2.name)) {
                                acc[curr.productDetails.name.level2.name] = 1
                            } else {
                                acc[curr.productDetails.name.level2.name] = acc[curr.productDetails.name.level2.name] + 1
                            }
                        } else if (!curr.productDetails.name.level2) {
                            if (!acc.hasOwnProperty(curr.productDetails.name && curr.productDetails.name.level2 && curr.productDetails.name.level2.name)) {
                                acc[curr.productDetails.name.name] = 1
                            } else {
                                acc[curr.productDetails.name.name] = acc[curr.productDetails.name.name] + 1
                            }
                        }
                        return acc
                    }, {})
                    // _products = productsCount && productsCount.length && Object.keys(productsCount).map(count => {
                    //     let __products = buyerRequest.find(item => (item.productDetails && productDetails.name && item.productDetails.name.level2 && productDetails.name.level2.name) && item.productDetails.name.level2.name === count)
                    _products = productsCount && Object.keys(productsCount).length && Object.keys(productsCount).map(count => {
                        let __products = buyerRequest.find(item => (item.productDetails && item.productDetails.name && item.productDetails.name.level2 && item.productDetails.name.level2.name) && item.productDetails.name.level2.name === count)


                        let _obj = {
                            key: count,
                            count: productsCount[count],
                            _id: __products && __products["productDetails"] && __products["productDetails"]["name"] && __products["productDetails"]["name"]["level2"] && __products["productDetails"]["name"]["level2"]["id"]
                        }

                        return _obj
                    })
                    let obj = {
                        _id: req.productDetails.name.level1.id,
                        // title: `${req.productDetails.name.level1.name} (${buyerRequest.filter(item => (item.productDetails && item.productDetails.name && item.productDetails.name.level1 && item.productDetails.name.level1.id) && item.productDetails.name.level1.id === (req.productDetails && req.productDetails.name && req.productDetails.name.level1 && req.productDetails.name.level1.id) && req.productDetails.name.level1.id).length})`,
                        title: `${req.productDetails.name.level1.name}`,
                        products: _products,
                        vendorId: (req.productDetails && req.productDetails.name && req.productDetails.name && req.productDetails.name.level1 && req.productDetails.name.level1.vendorId) || req.productDetails.name.vendorId
                    }
                    console.log(obj," 22222222222222222222222222")
                    arrayObj.push(obj)
                }

            } /* else if (!req.productDetails.name.level1) {
                let index = arrayObj.findIndex(elem => elem._id === req.productDetails.name.id)
                console.log("🚀 ~ file: offersController.js ~ line 170 ~ module.exports.getAllOffers= ~ index", index)
                if (index === -1) {
                    let _products = []
                    let productsCount = buyerRequest.filter(_req => _req.productDetails.name.id === req.productDetails.name.id).reduce((acc, curr) => {
                        if (curr.productDetails.name.level2) {
                            if (!acc.hasOwnProperty(curr.productDetails.name.level2.name)) {
                                acc[curr.productDetails.name.level2.name] = 1
                            } else {
                                acc[curr.productDetails.name.level2.name] = acc[curr.productDetails.name.level2.name] + 1
                            }
                        } else if (!curr.productDetails.name.level2) {
                            if (!acc.hasOwnProperty(curr.productDetails.name.level2.name)) {
                                acc[curr.productDetails.name.name] = 1
                            } else {
                                acc[curr.productDetails.name.name] = acc[curr.productDetails.name.name] + 1
                            }
                        }
                        return acc
                    }, {})
                    console.log("🚀 ~ file: offersController.js ~ line 189 ~ productsCount ~ productsCount", productsCount)
                    let obj = {
                        _id: req.productDetails.name.id,
                        title: `${req.productDetails.name.name} (${buyerRequest.filter(item => item.productDetails.name.id === req.productDetails.name.id).length})`,
                        products: _products
                    }
                    arrayObj.push(obj)
                }
            } */
        }))
        // console.log(JSON.stringify(arrayObj), '  ramesh ---------------------------')

        respSuccess(res, { offersCount: arrayObj })

    } catch (error) {
        console.log(error, ' elastic error-------------')
        respError(res, error.message)

    }

}

module.exports.getAllSellerOffers = async (req, res) => {

    try {
        const { skip, limit, search, level1, level2 } = req.query
        console.log("🚀 ~ file: offersController.js ~ line 252 ~ module.exports.getAllSellerOffers= ~ req.query", req.query)
        let _query = {
            requestType: 11, $or: [/* {
                "productDetails.validity": {
                    $gte: new Date().toISOString(),
                }
            }, */ {
                    "productDetails.validity": {
                        $gte: new Date(moment().startOf('day')),
                    }
                }], $and: []
        }
        console.log("🚀 ~ file: offersController.js ~ line 269 ~ module.exports.getAllSellerOffers= ~ new Date(moment().startOf('day')).toISOString()", new Date(moment().startOf('day')).toISOString(), new Date().toISOString())
        const query = {
            "bool": {
                "must": [
                    {
                        exists: {
                            field: "status"
                        }
                    },
                    {
                        term: {
                            "status": true
                        }
                    },
                    {
                        "exists": {
                            "field": "offers"
                        }
                    },
                    {
                        "range": {
                            "offers.validity.toDate": {
                                // "gte": new Date().toISOString()
                                "gte": new Date(moment.utc().startOf('day'))
                            }
                        }
                    }
                ]
            }
        }

        if (level1) {
            query.bool.must.push({
                "match": {
                    "parentCategoryId._id": level1
                }
            })
            _query["$and"] = [
                ..._query["$and"],
                {
                    $or: [
                        { "productDetails.name.id": level1 },
                        { "productDetails.name.level1.id": level1 }
                    ]
                }
            ]
        } else if (level2) {
            query.bool.must.push({
                "match": {
                    "primaryCategoryId._id": level2
                }
            })
            _query["$and"] = [
                ..._query["$and"],
                {
                    $or: [
                        { "productDetails.name.level2.id": level2 },
                        { "productDetails.name.id": level2 }
                    ]
                }
            ]
        }
        if (search) {
            query.bool.must.push({
                "bool": {
                    "should": [
                        {
                            "wildcard": {
                                "productDetails.name.keyword": `${search}*`
                            }
                        },
                        {
                            "wildcard": {
                                "productDetails.name.keyword": `*${search}*`
                            }
                        }
                    ]
                }

            })
            _query["$and"] = [
                ..._query["$and"],
                {
                    $or: [
                        { "productDetails.name.name": { $regex: `${search}`, $options: "i" } },
                        { "productDetails.name.level1.name": { $regex: `${search}`, $options: "i" } },
                        { "productDetails.name.level2.name": { $regex: `${search}`, $options: "i" } },
                        { "productDetails.name.level3.name": { $regex: `${search}`, $options: "i" } },
                        { "productDetails.name.level4.name": { $regex: `${search}`, $options: "i" } },
                    ]
                }
            ]
        }
        const aggs = {
            "aggs": {
                "level1": {
                    "terms": {
                        "field": "parentCategoryId._id.keyword"
                    },
                    "aggs": {
                        "level2": {
                            "terms": {
                                "field": "primaryCategoryId._id.keyword"
                            },
                            "aggs": {
                                "level3": {
                                    "terms": {
                                        "field": "secondaryCategoryId._id.keyword"
                                    },
                                    "aggs": {
                                        "level4": {
                                            "terms": {
                                                "field": "poductId._id.keyword"
                                            },
                                            "aggs": {
                                                "level5": {
                                                    "terms": {
                                                        "field": "productSubcategoryId._id.keyword"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const seller = await searchFromElastic(query, { skip: 0, limit: 1000 }, aggs);
        let _seller = seller.length && seller[0]
        let sellerOffers = []
        let buyerRequests = []
        sellerOffers = _seller.length && _seller.map(prod => {
            let _prod = prod["_source"]
            let product = _prod.productSubcategoryId && _prod.productSubcategoryId.length ? _prod.productSubcategoryId[0]["name"] :
                _prod.poductId && _prod.poductId.length ? _prod.poductId[0]["name"] :
                    _prod.secondaryCategoryId && _prod.secondaryCategoryId.length ? _prod.secondaryCategoryId[0]["name"] :
                        _prod.primaryCategoryId && _prod.primaryCategoryId.length ? _prod.primaryCategoryId[0]["name"] :
                            _prod.parentCategoryId && _prod.parentCategoryId.length ? _prod.parentCategoryId[0]["name"] : ""

            let obj = {
                title: product,
                location: _prod.offers.location.city.label || _prod.offers.location && _prod.offers.location.country && _prod.offers.location.country.label,
                price: `Rs.${_prod.offers.price.price}/${_prod.offers.price.unit}`,
                amountInRs: _prod.offers.price.price,
                productUnit: _prod.offers.price.unit,
                validity: moment(_prod.offers.validity.toDate).format('ll'),
                seller: true,
                value: `Rs.${_prod.offers.price.price}/${_prod.offers.price.unit}`,
                sellerId: _prod.sellerId._id,
                _id: prod._id
            }
            // console.log("🚀 ~ file: offersController.js ~ line 201 ~ module.exports.getAllSellerOffers= ~ obj", obj)
            return obj
        })
        buyerRequests = await getRFPData(_query, { skip: 0, limit: 1000 })
        console.log("🚀 ~ file: offersController.js ~ line 371 ~ module.exports.getAllSellerOffers= ~ buyerRequests", buyerRequests)
        console.log("🚀 ~ file: offersController.js ~ line 371 ~ module.exports.getAllSellerOffers= ~ _query", _query)
        buyerRequests = buyerRequests.length && buyerRequests.map(buyer => {

            let obj = {
                title: buyer.productDetails.name.label,
                location: buyer.productDetails.location.city.label || buyer.productDetails.location.country.label,
                price: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                amountInRs: buyer.productDetails.price,
                productUnit: buyer.productDetails.weight,
                validity: moment(buyer.productDetails.validity.toDate || buyer.productDetails.validity).format('ll'),
                btnname: 'View more',
                seller: false,
                value: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                _id: buyer._id, // add request Object _id
                quantity: `${buyer.productDetails.quantity} ${buyer.productDetails.weight}`
            }
            return obj

        })
        return respSuccess(res, { offers: sellerOffers, requests: buyerRequests })
    } catch (error) {
        console.log(error, ' eeee')
        return respError(res, error.message)

    }

}

module.exports.buyerRequestOffers = async (req, res) => {

    try {
        let { details } = req.body
        console.log(details.productDetails.validity, new Date(details.productDetails.validity))
        details = {
            ...details,
            productDetails: {
                ...details.productDetails,
                validity: new Date(details.productDetails.validity)
            },

        }
        const rfp = await postRFP(details)
        return respSuccess(res, "Offer request done successfully")

    } catch (error) {

        return respError(res, errors.messsage)

    }

}

module.exports.sellerContactOffer = async (req, res) => {

    try {
        const { details } = req.body
        const result = await getRFP({ _id: details.rfqId });
        if (result) {
            const contactdetails = {
                ...details,
                buyerDetails: result && result[0].buyerDetails || "",
                productDetails: result && result[0].productDetails || "",
            }
            console.log("🚀 ~ file: offersController.js ~ line 66 ~ module.exports.sellerContactOffer= ~ result", contactdetails)
            const responce = await createSellerContact(contactdetails)
            if (isProd) {
                const smsData = result && result[0].buyerDetails.mobile ? await sendSMS(result && result[0].buyerDetails.mobile, "Seller responded tou your offer") : "";
                console.log("🚀 ~ file: offersController.js ~ line 77 ~ module.exports.sellerContactOffer= ~ smsData", smsData)
            }
        }
        return respSuccess(res, "Successfully contacted!")

    } catch (error) {

        respError(res, error.message)

    }

}

module.exports.getAllBuyerRequest = async (req, res) => {

    try {
        const { id } = req.params
        const { skip, limit, search } = req.query
        const result = await getRFPData({ buyerId: id, requestType: 11, $or: [{ 'productDetails.name.label': { $regex: `^${search}`, $options: "i" } }, { 'productDetails.location.city.label': { $regex: `^${search}`, $options: "i" } }, { 'productDetails.location.state.label': { $regex: `^${search}`, $options: "i" } }] });
        let buyerRequests = []
        if (result) {
            buyerRequests = result.length && result.map(buyer => {
                let obj = {
                    title: buyer.productDetails.name.label,
                    location: buyer.productDetails.location.city.label ? buyer.productDetails.location.city.label : buyer.productDetails.location.country.label,
                    price: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                    amountInRs: buyer.productDetails.price,
                    productUnit: buyer.productDetails.weight,
                    validity: moment(buyer.productDetails.validity).format('ll'),
                    btnname: 'View more',
                    seller: true,
                    value: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                    _id: buyer._id // add request Object _id
                }
                return obj

            })
        }
        return respSuccess(res, buyerRequests)

    } catch (error) {
        respError(res, error.message)

    }

}

module.exports.deleteBuyerRequest = async (req, res) => {

    try {
        const { id } = req.params
        console.log("🚀 ~ file: offersController.js ~ line 299 ~ module.exports.deleteBuyerRequest ~ req.params", req.params)
        const result = await deleteBuyerRequest({ _id: id })
        console.log("🚀 ~ file: offersController.js ~ line 300 ~ module.exports.deleteBuyerRequest ~ result", result)
        return respSuccess(res, "Delete Successfully")

    } catch (error) {
        respError(res, error.message)

    }

}
