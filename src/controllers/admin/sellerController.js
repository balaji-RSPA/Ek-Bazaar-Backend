const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers,buyers,category } = require("../../modules");

const {
  getSellerProfile,
  getAllSellers,
  updateSeller,
  updateUser,
  checkUserExistOrNot
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
    const {skip,limit} = req.body
    const sellers = await getAllSellers(skip,limit);
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