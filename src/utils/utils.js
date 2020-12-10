const moment = require("moment");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const fs = require("fs")
const AWS = require('aws-sdk')
const {
  bcryptSalt
} = require('./globalConstants');
const {
  JWTTOKEN,
  awsKeys
} = require("./globalConstants");

const {
  endpoint,
  accessKeyId,
  secretAccessKey,
  region,
  Bucket
} = awsKeys

exports.getReqIP = (req) => {
  console.log(req.headers.reqip);
  return req.headers.reqip || req.connection.remoteAddress;
};

exports.getReqUrl = (req) => {
  return req.protocol + "://" + req.get("host");
};

exports.createToken = (deviceId = "", id) =>
  jwt.sign({
      deviceId,
      ...id,
    },
    JWTTOKEN
    /* ,
     {
       expiresIn: '1h'
     } */
  );

exports.encodePassword = (password) => {
  return bcrypt.hashSync(password, bcryptSalt.SALT);
}


/**
 * upload to Digital Ocean Space
 */
exports.uploadToDOSpace = async (req) => {
  try {
    const spacesEndpoint = new AWS.Endpoint(endpoint);
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId,
      secretAccessKey
    });

    var params = {
      Body: req.data,
      Bucket,
      Key: req.Key
    };

    await s3.upload(params, function (err, data) {
      if (err) {
        console.log(err, err.stack)
        return (err)
      } else {
        console.log("🚀 ~ file: utils.js ~ line 64 ~ data", data)
        return data;
      }
    })
  } catch (error) {
    console.error(error);
    return error
  }


}
