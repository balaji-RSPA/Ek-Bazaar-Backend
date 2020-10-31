const camelcaseKeys = require("camelcase-keys");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers } = require("../../modules");
const {
  checkSellerExistOrNot,
  addSeller,
  updateSeller,
  getSeller,
  getAllSellers,
  addbusinessDetails,
  addCompanyDetails,
  addContactDetails,
  addEstablishmentPhotos,
  addProductDetails,
  addStatutoryDetails,
  updateSellerPassword,
  inserSeller,
  sellerBulkInser
} = sellers;
const { createToken } = require("../../utils/utils");

module.exports.checkSellerExistOrNot = async(req, res) => {
  try {
    const { mobile } = req.body;
    const seller = await checkSellerExistOrNot(mobile);
    if (seller) {
      respSuccess(res);
    }
    respError(res, "No selelr found with this number");
  } catch (error) {
    respError(res, error.message);
  }
}

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const seller = await checkSellerExistOrNot(mobile);
    if (seller) {
      respError(res, "A seller with this number already exist");
    }
    const otp = 1234;
    respSuccess(res, { otp });
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.verifySellerMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const { sellerID } = req;
    const seller = await updateSeller(sellerID, { isPhoneVerified: true });
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.addSeller = async (req, res) => {
  try {
    req.body.isPhoneVerified = true;
    const seller = await addSeller(req.body);
    if (seller) {
      const deviceId = machineIdSync();
      // const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { sellerId: seller._id });
      // const finalData = {
      //   userAgent,
      //   sellerId: seller._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(data._id, finalData)
      return respSuccess(res, { token, seller }, "Auth Success");
    }
    return respError(res, "Buyer not added");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getSeller = async (req, res) => {
  try {
    const { sellerID } = req;
    const seller = await getSeller(sellerID);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateSeller = async (req, res) => {
  try {
    const {
      businessDetails,
      statutoryDetails,
      contactDetails,
      establishmentPhotos,
      companyProfile,
      productDetails,
    } = req.body;
    const { sellerID } = req;
    let newData = {};
    addProductDetails;
    switch (req.body) {
      case businessDetails: {
        const bsnsDtls = await addbusinessDetails(sellerID, businessDetails);
        newData.busenessId = bsnsDtls._id;
        break;
      }
      case statutoryDetails: {
        const statutoryDtls = await addStatutoryDetails(
          sellerID,
          statutoryDetails
        );
        newData.busenessId = statutoryDtls._id;
        break;
      }
      case contactDetails: {
        const cntctDtls = await addContactDetails(sellerID, contactDetails);
        newData.busenessId = cntctDtls._id;
        break;
      }
      case establishmentPhotos: {
        const estblsmntPhts = await addEstablishmentPhotos(
          sellerID,
          establishmentPhotos
        );
        newData.busenessId = estblsmntPhts._id;
        break;
      }
      case companyProfile: {
        const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile);
        newData.busenessId = cmpnyPrfl._id;
        break;
      }
      case productDetails: {
        let productsId = [];
        const prdctDtls = await addProductDetails(productDetails);
        const seller = await getSeller(id);
        productsId = seller.productsId;
        if (productsId.length) productsId.push(prdctDtls._id);
        else productsId.push(prdctDtls._id);
        newData.sellerProductId = productsId;
      }
      default:
        "";
    }
    const seller = await updateSeller(id, newData);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await getAllSellers();
    respSuccess(res, sellers);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateSellerPassword = async (req, res) => {
  try {
    const { mobile } = req.body;
    const seller = await updateSellerPassword(mobile, req.body);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};


module.exports.sellerBulkInsert = async (req, res) => {

  try {

    const reqData = req.body
    let bulkData = [];
    for (let index = 0; index < reqData.length; index++) {

      const seller = reqData[index];
      const result = await inserSeller(seller)
      // console.log("module.exports.sellerBulkInsert -> result", result)
      bulkData.push(result)
      
    }
    // console.log("module.exports.sellerBulkInsert -> redData", bulkData)
    await sellerBulkInser(bulkData);
    respSuccess(res, "Data Uploades Successfully!")
   
  } catch (error) {

    respError(res, error.message);
    
  }

}
