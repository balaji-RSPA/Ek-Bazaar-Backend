const jwt = require('jsonwebtoken');
const moment = require('moment')
const mongoose = require('mongoose');
const { JWTTOKEN } = require('../utils/globalConstants');
const { respUnAuthorized } = require('../utils/respHadler');

const { Types } = mongoose;
const { ObjectId } = Types;

exports.authenticate = async(req, res, next) => {
  const token = req.headers.authorization.split('|')[1];
  try {

    const decoded = jwt.verify(token, JWTTOKEN);
    const { deviceId, userId } = decoded;
    req.deviceId = deviceId
    req.userID = userId;
    req.token = token
  //   const check = await checkRequestTime(userId, deviceId, token);
  //   if (check) {

      return next();

  //   }
  //   return respUnAuthorized(res);

  } catch (error) {

  //   const remToken = await removeSession(token)
    return respUnAuthorized(res);

  }
}
