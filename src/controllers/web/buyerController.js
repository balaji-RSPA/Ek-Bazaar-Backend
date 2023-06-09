const camelcaseKeys = require("camelcase-keys");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { buyers, sellers, category, elastic } = require("../../modules");
const {
  postRFP,
  checkBuyerExistOrNot,
  addBuyer,
  getBuyer,
  updateBuyer,
  getAllBuyers,
  updateBuyerPassword,
} = buyers;
const { getProductByName } = category
const { sellerSearch, searchFromElastic } = elastic
const { checkUserExistOrNot, updateUser, addUser } = sellers
const { createToken } = require("../../utils/utils");

module.exports.createRFP = async (req, res) => {
  try {
    const {mobile, name, email, location, productDetails} = req.body
    const user = await checkUserExistOrNot({mobile: mobile.mobile})
    console.log("~ user", user, productDetails)
    if(user && user.length) {
      // const range = {
      //   skip: 0,
      //   limit: 5,
      // };
      // const productResult = await getProductByName({name: productDetails.name})
      // const searchQuery = await sellerSearch({productId: productResult._id})
      // const { query } = searchQuery;
      // const seller = await searchFromElastic(query, range);
      // const resp = {
      //   total: seller[1],
      //   data: seller[0],
      // };
      // seller[0].map((sell) => {
      //   console.log(sell._source.email, '---------')
      // })
      // console.log("productResult", resp)
      const userData = {
        name,
        email,
      }
      const user = await updateUser({ mobile: mobile.mobile }, userData)
      const buyerData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        location,
        userId: user._id
      }
      const exist = await checkBuyerExistOrNot({ mobile: mobile.mobile })
      let buyer
      if (exist && exist.length)
        buyer = await updateBuyer({ userId: user._id }, buyerData)
      else
        buyer = await addBuyer(buyerData)
      const rfpData = {
        buyerId: buyer._id,
        buyerDetails: {
          name,
          email,
          mobile: mobile.mobile,
          location
        },
        productDetails
      }
      const rfp = await postRFP(rfpData)
    } else {
      const userData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        password: null
      }
      const user = await addUser(userData)
      const buyerData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        location,
        userId: user._id
      }
      const buyer = await addBuyer(buyerData)
      const rfpData = {
        buyerId: buyer._id,
        buyerDetails: {
          name,
          email,
          mobile: mobile.mobile,
          location
        },
        productDetails
      }
      const rfp = await postRFP(rfpData)
    }
    respSuccess(res, "Your requirement has successfully submitted")

  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const buyer = await checkBuyerExistOrNot(mobile);
    if (buyer) {
      respError(res, "A buyer with this number already exist");
    }
    const otp = 1234;
    respSuccess(res, { otp });
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.verifyBuyerMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const { buyerID } = req;
    const buyer = await updateBuyer(buyerID, { isPhoneVerified: true });
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.addBuyer = async (req, res) => {
  try {
    const { ipAddress } = req.body;
    req.body.isPhoneVerified = true;
    const buyer = await addBuyer(req.body);
    if (buyer) {
      const deviceId = machineIdSync();
      // const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { buyerId: buyer._id });
      // const finalData = {
      //   userAgent,
      //   buyerId: buyer._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(data._id, finalData)
      return respSuccess(res, { token, buyer }, "Auth Success");
    }
    return respError(res, "Buyer not added");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getBuyer = async (req, res) => {
  try {
    const { buyerID } = req;
    const buyer = await getBuyer(buyerID);
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateBuyer = async (req, res) => {
  try {
    const { buyerID } = req;
    const buyer = await updateBuyer(buyerID, re.body);
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await getAllBuyers();
    respSuccess(res, buyers);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateBuyerPassword = async (req, res) => {
  try {
    const { mobile } = req.body;
    const seller = await updateSellerPassword(mobile, req.body);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};
