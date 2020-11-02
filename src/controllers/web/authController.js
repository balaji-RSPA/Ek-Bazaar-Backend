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

const { buyers, sellers } = require("../../modules");

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
exports.buyerLogin = async (req, res) => {
  try {
    const { password, ipAddress, location, mobile } = req.body;
    const buyer = await buyers.checkBuyerExistOrNot(mobile);
    if (!buyer) {
      return respAuthFailed(res, "Buyer not found");
    }
    const result = await bcrypt.compare(password, buyer.password);
    if (result) {
      // const sessionCount = await getSessionCount(user._id);

      const deviceId = machineIdSync();

      // const userAgent = getUserAgent(req.useragent);
      const token = createToken(deviceId, {buyerId: buyer._id});
      // const finalData = {
      //   userAgent,
      //   buyerId: buyer._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(user._id, finalData);
      return respSuccess(res, { token, location }, "successfully logged in!");
    }
    return respAuthFailed(res, "Invalid Credentials!");
  } catch (err) {
    return respError(res, err.message);
  }
};

exports.sellerLogin = async (req, res) => {
  try {
    const { password, ipAddress, location, mobile } = req.body;
    const seller = await sellers.checkSellerExistOrNot(mobile);
    if (!seller) {
      return respAuthFailed(res, "Seller not found");
    }
    const result = await bcrypt.compare(password, seller.password);
    if (result) {
      // const sessionCount = await getSessionCount(seller._id);

      const deviceId = machineIdSync();

      // const userAgent = getUserAgent(req.useragent);
      const token = createToken(deviceId, {sellerId: seller._id});
      // const finalData = {
      //   userAgent,
      //   sellerId: seller._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(user._id, finalData);
      return respSuccess(res, { token, location }, "successfully logged in!");
    }
    return respAuthFailed(res, "Invalid Credentials!");
  } catch (err) {
    return respError(res, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split("|")[1];
    if (token !== "undefined") {
      const decoded = jwt.verify(token, JWTTOKEN);
      const { deviceId, userId } = decoded;
      const data = {
        userId,
        deviceId,
        token,
      };
      //   const result = handleUserLogoutSession(data);
    }
    return respSuccess(res, "successfully logged out!");
  } catch (error) {
    return respError(res, error.message);
  }
};
