const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { machineIdSync } = require("node-machine-id");
const {
  respSuccess,
  respError,
  respAuthFailed,
} = require("../../utils/respHadler");
const { createToken, encodePassword } = require("../../utils/utils");
const { userChatLogin, userChatLogout, createChatUser, userChatSessionLogout } = require('./rocketChatController')
// const {
//   handleUserSession, getSessionCount, handleUserLogoutSession
// } = require('../../modules/sessionModules')

const { sellers, buyers, Chat } = require("../../modules");

const { JWTTOKEN } = require("../../utils/globalConstants");
const { getChat, createChatSession } = Chat

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
    if (!user) {
      return respAuthFailed(res, undefined, "User not found");
    }
    else if (user && !user.password && userType === 'buyer') {
      const _user = await sellers.updateUser({ mobile }, { password: encodePassword(password) })
      // console.log("🚀 ~ file: authController.js ~ line 40 ~ exports.login= ~ _user", _user)
      user = await sellers.checkUserExistOrNot({ mobile });
      user = user[0]
      // console.log("🚀 ~ file: authController.js ~ line 42 ~ exports.login= ~ user", user)
    } else if (user && !user.password && userType === 'seller') {
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
      const chatLogin = await getChat({ userId: user._id })
      let activeChat = {}
      if (chatLogin) {
        activeChat = await userChatLogin({ username: chatLogin.details.user.username, password: "active123", customerUserId: user._id })
        // await createChatSession({ userId: user._id }, { session: { userId: activeChat.userId, token: activeChat.authToken } })
        console.log(activeChat, '------ Old Chat activated-----------')
      } else {
        const chatUser = await createChatUser({ name: user.name, email: user.email, username: user.mobile.toString() })
        activeChat = await userChatLogin({ username: chatLogin.details.user.username, password: "active123", customerUserId: user._id })
        console.log(activeChat, '------ New Chat activated-----------')
      }

      return respSuccess(res, { token, location, activeChat }, "successfully logged in!");
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
      // const chatLogout = await userChatLogout()
      const chatLogout = await userChatSessionLogout(req)
      const result = sellers.handleUserLogoutSession(data);

    }
    return respSuccess(res, 'successfully logged out!');

  } catch (error) {

    return respError(res, error.message)

  }

}
