const mongoose = require('mongoose');
const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers, buyers, category, mastercollections } = require("../../modules");
const {
  uploadToDOSpace
} = require("../../utils/utils");
const _ = require('lodash')
const {
  getSellerProfile,
  getAllSellers,
  updateSeller,
  updateUser,
  checkUserExistOrNot,
  getSellerProductDtl,
  listAllSellerProduct,
  addProductDetails,
  getAllSellerData,
  sellersOverAllCount,
  addbusinessDetails,
  addStatutoryDetails,
  addContactDetails,
  addCompanyDetails,
  deleteSellerProduct,
  getSellerVal
} = sellers;
const {
  updateBuyer,
  getRFPData
} = buyers;
const {
  getAllSellerTypes
} = category
const {
  deleteMasterProduct
} = mastercollections

/*Get seller detail*/
module.exports.getSeller = async (req, res) => {
  try {
    const { id } = req.params
    const seller = await getSellerProfile(id);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};

/*Update Buyer Seller And User*/
module.exports.updateSeller = async (req, res) => {
  const { id } = req.params
  let { buyer, sellerId, userID, businessDetails, statutoryDetails, contactDetails, companyProfile, establishmentPhotos, deactivateAccount } = req.body
  const _buyer = buyer || {};
  console.log("🚀 ~ file: sellerController.js ~ line 41 ~ module.exports.updateSeller= ~ req.body", req.body, id)
  try {
    if (buyer) {
      console.log(' buyerrrrrrrrrrrrrrrrrrrrrr')
      let userData = {
        name: (_buyer && _buyer.name),
        city:
          (_buyer && _buyer.location && _buyer.location.city) || null,
        email: (_buyer && _buyer.email) || null,
      };

      let buyerData = {
        userId: userID,
        ..._buyer,
      };

      let sellerData;
      sellerData = {
        userId: userID,
        ..._buyer,
      };

      if ((_buyer.mobile && _buyer.mobile.length)) {
        buyerData.mobile = _buyer.mobile[0]["mobile"];
        buyerData.countryCode =
          _buyer.mobile[0]["countryCode"] || mobile[0]["countryCode"];
        sellerData.mobile = _buyer.mobile;
      }
      // console.log(buyerData, sellerData, userData, ' rrrrrrrrrrrrrrrrrrr')

      const __user = await updateUser({ _id: userID }, userData);
      const __buyer = await updateBuyer({ userId: userID }, buyerData);
      const __seller = await updateSeller({ _id: id }, sellerData);
    }
    let newData = {}
    let seller
    if (businessDetails) {
      console.log(' Busiunbessssssssssssssssssss')
      const bsnsDtls = await addbusinessDetails(id, businessDetails)
      newData.busenessId = bsnsDtls._id
      seller = await updateSeller({
        _id: id
      }, newData)
    }
    if (statutoryDetails) {
      console.log('ssssssssssssssss')
      // let statutoryDetails = {
      //   company: JSON.parse(company),
      //   CinNumber: JSON.parse(CinNumber),
      //   GstNumber: JSON.parse(GstNumber),
      //   IeCode: JSON.parse(IeCode),
      // }
      // if (req.files && req.files.multidoc) {
      //   let data = {
      //     Key: `${sellerID}/${req.files.multidoc.name}`,
      //     body: req.files.multidoc.data
      //   }
      //   const multidoc = await uploadToDOSpace(data)
      //   statutoryDetails.company.name = req.files.multidoc.name;
      //   statutoryDetails.company.code = multidoc.Location;
      // }
      // if (req.files && req.files.gst) {
      //   let data = {
      //     Key: `${sellerID}/${req.files.gst.name}`,
      //     body: req.files.gst.data
      //   }
      //   const gst = await uploadToDOSpace(data)
      //   statutoryDetails.GstNumber.name = req.files.gst.name;
      //   statutoryDetails.GstNumber.code = gst.Location;
      // }
      const statutoryDtls = await addStatutoryDetails(
        id,
        statutoryDetails,
      )
      newData.statutoryId = statutoryDtls._id
      seller = await updateSeller({
        _id: id
      }, newData)
      console.log("🚀 ~ file: sellerController.js ~ line 120 ~ module.exports.updateSeller= ~ seller", seller)
    }

    if (contactDetails) {
      console.log('contac details --------------')
      contactDetails = {
        ...contactDetails,
        sellerId: id
      }
      const cntctDtls = await addContactDetails(id, contactDetails)
      seller = await updateSeller({
        _id: id
      }, {
        sellerContactId: cntctDtls._id
      })
    }
    if (companyProfile) {
      console.log("conpany profile -------------")
      companyProfile = {
        ...companyProfile,
        sellerId: id
      }
      const cmpnyPrfl = await addCompanyDetails(id, companyProfile)
      newData.sellerCompanyId = cmpnyPrfl._id
      seller = await updateSeller({
        _id: id
      }, {
        sellerCompanyId: cmpnyPrfl._id
      })
    }
    if(establishmentPhotos){
      console.log('esssssssssssssssss')
    }
    if (deactivateAccount) {
      seller = await updateSeller({
        _id: id
      }, {
        deactivateAccount
      })
    }
    

    respSuccess(res, "Updated Successfully");
  } catch (error) {
    console.log(error, ' ------------- error')
    respError(res, error.message);
  }
};

/*Get all seller*/
module.exports.getAllSellers = async (req, res) => {
  try {
    const { sellerType, search, skip, limit } = req.query
    const sellers = await getAllSellerData({ name: { $regex: `^${search}`, $options: "i" }, userId: { $ne: null } }, { skip: parseInt(skip), limit: parseInt(limit), sort: 1 });
    const count = await sellersOverAllCount(search)
    respSuccess(res, { sellers, count });
  } catch (error) {
    respError(res, error.message);
  }
};

/*Get all seller types*/
module.exports.getAllSellerTypes = async (req, res) => {
  try {
    const { skip, limit } = req.body
    const sellerTypes = await getAllSellerTypes(skip, limit);
    respSuccess(res, sellerTypes);
  } catch (error) {
    respError(res, error.message);
  }
};
/*Get seller product detail*/
module.exports.getSellerProductDtl = async (req, res) => {
  try {
    const { id } = req.params
    const sellerPrdDtl = await getSellerProductDtl({ _id: id });
    respSuccess(res, sellerPrdDtl);
  } catch (error) {
    respError(res, error.message);
  }
};
/*Get all seller products*/
module.exports.listAllSellerProduct = async (req, res) => {
  try {
    const { serviceType, search, skip, limit } = req.body
    const sellerProducts = await listAllSellerProduct(serviceType, search, skip, limit);
    respSuccess(res, sellerProducts);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Update seller product
*/
module.exports.updateSellerProduct = async (req, res) => {
  try {
    let productDetails = JSON.parse(req.body.productDetails)
    if (req.files && (req.files.document || req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4)) {
      if (req.files && req.files.document) {
        let data = {
          Key: `${productDetails.sellerId}/${req.files.document.name}`,
          body: req.files.document.data
        }
        const _document = await uploadToDOSpace(data)
        productDetails.productDetails.document.name = req.files.document.name;
        productDetails.productDetails.document.code = _document.Location;
      }
      if (req.files && req.files.image1) {
        let data = {
          Key: `${productDetails.sellerId}/${req.files.image1.name}`,
          body: req.files.image1.data
        }
        const _image1 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image1.name = req.files.image1.name;
        productDetails.productDetails.image.image1.code = _image1.Location;
      }
      if (req.files && req.files.image2) {
        let data = {
          Key: `${productDetails.sellerId}/${req.files.image2.name}`,
          body: req.files.image2.data
        }
        const _image2 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image2.name = req.files.image2.name;
        productDetails.productDetails.image.image2.code = _image2.Location;
      }
      if (req.files && req.files.image3) {
        let data = {
          Key: `${productDetails.sellerId}/${req.files.image3.name}`,
          body: req.files.image3.data
        }
        const _image3 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image3.name = req.files.image3.name;
        productDetails.productDetails.image.image3.code = _image3.Location;
      }
      if (req.files && req.files.image4) {
        let data = {
          Key: `${productDetails.sellerId}/${req.files.image4.name}`,
          body: req.files.image4.data
        }
        const _image4 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image4.name = req.files.image4.name;
        productDetails.productDetails.image.image4.code = _image4.Location;
      }
    }
    const updatePrdDtl = await addProductDetails(productDetails._id, productDetails);
    respSuccess(res, updatePrdDtl);
  } catch (error) {
    respError(res, error.message);
  }
};
module.exports.getRfqRequest = async (req, res) => {
  try {
    const {
      userID,
      params
    } = req;
    let condition = { $and: [{ sellerId: params.id }, { requestType: 1 }] }
    const RFP = await getRFPData(condition, {});
    // let totalCount = await getRFP(condition);
    // totalCount = totalCount.length;
    respSuccess(res, RFP);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.deleteSellerProduct = async (req, res) => {
  console.log("delete product--------")
  try {
    const { id } = req.params
    let result
    let sellerProduct = await deleteSellerProduct(id)
    const masterDelete = await deleteMasterProduct(id)
    let findSeller = await getSellerVal({ _id: sellerProduct.sellerId })
    if (findSeller) {
      let objVal = mongoose.Types.ObjectId(id);
      let arrVal = _.findIndex(findSeller.sellerProductId, objVal);
      if (arrVal > -1) {
        findSeller.sellerProductId.splice(arrVal, 1)
        result = await updateSeller({
          _id: sellerProduct.sellerId
        }, findSeller)

      }
    }
    respSuccess(res, "Product successfully deleted")
  } catch (error) {
    console.log("🚀 ~ file: sellerController.js ~ line 318 ~ module.exports.deleteSellerProduct ~ error", error)
    respError(res, error.message)
  }
}