const moment = require("moment");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const AWS = require("aws-sdk");
const { bcryptSalt } = require("./globalConstants");
const { JWTTOKEN, awsKeys } = require("./globalConstants");

const axios = require("axios");
const { capitalizeFirstLetter } = require("./helpers");

const { endpoint, accessKeyId, secretAccessKey, region, Bucket } = awsKeys;

const { sms, siteUrl, exotelSms } = require("./globalConstants");
const { username, password, senderID, smsURL } = sms;
const spacesEndpoint = new AWS.Endpoint(endpoint);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId,
  secretAccessKey,
});

const accountSid = "AC3f0106962d1e3ffe0c401d57fa67ee9f";
const authToken = "b22ec354d52026926f01a0829552bf38";
const client = require("twilio")(accountSid, authToken);
const BearerToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTNhZDk3Yi1hODQ5LTQ4NmQtOTkyMS02OWUyZjI2MGZhNjUiLCJ1bmlxdWVfbmFtZSI6ImFiaGlqZWV0QGF1c21vLmNvIiwibmFtZWlkIjoiYWJoaWplZXRAYXVzbW8uY28iLCJlbWFpbCI6ImFiaGlqZWV0QGF1c21vLmNvIiwiYXV0aF90aW1lIjoiMDgvMDMvMjAyMSAwODo0NjozMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNjI4MTIxNjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.IGh1iQ5dm_mZl_dshkMb9SDfpnMVkU7HRr_HdrPsZqs`;

exports.globalVaraibles = {
  _IS_PROD_: process.env.NODE_ENV === "production",
  _IS_DEV_: process.env.NODE_ENV === "staging",
  ssoLoginUrl: "login",
  ssoLogoutUrl: "logout",
  ssoRegisterUrl: "register",
  ssoServerJWTURL: "verifytoken",
  authServiceURL: function () {
    if (this._IS_PROD_) {
      return {
        serviceURL: "https://tradeapi.ekbazaar.com",
        pricing: "https://trade.ekbazaar.com/pricing",
        signIn: "https://trade.ekbazaar.com/signin",
      };
    } else if (this._IS_DEV_) {
      return {
        serviceURL: "https://tradebazaarapi.tech-active.com",
        pricing: "https://tradebazaar.tech-active.com/pricing",
        signIn: "https://tradebazaar.tech-active.com/signin",
      };
    } else {
      return {
        serviceURL: "http://localhost:8070",
        pricing: "http://localhost:8085/pricing",
        signIn: "http://localhost:8085/signin",
      };
    }
  },
};

exports.sendBulkSMS = async (mobile, message, templateId) =>
  new Promise((resolve, reject) => {
    console.log("bulk sms", mobile, message);
    const sendsmsuri = `${smsURL}?username=${username}&password=${password}&to=${mobile}&from=${senderID}&text=${message.replace(
      "&",
      "and"
    )}&category=bulk`;
    // const sendsmsuri = smsURL + "?username=" + username + "&password=" + password + "&to=" + mobile + "&from=" + senderID + "&text=" + message.replace("&", "and") + "&category=bulk"
    // const result = await axios.get(sendsmsuri)
    // return result
    axios
      .get(sendsmsuri)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        resolve({ error: error.message });
      });
  });

const sendSmsTwilio = async (mobile, message) => {
  try {
    const msg = await client.messages.create({
      body: message,
      from: "+18089990674",
      to: mobile, //'+447800975274','+919845833443'//should be dynamic number
    });
    return msg;
  } catch (err) {
    return err;
  }
};

// exports.sendWhatsAppTwilio = async() => {
//   try{
//   const msg = await client.messages
//         .create({
//           from: 'whatsapp:+18089990674',
//           body: 'Hello, there!',
//           to: 'whatsapp:+919845833443'
//         })
//      return msg;
//     }catch(error){
//       console.log(error)
//   }
// }

exports.sendwati = (data) => {
  let url = `https://app-server.wati.io/api/v1/sendTemplateMessage?whatsappNumber=${data.mobile}`;
  const msg = axios
    .post(
      url,
      {
        template_name: "woocommerce_default_follow_up_v1",
        broadcast_name: "woocommerce_default_follow_up_v1",
        parameters: [
          {
            name: "name",
            value: data.name,
          },
          {
            name: "shop_name",
            value: "Active", //should be dynamic based on requirement
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json-patch+json",
          Authorization: BearerToken,
        },
      }
    )
    .then((doc) => doc.data)
    .catch((err) => console.log(err, "=============="));
};

exports.sendSMS = async (mobile, message, templateId) =>
  new Promise(async (resolve, reject) => {
    let checkCountryCode = mobile.substring(0, 3);
    if (checkCountryCode === "+91") {
      const countryCode = mobile.substring(1, 3);
      // const sendsmsuri = `${smsURL}?username=${username}&password=${password}&to=${mobile}&from=${senderID}&text=${message.replace("&", "and")}&dlr-mask=19&dlr-url`
      // const sendsmsuri = `${smsURL}mobileno=${mobile}&msgtext=${message.replace("&", "and")}&CountryCode=All&smstype=0&pe_id=1701159237759798464&template_id=${templateId}`
      const sendsmsuri = `${smsURL}CountryCode=${countryCode}&msgtext=${message.replace(
        "&",
        "and"
      )}&mobileno=${mobile.substring(
        3
      )}&pe_id=1701159237759798464&template_id=${templateId}`;
      axios
        .get(sendsmsuri)
        .then((response) => {
          console.log(
            "🚀 ~ file: utils.js ~ line 87 ~ exports.sendSMS= ~ response",
            response.data
          );
          resolve(response);
        })
        .catch(async (error) => {
          let checkServerError = /^5\d{2}$/.test(error.message.code);
          if (checkServerError) {
            let response = await sendSmsTwilio(mobile, message);
            resolve(response);
          } else {
            resolve({ error: error.message });
          }
        });
    } else {
      let response = await sendSmsTwilio(mobile, message);
      resolve({ response });
    }
  });

exports.sendExotelSms = (to, msgBody) =>
  new Promise(async (resolve, reject) => {
    const from = exotelSms.senderID;
    const dataString = `From=${from}&To=${to}&Body=${msgBody}&Priority=High`;
    const apiUrl = `${exotelSms.apiURL}/Sms/send.json`;
    axios({
      method: "post",
      url: apiUrl,
      data: dataString,
    })
      .then((response) => {
        // console.log("🚀 ~ file: utils.js ~ line 134 ~ exports.sendSMSExotel= ~ response", response)
        resolve(response);
      })
      .catch((error) => {
        console.log(error, "exotel error");
        resolve({ error: error.message });
      });
  });

exports.messageContent = (productDetails, _loc, name) => {
  const message = `You have an enquiry from EkBazaar.com for ${capitalizeFirstLetter(
    productDetails.name.name
  )},${productDetails.quantity} ${capitalizeFirstLetter(
    productDetails.weight
  )} from ${_loc}.\nDetails below: ${capitalizeFirstLetter(
    name
  )} -\nTo view buyer contact details please register or login to ${siteUrl}/signup\nEkbazaar-Trade ${siteUrl}`;
  return message;
};

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
    JWTTOKEN
    /* ,
     {
       expiresIn: '1h'
     } */
  );

exports.encodePassword = (password) => {
  return bcrypt.hashSync(password, bcryptSalt.SALT);
};

/**
 * upload to Digital Ocean Space
 */
module.exports.uploadToDOSpace = (req) => {
  // try {
  var params = {
    Body: req.body,
    Bucket,
    Key: req.Key,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) reject(err);
      else {
        resolve(data);
      }
    });
  });

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
};

/**
 * List all images from Digital Ocean Space
 */
module.exports.listAllDigitalOceanDocs = async () => {
  const params = {
    Bucket,
  };
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, function (err, data) {
      if (err) reject(err);
      else {
        resolve(data.Contents);
      }
    });
  });
};

/**
 * Delete images from Digital Ocean Space
 */
module.exports.deleteDigitalOceanDocs = async (query) => {
  const params = {
    Bucket,
    Key: query.key,
  };
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) reject(err);
      else {
        resolve(data);
      }
    });
  });
};
