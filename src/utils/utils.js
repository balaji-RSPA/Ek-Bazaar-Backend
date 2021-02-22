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

const axios = require("axios")
const { capitalizeFirstLetter } = require('./helpers')

const {
  endpoint,
  accessKeyId,
  secretAccessKey,
  region,
  Bucket
} = awsKeys

const { sms, siteUrl } = require('./globalConstants')
const { username, password, senderID, smsURL } = sms


exports.sendBulkSMS = async (mobile, message) => new Promise((resolve, reject) => {
  console.log('bulk sms', mobile, message)
  const sendsmsuri = `${smsURL}?username=${username}&password=${password}&to=${mobile}&from=${senderID}&text=${message.replace("&", "and")}&category=bulk`
  // const sendsmsuri = smsURL + "?username=" + username + "&password=" + password + "&to=" + mobile + "&from=" + senderID + "&text=" + message.replace("&", "and") + "&category=bulk"
  // const result = await axios.get(sendsmsuri)
  // return result
  axios.get(sendsmsuri)
    .then(response => {
      resolve(response)
    })
    .catch(error => {
      resolve({ error: error.message })
    })
})

exports.sendSMS = async (mobile, message) => new Promise((resolve, reject) => {
  // const url = "https://api.ekbazaar.com/api/v1/sendOTP"
  // const resp = await axios.post(url, {
  //   mobile,
  //   message
  // })
  // return resp
  const sendsmsuri = `${smsURL}?username=${username}&password=${password}&to=${mobile}&from=${senderID}&text=${message.replace("&", "and")}&dlr-mask=19&dlr-url`
  // const result = await axios.get(sendsmsuri)
  // return result
  axios.get(sendsmsuri)
    .then(response => {
      resolve(response)
    })
    .catch(error => {
      resolve({ error: error.message })
    })
})

exports.messageContent = (productDetails, _loc, name) => {
  const message = `You have an enquiry from EkBazaar.com for ${capitalizeFirstLetter(productDetails.name.name)},${productDetails.quantity} ${capitalizeFirstLetter(productDetails.weight)} from ${_loc}.\nDetails below: ${capitalizeFirstLetter(name)} -\nTo view buyer contact details please register or login to ${siteUrl}/signup\nEkbazaar-Trade ${siteUrl}`;
  return message
}

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
module.exports.uploadToDOSpace = (req) => {
  // try {
  const spacesEndpoint = new AWS.Endpoint(endpoint);
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId,
    secretAccessKey
  });
  var params = {
    Body: req.body,
    Bucket,
    Key: req.Key,
    ACL: 'public-read'
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) reject(err)
      else {
        resolve(data)
      }
    })
  })

  // s3.upload(params, function (err, data) {
  //   if (err) {
  //     return (err)
  //   } else {
  //     return data;
  //   }
  // })
  // } catch (error) {
  //   return error
  // }


}
