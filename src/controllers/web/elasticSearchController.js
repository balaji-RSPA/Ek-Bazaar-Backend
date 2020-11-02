const camelcaseKeys = require('camelcase-keys');
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category } = require('../../modules')
const { addSellerBulkIndex, sellerSearch, searchFromElastic } = elastic
const { getPrimaryCategory } = category
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
        //     name: 'Basmati Rice'
        // }
        // const primaryCatId = await getCatId(que)
        const result = await sellerSearch(reqQuery)
        const { query, catId } = result
        const seller = await searchFromElastic(query, range)
        const relatedCat = await getPrimaryCategory(catId)
        const resp = {
            total: seller[1],
            data: seller[0],
            relatedCat
        }
        return respSuccess(res, resp)

    } catch (error) {
        
    }

}

