const async = require("async")
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

    const { password, ipAddress, mobile, userType, email, countryCode } = req.body;

    let _user = req.body.user
    console.log("🚀 ~ file: authController.js ~ line 46 ~ exports.login= ~ _user", _user)
    const data = {
      url: req.body.url
    }

    if (data.url) {
      const ssoToken = data.url.substring(data.url.indexOf("=") + 1)
      req.query = {
        ssoToken: ssoToken
      }
    }
    const _response = await ssoRedirect(req, res, next)
    console.log("🚀 ~ file: authController.js ~ line 58 ~ exports.login= ~ _response", _response)

    const { user, token } = _response
    let query = {}
    if (email) query = { email }
    else query = { mobile, countryCode }
    if (!_user) {

      return respAuthFailed(res, undefined, "User not found");

    } else if (_user && !_user.password && userType === 'buyer') {

      _user = await sellers.updateUser({ mobile }, { password: encodePassword(password) })
      // _user = await sellers.checkUserExistOrNot({ mobile });
      _user = _user

    } else if (_user && !_user.password && userType === 'seller') {

      return respAuthFailed(res, undefined, "User not found");

    }

    let buyer = await buyers.getBuyer(_user._id);
    console.log("🚀 ~ file: authController.js ~ line 77 ~ exports.login= ~ buyer", buyer)
    // if (!buyer) {
    //   const sellerData = {
    //     name: _user.name,
    //     email: _user.email,
    //     mobile: [{
    //       countryCode: _user.countryCode,
    //       mobile: mobile
    //     }],
    //     userId: _user._id
    //   }
    //   const buyerData = {
    //     name: _user.name,
    //     email: _user.email,
    //     countryCode: _user.countryCode,
    //     mobile: mobile,
    //     userId: _user._id
    //   }
    //   await sellers.updateSeller({ userId: user._id }, sellerData)
    //   buyer = await buyers.updateBuyer({ userId: user._id }, buyerData)
    // }
    let seller = await sellers.getSeller(_user._id);
    console.log("🚀 ~ file: authController.js ~ line 102 ~ exports.login= ~ seller -------------", seller, userType, buyer)


    if (userType === 'buyer' && !buyer) {

      const buyerData = {
        name: _user.name,
        email: _user.email,
        countryCode: _user.countryCode,
        mobile: mobile,
        userId: _user._id
      }
      buyer = await buyers.updateBuyer({ userId: user._id }, buyerData)

    }

    if (userType === 'seller' && !seller) {
      if (!seller) {
        const sellerData = {
          name: _user.name,
          email: _user.email,
          mobile: [{
            countryCode: _user.countryCode,
            mobile: mobile
          }],
          userId: _user._id
        }
        seller = await sellers.updateSeller({ userId: user._id }, sellerData)
      }
    }

    if (seller && (!seller.mobile || (seller.mobile && !seller.mobile.length))) {
      const data = {
        mobile: [{ mobile: _user.mobile, countryCode: _user.countryCode }]
      }
      seller = await sellers.updateSeller({ userId: _user._id }, data)
    }
    if (buyer && !buyer.mobile) {
      buyer = await buyers.updateBuyer({ userId: user._id }, { mobile: _user.mobile, countryCode: _user.countryCode })
    }


    const result = await bcrypt.compare(password, _user.password);
    if (result) {
      // const sessionCount = await sellers.getSessionCount(_user._id);
      sellers.getSessionCount(_user._id);

      const userAgent = getUserAgent(req.useragent);

      const finalData = {
        userAgent,
        userId: _user._id,
        token,
        deviceId: user.deviceId,
        ipAddress
      }
      // const result1 = await sellers.handleUserSession(_user._id, finalData);
      sellers.handleUserSession(_user._id, finalData);
      const productCount = seller && seller.sellerProductId && seller.sellerProductId.length ? true : false
      console.log("🚀 ~ file: authController.js ~ line 119 ~ exports.login= ~ ProductCount------------", productCount, seller, _user)
      // const chatLogin = await getChat({ userId: _user._id })
      let activeChat = {
        username: mobile,
        userId: _user._id,
        sellerId: seller && seller._id,
        buyerId: buyer && buyer._id,
        email: seller && seller.email || buyer && buyer.email || null,
        name: seller && seller.name || buyer && buyer.name || null
      }
      // if (chatLogin) {
      //   if (chatLogin.details) {
      //     activeChat = await userChatLogin({ username: chatLogin.details && chatLogin.details.user.username, password: "active123", customerUserId: _user._id })
      //   }
      //   else {
      //     const chatUser = await createChatUser({ name: _user.name, email: _user.email, username: _user.mobile && _user.mobile.toString() })
      //     if (chatUser) {
      //       const chatDetails = await createChat({ userId: _user._id }, { details: chatUser, sellerId: seller._id, buyerId: buyer._id, userId: _user._id })
      //       activeChat = await userChatLogin({ username: chatUser.user && chatUser.user.username || "", password: "active123", customerUserId: _user._id })
      //     }
      //     else {
      //       console.error("catch-block");
      //       activeChat = await userChatLogin({ username: _user.mobile && _user.mobile.toString(), password: "active123", customerUserId: _user._id })
      //     }
      //   }
      //   console.log(activeChat, '------ Old Chat activated-----------')
      // } else {
      //   console.log(' chat crfeate initiated-------------')
      //   const chatUser = await createChatUser({ name: _user.name, email: _user.email, username: _user.mobile && _user.mobile.toString() })
      //   console.log("🚀 ~ file: authController.js ~ line 129 ~ exports.login= ~ chatUser", chatUser)
      //   const chatDetails = await createChat({ userId: _user._id }, { details: chatUser, sellerId: seller._id, buyerId: buyer._id, userId: _user._id })
      //   activeChat = await userChatLogin({ username: chatUser.user && chatUser.user.username || "", password: "active123", customerUserId: _user._id })
      //   console.log(activeChat, '------ New Chat activated-----------')
      // }
      console.log('1111111111111111111 --------------')
      return respSuccess(res, { user, token, activeChat, productCount }, "successfully logged in!");
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

        return respSuccess(res, 'successfully logged out!');

      }
    }

  } catch (error) {

    return respError(res, error.message)

  }

}
