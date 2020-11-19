const camelcaseKeys = require("camelcase-keys");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");

const { sellers } = require("../../modules");
const {
  updateSeller,
  getSeller,
  getAllSellers,
  addbusinessDetails,
  addCompanyDetails,
  addContactDetails,
  addEstablishmentPhotos,
  addProductDetails,
  addStatutoryDetails,
  inserSeller,
  sellerBulkInser,
  getSellerProfile,
  structureSellerData,
} = sellers;

module.exports.getSeller = async (req, res) => {
  try {
    const { userID } = req;
    const { id } = req.query;
    const seller = userID
      ? await getSeller(userID)
      : await getSellerProfile(id);
    console.log(seller, " dinal ressss");
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateSeller = async (req, res) => {
  try {
    let {
      businessDetails,
      statutoryDetails,
      contactDetails,
      establishmentPhotos,
      companyProfile,
      productDetails,
    } = req.body;
    console.log(req.body, "sdsdfsfsfsfsdfffffff");
    const { userID } = req;
    const user = await getSeller(userID);
    console.log(user, "..........//////");
    const sellerID = user._id;
    let newData = {};
    let seller
    // addProductDetails;
    if (businessDetails) {
      const bsnsDtls = await addbusinessDetails(sellerID, businessDetails);
      console.log(bsnsDtls, ";;;;;;;;");
      newData.busenessId = bsnsDtls._id;
      seller = await updateSeller({ _id: sellerID }, newData);
    }
    if (statutoryDetails) {
      const statutoryDtls = await addStatutoryDetails(
        sellerID,
        statutoryDetails
      );
        console.log(statutoryDtls, ':::::::::')
      newData.statutoryId = statutoryDtls._id;
      seller = await updateSeller({ _id: sellerID }, newData);
    }
    if (contactDetails) {
      const cntctDtls = await addContactDetails(sellerID, contactDetails);
      // newData.busenessId = cntctDtls._id;
    }
    if (establishmentPhotos) {
      const estblsmntPhts = await addEstablishmentPhotos(
        sellerID,
        establishmentPhotos
      );
      newData.establishmentId = estblsmntPhts._id;
    }
    if (companyProfile) {
      const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile);
      newData.sellerCompanyId = cmpnyPrfl._id;
    }
    if (productDetails) {
      let productsId = [];
      const prdctDtls = await addProductDetails(productDetails);
      const seller = await getSeller(id);
      productsId = seller.productsId;
      if (productsId.length) productsId.push(prdctDtls._id);
      else productsId.push(prdctDtls._id);
      newData.sellerProductId = productsId;
    }

    console.log(newData, " .........00000000000");
    // const seller = await updateSeller({ _id: sellerID }, newData);
    respSuccess(res, seller, "Profile updated successfully");
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

module.exports.sellerBulkInsert = async (req, res) => {
  try {
    const reqData = req.body;
    let bulkData = [];
    let result;
    for (let index = 0; index < reqData.length; index++) {
      const seller = reqData[index];
      // const result = await inserSeller(seller)
      result = await structureSellerData(seller);
      // bulkData.push(result)
    }
    console.log("data upload completed");
    // await sellerBulkInser(bulkData);
    console.log("upload completed");
    respSuccess(res, result);
  } catch (error) {
    respError(res, error.message);
  }
};
