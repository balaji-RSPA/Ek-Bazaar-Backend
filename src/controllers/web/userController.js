const camelcaseKeys = require("camelcase-keys");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { createToken, encodePassword } = require("../../utils/utils");
const { sellers, buyers } = require("../../modules");
const {
  handleUserSession,
  getAccessToken,
  getSessionLog,
  checkUserExistOrNot,
  addUser,
  updateUser,
  getUserProfile,
  getSeller,
  updateSeller,
  forgetPassword,
  addSeller,
  addbusinessDetails
} = sellers;
const { getBuyer, addBuyer, updateBuyer } = buyers;

module.exports.getAccessToken = async (req, res) => {
  try {
    const { ipAddress } = req.query;
    const deviceId = machineIdSync();
    const session = await getAccessToken(ipAddress);
    const sessionLog = await getSessionLog(ipAddress);
    if (session.length && sessionLog.length === 0) {
      respSuccess(res, { token: session[0].token });
    } else if (session.length && sessionLog.length) {

      const condition =
        new Date(session[0].requestedAt) > new Date(sessionLog[0].signOut);
      if (condition) {
        return respSuccess(res, { token: session[0].token });
      } else {
        return respSuccess(res, { token: null });
      }
    }
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.checkUserExistOrNot = async (req, res) => {
  try {
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
    const { mobile, reset } = req.body;
    console.log(req.body);
    const seller = await checkUserExistOrNot(mobile);
    console.log(seller, "seller.....");
    if (seller && seller.length && !reset) {
      return respError(res, "A seller with this number already exist");
    }
    console.log(seller, ".......///////")
    if (reset && (!seller || !seller.length)) return respError(res, "No User found with this number");
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

const getUserAgent = (userAgent) => {

  const {
    browser, version, os, platform, source
  } = userAgent
  return {
    browser,
    version,
    os,
    platform,
    source
  }

}

module.exports.addUser = async (req, res) => {
  try {
    const { password, mobile, ipAddress } = req.body;
    req.body.password = encodePassword(password);
    const tenderUser = {
      countryCode: mobile.countryCode,
      mobile: mobile.mobile,
      isPhoneVerified: 2,
      password: req.body.password,
    };
    const user = await addUser(tenderUser);

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
    if (seller && buyer) {
      const deviceId = machineIdSync();
      const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { userId: seller.userId });
      const finalData = {
        userAgent,
        userId: seller.userId,
        token,
        deviceId,
        ipAddress
      }

      const result1 = await handleUserSession(seller.userId, finalData)
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
    const user = await getUserProfile(userID)
    const seller = await getSeller(userID);
    const buyer = await getBuyer(userID);
    const userData = {
      user,
      seller,
      buyer
    };
    respSuccess(res, userData);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateUser = async (req, res) => {
  console.log("updating user======================================dgkd;jgi")
  try {
    const { userID } = req;
    const _buyer = req.body.buyer || {}
    console.log(_buyer, "_buyer//.....")
    console.log(req.body, "req.body..........................")
    let { name, email, business, location, type, sellerType } = req.body;
    console.log(name, email, business, location, type, sellerType, "8888888888888")
    const userData = {
      name,
      city: _buyer && _buyer.location && _buyer.location.city || location.city || null,
      email: _buyer && _buyer.email || email || null,
    };
    console.log(userData, "0000000000000000000000000000000000000000000000000")
    const buyerData = {
      name,
      email,
      location,
      userId: userID,
      ..._buyer
    };
    console.log(buyerData, "buyerData.......................")
    let _seller = await getSeller(userID)

    let serviceType = _seller && _seller.sellerType || []
    // if(!buyer)
    //let serviceType
    serviceType = [{
      name: sellerType,
      cities: [{
        city: location.city,
        state: location.state
      }]
    }]
    console.log(serviceType, 'serviceType.............................')
    const sellerData = {
      name,
      email: email || null,
      location,
      sellerType: serviceType,
      userId: userID,
      ..._buyer
    };
    console.log(sellerData, 'sellerData............................')
    const user = await updateUser({ _id: userID }, userData);
    console.log(user, "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
    let seller = await updateSeller({ userId: userID }, sellerData);
    console.log(seller, "ssssssssssssssssssssssssssssssss")
    buyer = await updateBuyer({ userId: userID }, buyerData);

    if (business) {
      const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
      console.log(bsnsDtls, "..../////////////")
      const _seller = await updateSeller({ userId: userID }, {
        busenessId: bsnsDtls._id,
      });
    }
    seller = await getSeller(userID)
    if (user && buyer && seller) {
      respSuccess(res, { seller, buyer }, "registration completed");
    } else {
      respError(res, "registration failed");
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

// let dt = new Date()
//     let date = `${dt.getUTCDate()}`
//     let month = `${dt.getUTCMonth()+1}`
//     let year = `${dt.getUTCFullYear()}`
//     let hours = `${dt.getUTCHours()}`
//     let minutes = `${dt.getUTCMinutes()}`
//     let seconds = `${dt.getUTCSeconds()}`
//     let milisecs = `${dt.getUTCMilliseconds()}`

//     const currentTime = `${year}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date} ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${seconds.length === 1 ? `0${seconds}` : seconds}.${milisecs}Z`

//     const timestamp = dt.getTime()
//     const newTimestamp = timestamp - 12000000
//     dt = new Date(newTimestamp)
//     date = `${dt.getUTCDate()}`
//     month = `${dt.getUTCMonth()+1}`
//     year = `${dt.getUTCFullYear()}`
//     hours = `${dt.getUTCHours()}`
//     minutes = `${dt.getUTCMinutes()}`
//     seconds = `${dt.getUTCSeconds()}`
//     milisecs = `${dt.getUTCMilliseconds()}`

//     const startTime = `${year}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date} ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${seconds.length === 1 ? `0${seconds}` : seconds}.${milisecs}Z`


