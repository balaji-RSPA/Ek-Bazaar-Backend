const camelcaseKeys = require('camelcase-keys')
const { machineIdSync } = require('node-machine-id')
const { respSuccess, respError } = require('../../utils/respHadler')
const mongoose = require('mongoose');

const { sellers } = require('../../modules')
const  _ = require('lodash')

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
  deleteSellerProduct,
  getSellerVal,
  addSellerProduct
} = sellers

module.exports.getSeller = async (req, res) => {
  try {
    const { userID } = req
    const { id } = req.query
    const seller = userID ? await getSeller(userID) : await getSellerProfile(id)
    console.log(seller, ' dinal ressss')
    respSuccess(res, seller)
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.updateSeller = async (req, res) => {
  try {
    let {
      businessDetails,
      statutoryDetails,
      contactDetails,
      establishmentPhotos,
      companyProfile,
      productDetails,
      notifications,
      deactivateAccount
    } = req.body
    console.log(establishmentPhotos, ' docccc')
    const { userID } = req
    const user = await getSeller(userID)
    const sellerID = user._id
    let newData = {}
    let seller
    // addProductDetails;
    if (businessDetails) {
      const bsnsDtls = await addbusinessDetails(sellerID, businessDetails)
      newData.busenessId = bsnsDtls._id
      seller = await updateSeller({ _id: sellerID }, newData)
    }
    if (statutoryDetails) {
      const statutoryDtls = await addStatutoryDetails(
        sellerID,
        statutoryDetails,
      )
      newData.statutoryId = statutoryDtls._id
      seller = await updateSeller({ _id: sellerID }, newData)
    }
    if (contactDetails) {
    // console.log(sellerID, "🚀 ~ file: sellersController.js ~ line 51 ~ module.exports.updateSeller= ~ req.body", req.body)
      contactDetails = {
        ...contactDetails,
        sellerId: sellerID
      }
      const cntctDtls = await addContactDetails(sellerID, contactDetails)
      seller = await updateSeller({ _id: sellerID }, {sellerContactId: cntctDtls._id })
      // newData.busenessId = cntctDtls._id;
    }
    if (establishmentPhotos) {

    console.log(establishmentPhotos, ' es')
      const estblsmntPhts = await addEstablishmentPhotos(
        sellerID,
        establishmentPhotos,
      )
      newData.establishmentId = estblsmntPhts._id
    }
    if (companyProfile) {
      companyProfile = {
        ...companyProfile,
        sellerId: sellerID
      }
      const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile)
      newData.sellerCompanyId = cmpnyPrfl._id
      seller = await updateSeller({ _id: sellerID }, { sellerCompanyId: cmpnyPrfl._id })
    }
    if (productDetails) {
      let productsId = []
      let prdctDtls
      if (productDetails._id !== null) {
        prdctDtls = await addProductDetails(productDetails._id, productDetails)
      } else {
        prdctDtls = await addProductDetails(null, productDetails)
      }
      productsId = user.sellerProductId

      if (
        (productsId &&
          productsId.length &&
          productDetails &&
          productDetails._id === null) ||
        productDetails._id === undefined
      ) {
        productsId.push(prdctDtls._id)
      } else if (
        (prdctDtls._id &&
          productsId.length === 0 &&
          productDetails._id === null) ||
          productDetails._id === undefined
      ) {
        productsId = []
        productsId.push(prdctDtls._id)
      }
      newData.sellerProductId = productsId
      seller = await updateSeller({ _id: sellerID }, newData)
    }
    if(notifications){
      seller = await updateSeller({ _id: sellerID },{notifications : notifications})
    }
    if(deactivateAccount){
      seller = await updateSeller({ _id: sellerID },{deactivateAccount})
    }

    // console.log(seller, ' .........00000000000')
    // const seller = await updateSeller({ _id: sellerID }, newData)
    respSuccess(res, seller, 'Profile updated successfully')
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await getAllSellers()
    respSuccess(res, sellers)
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.sellerBulkInsert = async (req, res) => {
  try {
    const reqData = req.body
    let bulkData = []
    let result
    for (let index = 0; index < reqData.length; index++) {
      const seller = reqData[index]
      // const result = await inserSeller(seller)
      result = await structureSellerData(seller)
      // bulkData.push(result)
    }
    console.log('data upload completed')
    // await sellerBulkInser(bulkData);
    console.log('upload completed')
    respSuccess(res, result)
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.deleteSellerProduct = async (req, res) => {
  try {
    let result
    let sellerProduct = await deleteSellerProduct(req.body.id)
    let findSeller = await getSellerVal(sellerProduct.sellerId)
    if (findSeller) {
      let objVal = mongoose.Types.ObjectId(req.body.id);
      let arrVal = _.findIndex(findSeller.sellerProductId, objVal);
      if (arrVal > -1) {
        findSeller.sellerProductId.splice(arrVal, 1)
        result = await updateSeller({ _id: sellerProduct.sellerId }, findSeller)
      }
    }
    respSuccess(res, result,"Product successfully deleted")
  } catch (error) {
    respError(res, error.message)
  }
}
module.exports.addSellerProduct = async(req,res)=>{
  try {
    let result 
    let sellerId = req.body && req.body[0] && req.body[0].sellerId
    if(sellerId){
      const findSeller = await getSellerProfile(sellerId)
      result = await addSellerProduct(req.body)
      if(findSeller && findSeller.length){
        findSeller[0].sellerProductId = findSeller[0].sellerProductId.concat(result);
      }
      seller = await updateSeller({ _id: sellerId }, findSeller[0])
      respSuccess(res,seller,"Successfully added product")
    }
  }catch(error){
    respError(res,error.message)
  }
}
module.exports.updateSellerProduct = async(req,res)=>{
  const {id,inStock} = req.body
  try {
    let updateDetail = await addProductDetails(id, {"productDetails.inStock" : inStock})
    let seller = await getSellerProfile(updateDetail.sellerId)
    respSuccess(res,seller,"Successfully updated")
  }catch(error){
    respError(res,error.message)
  }
}
