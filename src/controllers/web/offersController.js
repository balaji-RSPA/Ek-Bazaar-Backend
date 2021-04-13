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

const moment = require("moment")

module.exports.getAllOffers = async (req, res) => {

    try {

        const query = {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "offers"
                        }
                    },
                    {
                        "range": {
                            "offers.validity.toDate": {
                                "gte": new Date().toISOString()
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
        let aggsCount = data[2];
        let arrayObj = []
        let level1 = aggsCount.level1 && aggsCount.level1.buckets

        for (let i = 0; i < level1.length; i++) {
            let item = level1[i]
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
                if (cat.id) obj._id = cat.id
            }

            let products = item.level2.buckets && item.level2.buckets.length && await Promise.all(item.level2.buckets.map(async elem => {

                let _obj = { count: elem.doc_count }

                query.bool.must.match.id = elem.key
                let _cat = await getSuggestions(query, { skip: 0, limit: 1 }, false, {})
                if (_cat && _cat.length) {
                    _cat = _cat[0] && _cat[0].length ? _cat[0][0]["_source"] : {}
                    if (_cat.id) { _obj._id = _cat.id; _obj.key = _cat.name }
                }

                return _obj

            }))

            obj = {
                ...obj,
                title: `${cat.name}(${item.doc_count})`,
                products
            }
            arrayObj.push(obj)

        }

        respSuccess(res, { offersCount: arrayObj })

    } catch (error) {

        respError(res, error.message)

    }

}

module.exports.getAllSellerOffers = async (req, res) => {

    try {
        const { skip, limit, search, level1, level2 } = req.query
        console.log("🚀 ~ file: offersController.js ~ line 138 ~ module.exports.getAllSellerOffers= ~ req.query", req.query)
        const query = {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "offers"
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
        } else if (level2) {
            query.bool.must.push({
                "match": {
                    "primaryCategoryId._id": level2
                }
            })
        }
        if(search) {
            query.bool.must.push({
                "match_phrase": {
                    "productDetails.name": search
                }
            })
        }

        const seller = await searchFromElastic(query, {skip: 0, limit: 1000}, {});
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
                location: _prod.offers.location.city.label,
                price: `Rs.${_prod.offers.price.price}/${_prod.offers.price.unit}`,
                validity: moment(_prod.offers.validity.toDate).format('ll'),
                seller: true,
                value: `Rs.${_prod.offers.price.price}/${_prod.offers.price.unit}`,
                sellerId: _prod.sellerId._id,
                _id: prod._id
            }
            console.log("🚀 ~ file: offersController.js ~ line 201 ~ module.exports.getAllSellerOffers= ~ obj", obj)
            return obj
        })
        buyerRequests = await getRFPData({ requestType: 11, "productDetails.validity": { $gte: new Date().toISOString() } }, {skip: 0, limit: 1000})
        buyerRequests = buyerRequests.length && buyerRequests.map(buyer => {

            let obj = {
                title: buyer.productDetails.name.label,
                location: buyer.productDetails.location.city.label,
                price: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                validity: moment(buyer.productDetails.validity.toDate).format('ll'),
                btnname: 'View more',
                seller: false,
                value: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                _id: buyer._id // add request Object _id
            }
            return obj

        })
        return respSuccess(res, {offers: sellerOffers, requests: buyerRequests})
    } catch (error) {

    }

}

module.exports.buyerRequestOffers = async (req, res) => {

    try {
        const { details } = req.body
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
        const { skip, limit, search} = req.query
        const result = await getRFPData({buyerId:  id, requestType: 11, $or: [{'productDetails.name.label': {$regex: `^${search}`, $options: "i"}},{'productDetails.location.city.label': {$regex: `^${search}`, $options: "i"}}, {'productDetails.location.state.label': {$regex: `^${search}`, $options: "i"}}]});
        let buyerRequests = []
        if (result) {
            buyerRequests = result.length && result.map(buyer => {
                let obj = {
                    title: buyer.productDetails.name.label,
                    location: buyer.productDetails.location.city.label,
                    price: `Rs.${buyer.productDetails.price}/${buyer.productDetails.weight}`,
                    validity: moment(buyer.productDetails.validity.toDate).format('ll'),
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
        const result = await deleteBuyerRequest({_id: id})
        console.log("🚀 ~ file: offersController.js ~ line 300 ~ module.exports.deleteBuyerRequest ~ result", result)
        return respSuccess(res, "Delete Successfully")

    } catch (error) {
        respError(res, error.message)

    }

}
