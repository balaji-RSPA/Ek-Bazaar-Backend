const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { machineIdSync } = require("node-machine-id");
const axios = require("axios")
const {
  respSuccess,
  respError,
  respAuthFailed,
} = require("../../utils/respHadler");
const { createToken, encodePassword } = require("../../utils/utils");
const { ssoRedirect } = require("../../../sso-tools/checkSSORedirect");
const { verifyJwtToken } = require("../../../sso-tools/jwt_verify");

const ssoLoginUrl = global.environment === "production" ? "" : global.environment === "staging" ? "" : "http://localhost:3010/simplesso/login"
const ssoLogoutUrl = global.environment === "production" ? "" : global.environment === "staging" ? "" : "http://localhost:3010/simplesso/logout"
const serviceURL = global.environment === "production" ? "" : global.environment === "staging" ? "" : "http://localhost:8070"

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

exports.login = async (req, res, next) => {
  try {

    const { password, ipAddress, mobile, userType } = req.body;
    // const serviceURL = "http://localhost:8070" // req.headers.origin
    const response = await axios.post(ssoLoginUrl, { mobile, password, ipAddress, serviceURL, userType }, { params: { serviceURL } })
    const { data } = response
    let _user = data.user

    if (data.url) {
      const ssoToken = data.url.substring(data.url.indexOf("=") + 1)
      req.session.ssoToken = ssoToken
      req.query = {
        ssoToken: ssoToken
      }
    }

    const _response = await ssoRedirect(req, res, next)
    const { user, token } = _response
    if(token) req.session.token = token
    if (!_user) {

      return respAuthFailed(res, undefined, "User not found");

    } else if (_user && !_user.password && userType === 'buyer') {

      const _user = await sellers.updateUser({ mobile }, { password: encodePassword(password) })
      _user = await sellers.checkUserExistOrNot({ mobile });
      _user = _user[0]

    } else if (_user && !_user.password && userType === 'seller') {

      return respAuthFailed(res, undefined, "User not found");
      
    }

    if (userType === 'seller') {

      const seller = await sellers.getSeller(user._id);

      if (seller && seller.deactivateAccount && (seller.deactivateAccount.status === true))
        return respAuthFailed(res, undefined, "Account Deactivated, contact Support team");

      else if (seller && (!seller.mobile || (seller.mobile && !seller.mobile.length))) {
        const data = {
          mobile: [{ mobile: user.mobile, countryCode: user.countryCode }]
        }
        await sellers.updateSeller({ userId: user._id }, data)
      }

    } else if (userType === 'buyer') {

      const buyer = await buyers.getBuyer(user._id);
      if (buyer && buyer.deactivateAccount.status === true)
        return respAuthFailed(res, undefined, "Account Deactivated, contact Support team");

    }

    const result = await bcrypt.compare(password, _user.password);
    if (result) {
      const sessionCount = await sellers.getSessionCount(_user._id);

      const userAgent = getUserAgent(req.useragent);
      
      const finalData = {
        userAgent,
        userId: _user._id,
        token,
        deviceId: user.deviceId,
        ipAddress
      }
      const result1 = await sellers.handleUserSession(_user._id, finalData);
      return respSuccess(res, { user, token }, "successfully logged in!")
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

      // const decoded = jwt.verify(token, JWTTOKEN);
      const decoded = await verifyJwtToken(token);
      const { deviceId, userId } = decoded;
      const data = {
        userId,
        deviceId/*,
        token*/
      }

      const result = sellers.handleUserLogoutSession(data);
      const response = await axios.post(ssoLogoutUrl, { params: { serviceURL } })
      console.log("🚀 ~ file: authController.js ~ line 139 ~ exports.logout= ~ response", response)
      if(response.data && response.data.success) {

        req.session = null //.distroy(function (err) {
          // if (err) return respError(res, error.message)
          // else return respSuccess(res, 'successfully logged out!');
        // })
        return respSuccess(res, 'successfully logged out!');
        
      }
    }

  } catch (error) {

    return respError(res, error.message)

  }

}
