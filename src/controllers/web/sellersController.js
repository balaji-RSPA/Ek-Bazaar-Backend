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
  structureSellerData
} = sellers;

module.exports.getSeller = async (req, res) => {
  try {
    const { userID } = req;
    const { id } = req.query
    const seller = userID ? await getSeller(userID): await getSellerProfile(id);
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
    const { userID } = req;
    const user = await getSeller(userID)
    // console.log(user,"skfdjhgshfd user vaaa")
    if(!user){
      throw new Error('Seller not found');
    }
    let newData = {};
    addProductDetails;
    if(req.body.productDetails){
      console.log("inside product details")
        let productsId = [];
        const prdctDtls = await addProductDetails(req.body.productDetails);
        console.log(prdctDtls,"dshjhfgs")
        const seller = await getSeller(id);
        
        productsId = seller.productsId;
        if (productsId.length) productsId.push(prdctDtls._id);
        else productsId.push(prdctDtls._id);
        newData.sellerProductId = productsId;
        await updateSeller({_id: id},newData)
    }
    if(req.body.businessDetails){
      const bsnsDtls = await addbusinessDetails(sellerID, businessDetails);
      newData.busenessId = bsnsDtls._id;
    }
    if(req.body.statutoryDetails){
        const statutoryDtls = await addStatutoryDetails(
          sellerID,
          statutoryDetails
        );
        newData.busenessId = statutoryDtls._id;
    }
    if(req.body.contactDetails){
      const cntctDtls = await addContactDetails(sellerID, contactDetails);
      newData.busenessId = cntctDtls._id;
    }
    if(req.body.establishmentPhotos){
        const estblsmntPhts = await addEstablishmentPhotos(
          sellerID,
          establishmentPhotos
        );
        newData.busenessId = estblsmntPhts._id;
    }
    if(req.body.companyProfile){
        const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile);
        newData.busenessId = cmpnyPrfl._id;
    }

    // switch (req.body) {
    //   case businessDetails: {
    //     const bsnsDtls = await addbusinessDetails(sellerID, businessDetails);
    //     newData.busenessId = bsnsDtls._id;
    //     break;
    //   }
    //   case statutoryDetails: {
    //     const statutoryDtls = await addStatutoryDetails(
    //       sellerID,
    //       statutoryDetails
    //     );
    //     newData.busenessId = statutoryDtls._id;
    //     break;
    //   }
    //   case contactDetails: {
    //     const cntctDtls = await addContactDetails(sellerID, contactDetails);
    //     newData.busenessId = cntctDtls._id;
    //     break;
    //   }
    //   case establishmentPhotos: {
    //     const estblsmntPhts = await addEstablishmentPhotos(
    //       sellerID,
    //       establishmentPhotos
    //     );
    //     newData.busenessId = estblsmntPhts._id;
    //     break;
    //   }
    //   case companyProfile: {
    //     const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile);
    //     newData.busenessId = cmpnyPrfl._id;
    //     break;
    //   }
    //   case productDetails: {
    //     console.log("pppppdkhejgguyerwg")
    //     let productsId = [];
    //     const prdctDtls = await addProductDetails(productDetails);
    //     const seller = await getSeller(id);
        
    //     productsId = seller.productsId;
    //     if (productsId.length) productsId.push(prdctDtls._id);
    //     else productsId.push(prdctDtls._id);
    //     newData.sellerProductId = productsId;
    //     await updateSeller({_id: id},newData)
    //   }
    //   default:
    //     console.log("ddddddddddddddddddddHDjhagytafds")
    //     "";
    // }
    // const seller = await updateSeller(id, newData);
    respSuccess(res);
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

    const reqData = req.body
    let bulkData = [];
    let result;
    for (let index = 0; index < reqData.length; index++) {

      const seller = reqData[index];
      // const result = await inserSeller(seller)
      result = await structureSellerData(seller)
      // bulkData.push(result)
      
    }
    // await sellerBulkInser(bulkData);
    respSuccess(res, result)
   
  } catch (error) {

    respError(res, error.message);
    
  }

}
