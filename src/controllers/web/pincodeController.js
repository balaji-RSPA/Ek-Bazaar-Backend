const { insertMany } = require("../../models/countriesSchema");
const { respSuccess, respError } = require("../../utils/respHadler");
const pincodeJson = require('../../pincode.json');
const { Pincode } = require('../../modules');
const { create } = Pincode;

/**
 * Insert pincode
 */
module.exports.addPincode = async (req, res) => {
  try {
    let result = await create(pincodeJson);
    respSuccess(res,undefined,"Successfully inserted")
  } catch (error) {
    respError(res, error.message);
  }
};