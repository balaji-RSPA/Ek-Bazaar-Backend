const camelcaseKeys = require("camelcase-keys");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { createToken, encodePassword } = require("../../utils/utils");
const { sellers, buyers } = require("../../modules");
const {
  checkUserExistOrNot,
  addUser,
  updateUser,
  getUserProfile,
  getSeller,
  updateSeller,
  forgetPassword,
  addSeller
} = sellers;
const { getBuyer, addBuyer, updateBuyer } = buyers;

module.exports.checkUserExistOrNot = async (req, res) => {
  try {
    console.log(req.body);
    const { mobile } = req.body;
    const seller = await checkUserExistOrNot(mobile);
    if (seller) {
      respSuccess(res);
    }
    respError(res, "No User found with this number");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    console.log(req.body);
    const seller = await checkUserExistOrNot(mobile);
    console.log(seller, "seller.....");
    if (seller && seller.length) {
      return respError(res, "A seller with this number already exist");
    }
    const otp = 1234;
    return respSuccess(res, { otp });
  } catch (error) {
    return respError(res, error.message);
  }
};

module.exports.verifySellerMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const { userID } = req;
    const seller = await updateUser(userID, { isPhoneVerified: true, mobile });
    respSuccess(res, seller, "Phone Verification Successfull");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.addUser = async (req, res) => {
  try {
    const { password, mobile } = req.body;
    req.body.password = encodePassword(password);
    console.log(req.body, "00000-------");
    const tenderUser = {
      countryCode: mobile.countryCode,
      mobile: mobile.mobile,
      isPhoneVerified: 2,
      password: req.body.password,
    };
    const user = await addUser(tenderUser);

    console.log(user, "user....");
    req.body.userId = user._id;
    const buyerData = {
      countryCode: mobile.countryCode,
      mobile: mobile.mobile,
      isPhoneVerified: true,
      userId: user._id,
    };
    const sellerData = {
      mobile,
      isPhoneVerified: true,
      userId: user._id,
    };
    const buyer = await addBuyer(buyerData);

    const seller = await addSeller(sellerData);
    // const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
    // const _seller = await updateSeller(seller._id, {
    //   busenessId: bsnsDtls._id,
    // });
    console.log(seller, "seller........", buyer);
    if (seller && buyer) {
      const deviceId = machineIdSync();
      // const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { userId: seller.userId });
      // const finalData = {
      //   userAgent,
      //   sellerId: seller._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(data._id, finalData)
      return respSuccess(
        res,
        { token, buyer, seller },
        "Account Created Successfully"
      );
    }
    return respError(res, "Account not Created");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const { userID } = req;
    // const user = await getUserProfile(userID)
    const seller = await getSeller(userID);
    const buyer = await getBuyer(userID);
    const userData = {
      // user,
      seller,
      buyer,
    };
    // const buyer = await getBuyer(userID)
    respSuccess(res, userData);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { userID } = req;
    const { name, email, business, location, type } = req.body;
    const userData = {
      name,
      city: location.city,
      email: email || null,
    };
    const buyerData = {
      name,
      email,
      location,
    };
    const sellerData = {
      name,
      email: email || null,
      location,
    };
    const user = await updateUser(userID, userData);
    const seller = await updateSeller(userID, sellerData);
    const buyer = await updateBuyer(userID, buyerData);
    console.log(user, "user.....");
    console.log(buyer, "buyer.....");
    console.log(seller, "seller.....");
    if (business) {
      const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
      const _seller = await updateSeller(userID, {
        busenessId: bsnsDtls._id,
      });
      console.log(user, ".....user");
      console.log(buyer, "....buyer");
      console.log(_seller, "....seller");
    }
    if (user && buyer && seller) {
        respSuccess(res, {seller, buyer}, "registreation completed");
    } else {
        respError(res, 'registeration failed');
    }
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.forgetPassword = async (req, res) => {
  try {
    let { mobile, password } = req.body;
    password = encodePassword(password);
    const user = await forgetPassword(mobile, { password });
    respSuccess(res, user, "Password Updated Successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateNewPassword = async (req, res) => {
  try {
    let { password } = req.body;
    password = encodePassword(password);
    const { userID } = req;
    const user = await updateUser(userID, { password });
    respSuccess(res, user, "Password Updated Successfully");
  } catch (error) {
    respError(res, error.message);
  }
};
