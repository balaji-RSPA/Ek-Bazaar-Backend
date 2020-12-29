const { respSuccess, respError } = require("../../utils/respHadler");
const { buyers,sellers } = require("../../modules");
const { startTimer } = require("winston");
// const { getUserProfile } = require("../../modules/sellersModule");

const {
  getBuyerAdmin,
  updateBuyer,
  getAllBuyers,
} = buyers;
const {
  updateSeller,
  updateUser,
  checkUserExistOrNot,
  getSeller,
} = sellers;

/**Get buyer detail*/
module.exports.getBuyer = async (req, res) => {
  const {id} = req.params
  try {
    const buyer = await getBuyerAdmin({_id:id});
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};


/*Update Buyer Seller And User*/
module.exports.updateBuyer = async (req, res) => {//update only name,email,phonenumber
  const { _id,name,email,countryCode,mobile } = req.body
  try{
  const userData = {};
  const sellerData = {};
  const getUserId = await getBuyerAdmin({_id});
  const checkMobile = await checkUserExistOrNot({mobile:mobile});
  if(checkMobile && checkMobile.length && JSON.stringify(checkMobile[0]._id) !== JSON.stringify(getUserId.userId)){
    throw new Error("Mobile number is already exist");
  }
  if(name){
    userData.name = name;
    sellerData.name = name;
  }
  if(email){
    userData.email = email;
    sellerData.email = email;
  }
  if(mobile && countryCode){
    userData.mobile = mobile;
    userData.countryCode = countryCode;
    sellerData.mobile = [{mobile : mobile, countryCode : countryCode}]
    // sellerData.mobile = getseller.mobile.some((val)=>val.mobile === mobile) ?  getseller.mobile : [...getseller.mobile,{mobile : mobile, countryCode : countryCode}];
  }
  const user = await updateUser({ _id: getUserId.userId }, userData);
  const seller = await updateSeller({ userId: getUserId.userId }, sellerData);
  const buyer = await updateBuyer({_id}, req.body);
  respSuccess(res, { user,seller, buyer }, "Updated Successfully");
  }catch(error){
    respError(res, error.message);
  }
};

/** Get all buyer*/
module.exports.getAllBuyers = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const buyers = await getAllBuyers(skip,limit);
    respSuccess(res, buyers);
  } catch (error) {
    respError(res, error.message);
  }
};