const moment = require("moment");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const fs = require("fs")
const AWS = require('aws-sdk')
const {
  bcryptSalt,
  MailgunKeys
} = require('./globalConstants');
const mailgun = require('mailgun-js')({
  apiKey: MailgunKeys.mailgunAPIKey,
  domain: MailgunKeys.mailgunDomain
});
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
/**
 * send mail
 */
module.exports.sendMail = (data)=> {
  try{
    mailgun.messages().send(data, (error, body) => {
    if(error){
      throw error;
    }
      console.log(body);
    })
  }catch(err){
    console.log(err, "=============Mail not send======================")
  }
} 
