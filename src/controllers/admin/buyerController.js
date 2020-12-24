const { respSuccess, respError } = require("../../utils/respHadler");
const { buyers } = require("../../modules");
const { startTimer } = require("winston");

const {
  getBuyer,
  updateBuyer,
  getAllBuyers,
} = buyers;

module.exports.getBuyer = async (req, res) => {
  try {
    const { userID } = req;
    const buyer = await getBuyer(userID);
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateBuyer = async (req, res) => {
  try {
    const { userID } = req
    const buyer = await updateBuyer({ userId: userID }, req.body);
    respSuccess(res,buyer,'Updated Successfully');
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllBuyers = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const buyers = await getAllBuyers(skip,limit);
    respSuccess(res, buyers);
  } catch (error) {
    respError(res, error.message);
  }
};