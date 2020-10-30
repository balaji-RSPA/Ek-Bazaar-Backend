const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category } = require('../../modules')
const { addSellerBulkIndex, sellerSearch, searchFromElastic } = elastic
const { getCatId } = category
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
        
        console.log('seller search')
         const range = {
            skip: parseInt(0),
            limit: parseInt(2)
        }
        const que = {
            name: 'Basmati Rice'
        }
        const primaryCatId = await getCatId(que)
        const result = await sellerSearch(primaryCatId)
        const seller = await searchFromElastic(result, range)
        const resp = {
            total: seller[1],
            tenders: seller[0]
        }
        return respSuccess(res, resp)
        // console.log("module.exports.serachSeller -> result", result)

    } catch (error) {
        
    }

}