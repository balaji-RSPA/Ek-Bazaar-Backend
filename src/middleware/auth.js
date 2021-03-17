const jwt = require('jsonwebtoken');
const moment = require('moment')
const mongoose = require('mongoose');
const { JWTTOKEN } = require('../utils/globalConstants');
const { respUnAuthorized } = require('../utils/respHadler');
const Session = require("../../config/tenderdb").sessionModel;
const SessionLog = require("../../config/tenderdb").sessionLogModel;
const { verifyJwtToken } = require("../../sso-tools/jwt_verify");
const { Chat } = require('../modules')
const { setChatSession } = require('../controllers/web/rocketChatController')
const { getChat } = Chat

const { Types } = mongoose;
const { ObjectId } = Types;

const extendSession = (id) => Session.findByIdAndUpdate(id, {
  $set: {
    requestedAt: new Date()
  }
}, {
  new: true
})


const getChatRequest = (userId) => new Promise(async (resolve, reject) => {

  try {
    const chatData = await getChat({ userId })
    // if (chatData) {
    //   await setChatSession(chatData.session)
    // }
    resolve(chatData)

  } catch (error) {
    reject(error)
  }

})

const removeSession = (token) => new Promise((resolve, reject) => {

  Session.findOne({ token }, async (err, result) => {

    if (err) {

      reject(err)

    }
    if (result) {

      const data = {
        userId: result.userId,
        userAgent: result.userAgent,
        token: result.token,
        deviceId: result.deviceId,
        signIn: result.createdAt,
        ipAddress: result.ipAddress
      }
      const swap = new (SessionLog)(data)
      swap.save((saveErr) => {

        if (!saveErr) {

          result.remove()
          resolve(swap)

        } else {

          reject(saveErr)

        }

      })

    }
    resolve(null)

  })

})

const checkRequestTime = (userId, deviceId, token) => new Promise((resolve, reject) => {
  // Session.findOne({ userId, deviceId, token }).then((doc) => {
  Session.aggregate([{
    $match: {
      $and: [{
        userId: ObjectId(userId)

      }, {
        deviceId

      }/*, {
        token

      }*/]
    }
  }, {
    $addFields: {
      expired: {
        $cond: {
          if: {
            $gte: [{ $subtract: [new Date(), '$requestedAt'] }, 3600000]
          },
          then: true,
          else: false
        }
      }
    }
  }]).then((doc) => {

    const data = doc[0]
    const { _id, expired } = data
    if (!expired) {

      extendSession(_id).then(resolve).catch(console.log)

    } else {

      resolve(true)

    }

  }).catch(reject);

})

exports.authenticate = async (req, res, next) => {
  console.log("🚀 ~ file: auth.js ~ line 108 ~ exports.authenticate= ~ req", req.headers.authorization)
  const token = req.headers.authorization.split('|')[1];
  try {
    console.log(req.session.ssoToken)
    const decoded = await verifyJwtToken(token) //jwt.verify(token, JWTTOKEN);
    console.log("🚀 ~ file: auth.js ~ line 114 ~ exports.authenticate= ~ decoded", decoded)
    const { deviceId, userId } = decoded;
    req.deviceId = deviceId
    req.userID = userId;
    req.token = token
    const check = await checkRequestTime(userId, deviceId, token);
    console.log("🚀 ~ file: auth.js ~ line 139 ~ exports.authenticate= ~ check", check)
    if (check) {

      const chat = await getChatRequest(userId)
      if (chat) {

        req.chatAthToken = chat.session && chat.session.authToken || ''
        req.chatUserId = chat.session && chat.session.userId || ''
        req.chatUsername = chat.session && chat.session.username || ''
      }

      return next();

    }
    return respUnAuthorized(res);

  } catch (error) {

    const remToken = await removeSession(token)
    return respUnAuthorized(res);

  }
}

exports.publicAuthenticate = async (req, res, next) => {

  try {

    const token = req.headers.authorization.split('|')[1];
    const decoded = jwt.verify(token, JWTTOKEN);
    const { deviceId, userId } = decoded;
    req.deviceId = decoded.deviceId
    req.userID = decoded.userId;
    req.token = token
    const check = await checkRequestTime(userId, deviceId, token);

    if (check) {

      return next();

    }
    return respUnAuthorized(res);

  } catch (error) {

    return next();

  }

};

