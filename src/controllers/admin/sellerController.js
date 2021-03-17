const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers,buyers,category } = require("../../modules");
const {
  uploadToDOSpace
} = require("../../utils/utils")
const {
  getSellerProfile,
  getAllSellers,
  updateSeller,
  updateUser,
  checkUserExistOrNot,
  getSellerProductDtl,
  listAllSellerProduct,
  addProductDetails
} = sellers;
const {
  updateBuyer,
} = buyers;
const {
  getAllSellerTypes
} = category

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
  const { _id,name,email,mobile } = req.body
  try{
  const userData = {};
  const buyerData = {};
  const getUserId = await getSellerProfile(_id);
  const checkMobile = await checkUserExistOrNot({mobile:mobile[0].mobile});
  if(checkMobile && 
    checkMobile.length && 
    getUserId && 
    getUserId.length && 
    JSON.stringify(checkMobile[0]._id) !== JSON.stringify(getUserId[0].userId
    )){
    throw new Error("Mobile number is already exist");
  }
  if(name){
    userData.name = name;
    buyerData.name = name;
  }
  if(email){
    userData.email = email;
    buyerData.email = email;
  }
  if(mobile && mobile.length){
    userData.mobile = mobile[0].mobile;
    userData.countryCode = mobile[0].countryCode;
    buyerData.mobile = mobile[0].mobile;
    buyerData.countryCode = mobile[0].countryCode;
  }
  const user = await updateUser({ _id: getUserId[0].userId }, userData);
  const seller = await updateSeller({_id}, req.body);
  const buyer = await updateBuyer({ userId: getUserId[0].userId }, buyerData);
  respSuccess(res, { user,seller, buyer }, "Updated Successfully");
  }catch(error){
    respError(res, error.message);
  }
};

/*Get all seller*/
module.exports.getAllSellers = async (req, res) => {
  try {
    const {sellerType,search,skip,limit} = req.body
    const sellers = await getAllSellers(sellerType,search,skip,limit);
    respSuccess(res, sellers);
  } catch (error) {
    respError(res, error.message);
  }
};

/*Get all seller types*/
module.exports.getAllSellerTypes = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const sellerTypes = await getAllSellerTypes(skip,limit);
    respSuccess(res, sellerTypes);
  } catch (error) {
    respError(res, error.message);
  }
};
/*Get seller product detail*/
module.exports.getSellerProductDtl = async (req, res) => {
  try {
    const {id} = req.params
    const sellerPrdDtl = await getSellerProductDtl({_id : id});
    respSuccess(res, sellerPrdDtl);
  } catch (error) {
    respError(res, error.message);
  }
};
/*Get all seller products*/
module.exports.listAllSellerProduct = async (req, res) => {
  try {
    const {serviceType,search,skip,limit} = req.body
    const sellerProducts = await listAllSellerProduct(serviceType,search,skip,limit);
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
    if(req.files && (req.files.document || req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4)){
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
    const updatePrdDtl = await addProductDetails(productDetails._id,productDetails);
    respSuccess(res, updatePrdDtl);
  } catch (error) {
    respError(res, error.message);
  }
};