const camelcaseKeys = require('camelcase-keys');
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category } = require('../../modules')
const { addSellerBulkIndex, sellerSearch, searchFromElastic } = elastic
const { /* getPrimaryCategory, */ getRelatedPrimaryCategory , getCatId } = category
module.exports.addSellerBulkIndex = async (req, res) => {

  try {
    
    const msg = await addSellerBulkIndex()
    return respSuccess(res, msg)

  } catch (err) {

    return respError(res, err.message)

  }

}

module.exports.serachSeller = async (req, res) => {

    try {
        
      const reqQuery = camelcaseKeys(req.query)
      console.log("module.exports.serachSeller -> reqQuery", reqQuery)
      const range = {
            skip: parseInt(reqQuery.skip),
            limit: parseInt(reqQuery.limit)
        }
        // const que = {
        //     _id: reqQuery.productId
        // }
        const primaryCatId = await getCatId(reqQuery, '_id')
        console.log("primaryCatId", primaryCatId)
        const result = await sellerSearch(reqQuery)
        const { query, catId } = result
        const seller = await searchFromElastic(query, range)
        const relatedCat = await getRelatedPrimaryCategory(primaryCatId)
        // console.log(" qurty result------", relatedCat)
        const resp = {
            total: seller[1],
            data: seller[0],
            relatedCat
        }
        return respSuccess(res, resp)

    } catch (error) {
        
    }

}

