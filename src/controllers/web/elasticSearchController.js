const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic } = require('../../modules')
const { addSellerBulkIndex } = elastic
module.exports.addSellerBulkIndex = async (req, res) => {

  try {
    
    const msg = await addSellerBulkIndex()
    return respSuccess(res, msg)

  } catch (err) {

    return respError(res, err.message)

  }
}