const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers } = require("../../modules");

const {
  getSellerProfile,
 getAllSellers,
 updateSeller
} = sellers;

module.exports.getSeller = async (req, res) => {
  try {
    // const { buyerID } = req;
    const { id } = req.body
    const seller = await getSellerProfile(id);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateSeller = async (req, res) => {
  try {
    // const { userID } = req
    const {id} = req.body
    const seller = await updateSeller({ _id: id }, req.body);
    respSuccess(res, seller,'Updated Successfully');
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllSellers = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const sellers = await getAllSellers(skip,limit);
    respSuccess(res, sellers);
  } catch (error) {
    respError(res, error.message);
  }
};