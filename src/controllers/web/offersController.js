const { respSuccess, respError } = require("../../utils/respHadler");
const { sellerSearch, searchFromElastic } = require('../../modules/elasticSearchModule')
module.exports.getAllSellerOffers =  async (req, res) => {

    try {
        const {skip, limit, search} = req.query
        const que = {
            ... req.query,
            offerSearch: true
        }
        const result = await sellerSearch(que)
        const { query, catId, aggs } = result;
        const seller = await searchFromElastic(query, req.query, {});
        console.log(seller[0], ' thi sos seller offers----------------')
        const resp = {
            total:seller[1],
            data: seller[0]
            // relatedCat,
          };
        return respSuccess(res, resp)
    } catch (error) {
        
    }
    
}

module.exports.getAllBuyerRequest  = async (req, res) => {
    
    try {
        console.log(' thi is buyer request----------------')

    } catch (error) {

    }

}