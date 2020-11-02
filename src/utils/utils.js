const moment = require("moment");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { bcryptSalt } = require('./globalConstants');
const { JWTTOKEN } = require("./globalConstants");

exports.getReqIP = (req) => {
  console.log(req.headers.reqip);
  return req.headers.reqip || req.connection.remoteAddress;
};

exports.getReqUrl = (req) => {
  return req.protocol + "://" + req.get("host");
};

exports.createToken = (deviceId = "", id) =>
  jwt.sign(
    {
      deviceId,
      ...id,
    },
    JWTTOKEN /* ,
  {
    expiresIn: '1h'
  } */
  );

  exports.encodePassword = (password) => {
    return bcrypt.hashSync(password, bcryptSalt.SALT);
  }
