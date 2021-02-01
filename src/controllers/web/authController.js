const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { machineIdSync } = require("node-machine-id");
const {
  respSuccess,
  respError,
  respAuthFailed,
} = require("../../utils/respHadler");
const { createToken } = require("../../utils/utils");
// const {
//   handleUserSession, getSessionCount, handleUserLogoutSession
// } = require('../../modules/sessionModules')

const { sellers, buyers } = require("../../modules");

const { JWTTOKEN } = require("../../utils/globalConstants");

const getUserAgent = (userAgent) => {
  const { browser, version, os, platform, source } = userAgent;
  return {
    browser,
    version,
    os,
    platform,
    source,
  };
};

exports.login = async (req, res) => {
  try {
    const { password, ipAddress, location, mobile, userType } = req.body;
    let user = await sellers.checkUserExistOrNot({ mobile });
    user = user[0]
    if (user && !user.password) {
      return respAuthFailed(res, user, "Password is not set or is not yet available");
    }
    if (!user) {
      return respAuthFailed(res, undefined, "User not found");
    }
    if (!user.password) {
      return respAuthFailed(res, user, "Password is not set or is not yet available");
    }
    if (userType === 'seller') {

      const seller = await sellers.getSeller(user._id);
      if (seller && seller.deactivateAccount && (seller.deactivateAccount.status === true)) 
        return respAuthFailed(res, undefined, "Account Deactivated, contact Support team");
      

    } else if (userType === 'buyer') {

      const buyer = await buyers.getBuyer(user._id);
      if (buyer && buyer.deactivateAccount.status === true)
        return respAuthFailed(res, undefined, "Account Deactivated, contact Support team");
    
      }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const sessionCount = await sellers.getSessionCount(user._id);

      const deviceId = machineIdSync();

      const userAgent = getUserAgent(req.useragent);
      const token = createToken(deviceId, { userId: user._id });
      const finalData = {
        userAgent,
        userId: user._id,
        token,
        deviceId,
        ipAddress
      }
      const result1 = await sellers.handleUserSession(user._id, finalData);
      return respSuccess(res, { token, location }, "successfully logged in!");
    }
    return respAuthFailed(res, undefined, "Invalid Credentials!");
  } catch (error) {
    return respError(res, error.message);
  }
}

exports.logout = async (req, res) => {

  try {

    const token = req.headers.authorization.split('|')[1];
    if (token !== 'undefined') {

      const decoded = jwt.verify(token, JWTTOKEN);
      const { deviceId, userId } = decoded;
      const data = {
        userId,
        deviceId,
        token
      }
      const result = sellers.handleUserLogoutSession(data);

    }
    return respSuccess(res, 'successfully logged out!');

  } catch (error) {

    return respError(res, error.message)

  }

}
