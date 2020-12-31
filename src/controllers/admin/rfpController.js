const { respSuccess, respError } = require("../../utils/respHadler");
const { rfp } = require("../../modules");
const {
 getAllRFP,
 getRFPDetail
 } = rfp;
/**
 * Get RFP detail
*/
module.exports.getRFPDetail = async (req, res) => {
  try {
    const { id } = req.params
    const rfpDtl = await getRFPDetail({_id : id });
    respSuccess(res, rfpDtl);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get all RFP
*/
module.exports.getAllRFP = async (req, res) => {
  try {
    const { skip,limit } = req.body
    const rfp = await getAllRFP(skip,limit);
    respSuccess(res, rfp);
  } catch (error) {
    respError(res, error.message);
  }
};