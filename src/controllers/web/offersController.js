const { respSuccess, respError } = require("../../utils/respHadler");
const { sellerSearch, searchFromElastic } = require('../../modules/elasticSearchModule')
const { buyers } = require("../../modules");
const {
    postRFP,
    getRFP,
    createSellerContact
} = buyers;

module.exports.getAllSellerOffers = async (req, res) => {

    try {
        const { skip, limit, search } = req.query
        const que = {
            ...req.query,
            offerSearch: true
        }
        const result = await sellerSearch(que)
        const { query, catId, aggs } = result;
        const seller = await searchFromElastic(query, req.query, {});
        console.log(seller[0], ' thi sos seller offers----------------')
        const resp = {
            total: seller[1],
            data: seller[0]
            // relatedCat,
        };
        return respSuccess(res, resp)
    } catch (error) {

    }

}

module.exports.getAllBuyerRequest = async (req, res) => {

    try {
        console.log(' thi is buyer request----------------')

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
        const {details} = req.body
        console.log(req.body,' seller contact offer----------------')
        const result = await getRFP({_id: details.rfqId});
        if(result){
            const contactdetails = {
                ...details,
                buyerDetails: result && result[0].buyerDetails || "",
                productDetails:result && result[0].productDetails || "",
            }
            console.log("🚀 ~ file: offersController.js ~ line 66 ~ module.exports.sellerContactOffer= ~ result", contactdetails)
            const responce = await createSellerContact(contactdetails)
        }
        return respSuccess(res, "Successfully contacted!")

    } catch (error) {

        respError(res, error.message)

    }

}