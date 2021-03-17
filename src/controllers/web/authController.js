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
const { userChatLogin, createChatUser, updateChatStatus } = require('./rocketChatController')
const { ssoRedirect } = require("../../../sso-tools/checkSSORedirect");
const { verifyJwtToken } = require("../../../sso-tools/jwt_verify");
const { request } = require('../../utils/request')
const { ssoLoginUrl, ssoLogoutUrl, authServiceURL } = require('../../utils/utils').globalVaraibles
const { serviceURL } = authServiceURL()

// const {
//   handleUserSession, getSessionCount, handleUserLogoutSession
// } = require('../../modules/sessionModules')

const { sellers, buyers, Chat } = require("../../modules");

const { JWTTOKEN } = require("../../utils/globalConstants");
const { getChat, createChatSession, createChat } = Chat

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
    const response = await request({ url: ssoLoginUrl, method: "POST", data: { mobile, password, ipAddress, serviceURL, userType }, params: { serviceURL } })
    // const response = await axios.post(ssoLoginUrl, { mobile, password, ipAddress, serviceURL, userType }, { params: { serviceURL } })
    const { data } = response
    let _user = data.user
    console.log("🚀 ~ file: authController.js ~ line 47 ~ exports.login= ~ _user", _user)

    if (data.url) {
      const ssoToken = data.url.substring(data.url.indexOf("=") + 1)
      req.session.ssoToken = ssoToken
      req.query = {
        ssoToken: ssoToken
      }
    }

    const _response = await ssoRedirect(req, res, next)
    console.log("🚀 ~ file: authController.js ~ line 63 ~ exports.login= ~ _response", _response)
    const { user, token } = _response
    if (token) req.session.token = token
    if (!_user) {

      return respAuthFailed(res, undefined, "User not found");

    } else if (_user && !_user.password && userType === 'buyer') {

      const _user = await sellers.updateUser({ mobile }, { password: encodePassword(password) })
      _user = await sellers.checkUserExistOrNot({ mobile });
      _user = _user[0]

    } else if (_user && !_user.password && userType === 'seller') {

      return respAuthFailed(res, undefined, "User not found");

    }

    const buyer = await buyers.getBuyer(_user._id);
    const seller = await sellers.getSeller(_user._id);
    if (userType === 'seller') {

      if (seller && seller.deactivateAccount && (seller.deactivateAccount.status === true))
        return respAuthFailed(res, undefined, "Account Deactivated, contact Support team");

      else if (seller && (!seller.mobile || (seller.mobile && !seller.mobile.length))) {
        const data = {
          mobile: [{ mobile: _user.mobile, countryCode: _user.countryCode }]
        }
        await sellers.updateSeller({ userId: _user._id }, data)
      }

    } else if (userType === 'buyer') {

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
      const chatLogin = await getChat({ userId: _user._id })
      console.log("🚀 ~ file: authController.js ~ line 85 ~ exports.login= ~ chatLogin", chatLogin)
      // const sellerDetails = await sellers.getSeller(_user._id);
      let activeChat = {}
      if (chatLogin) {
        activeChat = await userChatLogin({ username: chatLogin.details.user.username, password: "active123", customerUserId: _user._id })
        // activeChat = await userChatLogin({ username: "sreeraj@active.agency", password: "IamSree@2302", customerUserId: _user._id })
        // await createChatSession({ userId: user._id }, { session: { userId: activeChat.userId, token: activeChat.authToken } })
        console.log(activeChat, '------ Old Chat activated-----------')
      } else {
        console.log(' chat crfeate initiated-------------')
        const chatUser = await createChatUser({ name: user.name, email: user.email, username: user.mobile.toString() })
        const chatDetails = await createChat({ details: chatUser, sellerId: seller._id, buyerId: buyer._id, userId: _user._id })
        activeChat = await userChatLogin({ username: chatUser.user.username, password: "active123", customerUserId: _user._id })
        console.log(activeChat, '------ New Chat activated-----------')
      }

      return respSuccess(res, { user, token, activeChat }, "successfully logged in!");
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
      const chatLogout = await updateChatStatus(req)
      const result = sellers.handleUserLogoutSession(data);
      const response = //await axios.post(ssoLogoutUrl, { params: { serviceURL } })
        await request({ url: ssoLogoutUrl, method: "POST", params: { serviceURL } })
      console.log("🚀 ~ file: authController.js ~ line 139 ~ exports.logout= ~ response", response)
      if (response.data && response.data.success) {

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
