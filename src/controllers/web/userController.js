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
    console.log(req.ip, "ip...", req.query, "query");
    const { ipAddress } = req.query;
    const deviceId = machineIdSync();
    console.log(deviceId, "deviceId......");
    const session = await getAccessToken(ipAddress);
    const sessionLog = await getSessionLog(ipAddress);
    console.log(session, "session", sessionLog, "session Log");
    if (session.length && sessionLog.length === 0) {
      respSuccess(res, { token: session[0].token });
    } else if (session.length && sessionLog.length) {

      const condition =
        new Date(session[0].requestedAt) > new Date(sessionLog[0].signOut);
      console.log("condition.....", condition);
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
  try {
    const { userID } = req;
    const { name, email, business, location, type, sellerType } = req.body;
    console.log(req.body, "8888888888888")
    const userData = {
      name,
      city: location.city,
      email: email || null,
    };
    const buyerData = {
      name,
      email,
      location,
      userId: userID
    };
    let serviceType = [{
      name: sellerType,
      cities: [{
        city: location.city,
        state: location.state
      }]
    }]
    console.log(serviceType, '')
    const sellerData = {
      name,
      email: email || null,
      location,
      sellerType: serviceType,
      userId: userID
    };
    const user = await updateUser({ _id: userID }, userData);
    let seller = await updateSeller({ userId: userID }, sellerData);
    const buyer = await updateBuyer({ userId: userID }, buyerData);

    console.log(user, "user.....");
    console.log(buyer, "buyer.....");
    console.log(seller, "seller.....");
    if (business) {
      const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
      const _seller = await updateSeller({ userId: userID }, {
        busenessId: bsnsDtls._id,
      });
    }
    seller = await getSeller(userID)
    if (user && buyer && seller) {
      respSuccess(res, { seller, buyer }, "registreation completed");
    } else {
      respError(res, "registeration failed");
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
//     console.log(timestamp, newTimestamp)
//     dt = new Date(newTimestamp)
//     date = `${dt.getUTCDate()}`
//     month = `${dt.getUTCMonth()+1}`
//     year = `${dt.getUTCFullYear()}`
//     hours = `${dt.getUTCHours()}`
//     minutes = `${dt.getUTCMinutes()}`
//     seconds = `${dt.getUTCSeconds()}`
//     milisecs = `${dt.getUTCMilliseconds()}`

//     const startTime = `${year}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date} ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${seconds.length === 1 ? `0${seconds}` : seconds}.${milisecs}Z`

//     console.log(new Date(1604851339126).toUTCString(), new Date().getTime())

//     console.log(currentTime, 'currentTime........', startTime, 'startTime.....')
