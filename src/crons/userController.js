const camelcaseKeys = require("camelcase-keys");
const _ = require("lodash");
const axios = require("axios");
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { createToken, encodePassword, sendSMS } = require("../../utils/utils");
const {
  sendOtp,
  successfulRegistration,
  businessProfileIncomplete,
} = require("../../utils/templates/smsTemplate/smsTemplate");
const {
  sellers,
  buyers,
  mastercollections,
  subscriptionPlan,
  SellerPlans,
  SellerPlanLogs,
  Chat,
} = require("../../modules");
const { getSellerTypeAll } = require("../../modules/locationsModule");
const {
  checkSellerExist,
  deleteSellerRecord,
} = require("../../modules/sellersModule");
const { deleteSellerProducts } = require("../../modules/sellerProductModule");
const { MailgunKeys, fromEmail } = require("../../utils/globalConstants");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const {
  activateAccount,
} = require("../../utils/templates/activeteAccount/activateAccount");
const {
  emailVerified,
} = require("../../utils/templates/accountActivated/emailVerified");
const { sendSingleMail } = require("../../utils/mailgunService");
const {
  commonTemplate,
} = require("../../utils/templates/emailTemplate/emailTemplate");
const {
  emailSuccessfulRegistration,
  otpVerification,
  passwordUpdate,
} = require("../../utils/templates/emailTemplate/emailTemplateContent");
const { ssoRedirect } = require("../../../sso-tools/checkSSORedirect");
const { getSubscriptionPlanDetail } = subscriptionPlan;
const { createTrialPlan, deleteSellerPlans, getSellerPlan } = SellerPlans;
const { createChat } = Chat;

const { createChatUser, userChatLogin } = require("./rocketChatController");

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const {
  handleUserSession,
  getAccessToken,
  getSessionLog,
  checkUserExistOrNot,
  addUser,
  updateUser,
  getUserProfile,
  getSeller,
  updateSeller,
  forgetPassword,
  addSeller,
  addbusinessDetails,
  getSellerVal
} = sellers;
const {
  getBuyer,
  addBuyer,
  updateBuyer,
  getUserFromUserHash,
  updateEmailVerification,
  checkBuyerExistOrNot,
  deleteBuyer
} = buyers;
const { addMaster, updateMaster, bulkDeleteMasterProducts, updateMasterSellerDetails } = mastercollections;
const { addSellerPlanLog, getSellerPlansLog } = SellerPlanLogs;
const { sms } = require("../../utils/globalConstants");
const { getMasterRecords } = require("../../modules/masterModule");
const { username, password, senderID, smsURL } = sms

const isProd = process.env.NODE_ENV === "production";
const ssoRegisterUrl =
  global.environment === "production"
    ? ""
    : global.environment === "staging"
      ? "https://auth.tech-active.com/simplesso/register"
      : "http://localhost:3010/simplesso/register";
const serviceURL =
  global.environment === "production"
    ? ""
    : global.environment === "staging"
      ? "https://tradebazaarapi.tech-active.com"
      : "http://localhost:8070";

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
    // key : key.toString('hex')
  };
}

function decrypt(text) {
  const iv = Buffer.from(text.iv, "hex");
  // const enKey = Buffer.from(text.key, 'hex')
  const encryptedText = Buffer.from(text.encryptedData, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports.getAccessToken = async (req, res) => {
  try {
    const { ipAddress } = req.query;
    const deviceId = machineIdSync();
    const session = await getAccessToken(ipAddress);
    const sessionLog = await getSessionLog(ipAddress);
    if (session.length && sessionLog.length === 0) {
      respSuccess(res, { token: session[0].token });
    } else if (session.length && sessionLog.length) {
      const condition =
        new Date(session[0].requestedAt) > new Date(sessionLog[0].signOut);
      if (condition) {
        return respSuccess(res, { token: session[0].token });
      } else {
        return respSuccess(res, { token: null });
      }
    }
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.checkUserExistOrNot = async (req, res) => {
  try {
    const { mobile, countryCode, email } = req.body;
    console.log("🚀 ~ file: userController.js ~ line 147 ~ module.exports.checkUserExistOrNot= ~ req.body", req.body)
    let query = {}
    if (mobile) query = { mobile, 'countryCode': countryCode || "+91" }
    else query = { email }
    console.log("🚀 ~ file: userController.js ~ line 151 ~ module.exports.checkUserExistOrNot= ~ query", query)
    const seller = await checkUserExistOrNot(query);
    console.log(
      "🚀 ~ file: userController.js ~ line 113 ~ module.exports.checkUserExistOrNot= ~ seller",
      seller
    );
    if (seller && seller.length && !seller[0]["deleteTrade"]["status"]) {
      if (seller[0]["password"]) seller[0]["password"] = true;
      else seller[0]["password"] = false;
      return respSuccess(res, seller[0], "User with number already exist");
    } else if(seller && seller.length && seller[0]["deleteTrade"]["status"]) {
      return respError(res, "Account associated with the number is deleted. Please try to register.")
    }
    return respError(res, "No User found with this number");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile, reset, email, countryCode } = req.body;
    console.log("🚀 ~ file: userController.js ~ line 166 ~ module.exports.sendOtp= ~ req.body", req.body)
    let otp = 1234;
    let otpMessage = otpVerification({ otp });
    let query = {}
    if (mobile) query = { mobile, 'countryCode': countryCode || '+91' }
    else query = { email }
    const seller = await checkUserExistOrNot(query);
    console.log("🚀 ~ file: userController.js ~ line 173 ~ module.exports.sendOtp= ~ seller", seller)
    // const user = await checkBuyerExistOrNot(query)

    if (seller && seller.length && !reset /* && user && user.length */ && !seller[0]["deleteTrade"]["status"]) {
      return respError(res, "User already exist");
    }
    if (reset && (!seller || !seller.length))
      return respError(res, "User Not found");

    const checkUser =
      seller &&
      seller.length &&
      seller[0].email &&
      seller[0].isEmailVerified === 2;

    if (isProd) {
      otp = Math.floor(1000 + Math.random() * 9000);
      otpMessage = otpVerification({ otp });
      if (mobile) {
        const { otpMessage, templateId } = sendOtp({ reset, otp });
        console.log(otpMessage, templateId, "lllllllllllllllllllllllllllllllllllllll")
        let response = await sendSMS(`${countryCode || "+91"}${mobile}`, otpMessage, templateId);
        console.log("🚀 ~ file: userController.js ~ line 189 ~ module.exports.sendOtp= ~ response", response)
      } else if (checkUser || (email && !reset)) {
        const message = {
          from: MailgunKeys.senderMail,
          to: (Array.isArray(seller) && seller.length && seller[0].email) || email,
          subject: "OTP Verification",
          html: commonTemplate(otpMessage),
        };
        await sendSingleMail(message);

        return respSuccess(res, { otp }, checkUser || (email && !reset) ? "Your OTP has been send successfully, check your email or sms" : "");
      } else {
        console.log("=======Email is not verified yet================");
      }
      return respSuccess(res, { otp });
    } else {
      if (mobile) {
        return respSuccess(res, { otp }, "Your OTP has been send successfully, check your email or sms");
      } else if (checkUser || (email && !reset)) {
        //send email
        const message = {
          from: MailgunKeys.senderMail,
          to: email || seller.length && seller[0].email,
          subject: "OTP Verification",
          html: commonTemplate(otpMessage),
        };
        await sendSingleMail(message);
        return respSuccess(res, { otp }, checkUser || email ? "Your OTP has been send successfully, check your email or sms" : "");
      } else {
        console.log("=======Email is not verified yet================");
      }
      return respError(res, "Invalid Input");
    }
  } catch (error) {
    return respError(res, error.message);
  }
};

module.exports.verifySellerMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const { userID } = req;
    const seller = await updateUser(userID, { isPhoneVerified: true, mobile });
    respSuccess(res, seller, "Phone Verification Successfull");
  } catch (error) {
    respError(res, error.message);
  }
};

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

module.exports.addUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      mobile,
      ipAddress,
      preferredLanguage,
      user,
      _user,
      url,
    } = req.body;
    console.log("🚀 ~ file: userController.js ~ line 278 ~ module.exports.addUser= ~ req.body", req.body)
    const dateNow = new Date();

    req.body.userId = user._id;
    const buyerData = {
      countryCode: Boolean(mobile.countryCode) ? mobile.countryCode : "+91",
      mobile: Boolean(mobile.mobile) ? mobile.mobile : null,
      isPhoneVerified: Boolean(mobile.mobile),
      userId: user._id,
      email
    };
    const sellerData = {
      email,
      mobile: Boolean(mobile.mobile) ? mobile : [],
      isPhoneVerified: Boolean(mobile.mobile),
      userId: user._id,
    };
    let query = {}
    if (Boolean(mobile.mobile)) query = { mobile: mobile.mobile || mobile }
    else query = { email }
    const _buyer = await getBuyer(null, query)
    const buyer = await addBuyer(buyerData);

    const seller = await addSeller(sellerData);
    const masterData = {
      sellerId: {
        _id: seller._id,
        mobile: seller.mobile,
      },
      userId: {
        name: seller.name || null,
        _id: seller.userId,
      },
    };
    // const masterResult = await addMaster(masterData)
    // console.log("🚀 ~ file: userController.js ~ line 141 ~ module.exports.addUser= ~ masterResult", masterResult)
    // const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
    // const _seller = await updateSeller(seller._id, {
    //   busenessId: bsnsDtls._id,
    // });

    if (seller && buyer) {
      // const trialPlan = await getSubscriptionPlanDetail({
      //   planType: "trail",
      //   status: true,
      // });
      // if (trialPlan/*  && _buyer && !_buyer.length */) {
      //   const sellerDetails = {
      //     sellerId: seller._id,
      //     userId: seller.userId,
      //     name: seller.name || null,
      //     email: seller.email || null,
      //     mobile: seller.mobile || null,
      //     sellerType: seller.sellerType || null,
      //     paidSeller: seller.paidSeller,
      //     planId: seller.planId,
      //     trialExtends: seller.trialExtends,
      //   };
      //   const planData = {
      //     name: trialPlan.type,
      //     description: trialPlan.description,
      //     features: trialPlan.features,
      //     days: trialPlan.days,
      //     extendTimes: trialPlan.numberOfExtends,
      //     exprireDate: dateNow.setDate(
      //       dateNow.getDate() + parseInt(trialPlan.days)
      //     ),
      //     userId: seller.userId,
      //     sellerId: seller._id,
      //     isTrial: true,
      //     planType: trialPlan.type,
      //     extendDays: trialPlan.days,
      //     subscriptionId: trialPlan._id,
      //     createdOn: new Date(),
      //   };

      //   const planResult = await createTrialPlan(planData);
      //   const planDatra = {
      //     planId: planResult._id,
      //     trialExtends: trialPlan.numberOfExtends,
      //   };
      //   const sellerUpdate = await updateSeller({ _id: seller._id }, planDatra);

      //   const planLog = {
      //     sellerId: seller._id,
      //     userId: seller.userId,
      //     sellerPlanId: sellerUpdate.planId,
      //     subscriptionId: trialPlan._id,
      //     sellerDetails: { ...sellerDetails },
      //     planDetails: {
      //       ...planData,
      //       exprireDate: new Date(planData.exprireDate),
      //     },
      //   };
      //   const log = await addSellerPlanLog(planLog);
      // }

      // const response = await axios.post(ssoRegisterUrl, { mobile: mobile.mobile, password }, { params: { serviceURL } })
      // const { data } = response
      // let _user = data.user

      if (url) {
        const ssoToken = url.substring(url.indexOf("=") + 1);
        req.query = {
          ssoToken: ssoToken,
        };
      }

      const _response = await ssoRedirect(req, res, next);
      const { user, token } = _response;

      const userAgent = getUserAgent(req.useragent);

      const finalData = {
        userAgent,
        userId: seller.userId,
        token,
        deviceId: user.deviceId,
        ipAddress,
      };
      console.log("account created-------------------");

      const result1 = await handleUserSession(seller.userId, finalData);
      return respSuccess(
        res,
        { token, buyer, seller, user },
        "Account Created Successfully"
      );
    }
    return respError(res, "Account not Created");
  } catch (error) {
    console.log(error);
    respError(res, error.message);
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const { userID } = req;
    const user = await getUserProfile(userID);
    const seller = await getSeller(userID, req.body.status);
    const buyer = await getBuyer(userID);
    const userData = {
      user,
      seller,
      buyer
      // seller: {
      //   ...seller,
      //   ...user,
      //   mobile: seller.mobile && seller.mobile.length ? seller.mobile : [{mobile: user.mobile, countryCode: user.countryCode}]
      // },
      // buyer: {
      //   ...buyer,
      //   ...user
      // },
    };
    // console.log("🚀 ~ file: userController 3.js ~ line 418 ~ module.exports.getUserProfile= ~ userData", userData)
    respSuccess(res, userData);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { userID } = req;
    const dateNow = new Date();
    const _buyer = req.body.buyer || {};
    let {
      name,
      email,
      business,
      location,
      mobile,
      countryCode,
      type,
      sellerType,
      userType,
      hearingSource
    } = req.body;
    console.log("🚀 ~ file: userController.js ~ line 445 ~ module.exports.updateUser= ~ req.body", req.body)
    // return false

    console.log("🚀 ~ file: userController.js ~ line 440 ~ module.exports.updateUser= ~ _buyer", _buyer, location)
    const __usr = await getUserProfile(userID)
    console.log("🚀 ~ file: userController.js ~ line 456 ~ module.exports.updateUser= ~ __usr", __usr)
    let userData = {
      name: (Boolean(_buyer && _buyer.name) && _buyer.name) || (Boolean(name) && name) || __usr.name,
      city:
        (_buyer && _buyer.location && Boolean(_buyer.location.city) && _buyer.location.city) ||
        (location && location.city) ||
        null,
      email: (Boolean(_buyer && _buyer.email) && _buyer.email) || (Boolean(email) && email) || __usr.email,
      mobile: (mobile && Boolean(mobile.mobile) && parseInt(mobile.mobile)) || (Boolean(mobile) && parseInt(mobile)) || __usr.mobile,
      countryCode: (mobile && Boolean(mobile.countryCode)&& mobile.countryCode) || (Boolean(countryCode) && countryCode) || __usr.countryCode
    };
    console.log("🚀 ~ file: userController.js ~ line 467 ~ module.exports.updateUser= ~ userData", userData)

    let _seller = await getSeller(userID);
    let buyer = await getBuyer(userID);
    if (!_seller) {
      const sellerData = {
        name: (Boolean(name) && name) || __usr.name || null,
        email: (Boolean(email) && email) || __usr.email || null,
        mobile: [{
          mobile: (mobile && Boolean(mobile.mobile) && mobile.mobile) || (Boolean(mobile) && mobile) || (__usr.mobile && __usr.mobile.toString()),
          countryCode: (mobile && Boolean(mobile.countryCode) && mobile.countryCode) || (Boolean(countryCode) && countryCode) || __usr.countryCode
        }],
        userId: userID,
        sellerProductId: []
      }
      const buyerData = {
        name: (Boolean(name) && name) || __usr.name || null,
        email: (Boolean(email) && email) || __usr.email || null,
        mobile: (mobile && Boolean(mobile.mobile) && mobile.mobile) || (Boolean(mobile) && mobile) || (__usr.mobile && __usr.mobile.toString()),
        countryCode: (mobile && Boolean(mobile.countryCode) && mobile.countryCode) || (Boolean(countryCode) && countryCode) || __usr.countryCode,
        userId: userID
      }
      buyer = await updateBuyer({ userId: userID }, buyerData)
      _seller = await updateSeller({ userId: userID }, sellerData)
    }

    let buyerData = {
      name,
      email,
      location,
      userId: userID,
      mobile: (mobile && Boolean(mobile.mobile) && mobile.mobile) || (Boolean(mobile) && mobile) || (__usr.mobile && __usr.mobile.toString()),
      countryCode: (mobile && Boolean(mobile.countryCode) && mobile.countryCode) || (Boolean(countryCode) && countryCode) || __usr.countryCode,
      ..._buyer,
    };
    let sellerData;
    sellerData = {
      name,
      email: email || null,
      location,
      sellerType: sellerType ? [sellerType] : _seller.sellerType,
      userId: userID,
      mobile: [{
        mobile: (mobile && Boolean(mobile.mobile) && mobile.mobile) || (Boolean(mobile) && mobile) || (__usr.mobile && __usr.mobile.toString()),
        countryCode: (mobile && Boolean(mobile.countryCode) && mobile.countryCode) || (Boolean(countryCode) && countryCode) || __usr.countryCode
      }],
      ..._buyer,
    };
    if ((_buyer.mobile && _buyer.mobile.length) || (mobile && mobile.length)) {
      buyerData.mobile = _buyer.mobile[0]["mobile"] || mobile[0]["mobile"];
      buyerData.mobile =
        _buyer.mobile[0]["countryCode"] || mobile[0]["countryCode"];
      sellerData.mobile = _buyer.mobile || mobile;
    }
    if (_seller && _seller.sellerProductId && _seller.sellerProductId.length) {
      sellerData = {
        ...sellerData,
        profileUpdate: true,
      };
    }
    if (userData && userData.email) {
      userData.userHash = encrypt(userData.email);
    }
    const user = await updateUser({ _id: userID }, userData);
    delete sellerData.countryCode;
    if (_buyer && _buyer.mobile) {
      buyerData.mobile = _buyer.mobile[0].mobile;
      buyerData.countryCode = _buyer.mobile[0].countryCode;
    }
    delete buyerData && buyerData._id;
    // if (_seller && sellerType && (!_seller.sellerType || (_seller.sellerType && !_seller.sellerType.length)) && isProd) {
    //   const { successfulMessage, templateId } = successfulRegistration({ userType, name });
    //   let resp = await sendSMS(`${user.countryCode || '+91'}${user.mobile}`, successfulMessage, templateId);
    // }
    if (business) {
      const bsnsDtls = await addbusinessDetails(_seller._id, {
        name: business,
      });
      sellerData.busenessId = bsnsDtls._id;
    }

    let seller = {},
      activeChat = {};
    if (user && buyer && _seller) {
      const url = req.get("origin");
      if (user.email && !buyer.isEmailSent) {
        let { token } = req.headers.authorization.split("|")[1];
        token = token || req.token;
        const alteredToken = token.split(".").join("!");
        const link = `${url}/user/${userData.userHash.encryptedData}&${alteredToken}`;
        const template = await activateAccount(link);
        let message = {
          from: MailgunKeys.senderMail,
          to: user.email,
          subject: "Ekbazaar email verification",
          html: template,
        };
        sendSingleMail(message);

        sellerData.isEmailSent = true;
        buyerData.isEmailSent = true;
        buyer = await updateBuyer({ userId: userID }, buyerData);
        seller = await updateSeller({ userId: userID }, sellerData);

        // if (isProd) {

        //   const { successfulMessage, templateId } = successfulRegistration({ userType, name });
        //   let resp = await sendSMS(`${user.countryCode || '+91'}${user.mobile}`, successfulMessage, templateId);

        // }

        let emailMessage = emailSuccessfulRegistration({
          name: user.name,
          url: url,
          userType,
        });
        message = {
          from: MailgunKeys.senderMail,
          to: user.email,
          subject: "Successful Registration",
          html: commonTemplate(emailMessage),
        };
        sendSingleMail(message);

      } else if (user.email && buyer.isEmailSent) {
        buyer = await updateBuyer({ userId: userID }, buyerData);
        seller = await updateSeller({ userId: userID }, sellerData);
      }

      const sellerPlans = await getSellerPlan({ sellerId: seller._id })
      if (userType === "seller" && !sellerPlans) {
        const code = ['GCC0721', 'SMEC0721', 'DVRN0721']
        const promoCode = code.indexOf(hearingSource.referralCode) !== -1 ? true : false
        console.log("🚀 ~ file: userController.js ~ line 603 ~ module.exports.updateUser= ~ promoCode", promoCode)
        const dateNow = new Date();
        const trialPlan = await getSubscriptionPlanDetail({
          planType: "trail",
          status: true,
        });

        if (trialPlan) {
          const sellerDetails = {
            sellerId: seller._id,
            userId: seller.userId,
            name: seller.name || name || null,
            email: seller.email || email || null,
            mobile: __usr.mobile || null,
            sellerType: seller.sellerType || null,
            paidSeller: seller.paidSeller,
            planId: seller.planId,
            trialExtends: seller.trialExtends,
          };
          const planData = {
            name: trialPlan.type,
            description: trialPlan.description,
            features: trialPlan.features,
            days: promoCode ? "90" : trialPlan.days,
            extendTimes: trialPlan.numberOfExtends,
            exprireDate: dateNow.setDate(
              dateNow.getDate() + parseInt(promoCode ? "90" : trialPlan.days)
            ),
            userId: seller.userId,
            sellerId: seller._id,
            isTrial: true,
            planType: trialPlan.type,
            extendDays: promoCode ? "90" : trialPlan.days,
            subscriptionId: trialPlan._id,
            createdOn: new Date(),
          };

          const planResult = await createTrialPlan(planData);
          const planDatra = {
            planId: planResult._id,
            trialExtends: trialPlan.numberOfExtends,
            hearingSource
          };
          const sellerUpdate = await updateSeller({ _id: seller._id }, planDatra);

          const planLog = {
            sellerId: seller._id,
            userId: seller.userId,
            sellerPlanId: sellerUpdate.planId,
            subscriptionId: trialPlan._id,
            sellerDetails: { ...sellerDetails },
            planDetails: {
              ...planData,
              exprireDate: new Date(planData.exprireDate),
            },
          };
          const log = await addSellerPlanLog(planLog);
          if (isProd) {

            const { successfulMessage, templateId } = successfulRegistration({ userType, name, promoCode });
            let resp = await sendSMS(`${user.countryCode || '+91'}${user.mobile}`, successfulMessage, templateId);

          }
        }
      }

      buyer = await getBuyer(null, { _id: buyer._id })
      seller = await getSeller(null, null, { _id: _seller._id })
      // let keywords = []
      // keywords.push(seller.name.toLowerCase())
      // keywords.push(...seller.sellerType.map((v) => v.name.toLowerCase()))
      // keywords = _.without(_.uniq(keywords), '', null, undefined)
      let masterRecords = await getMasterRecords({ 'userId._id': seller.userId }, {})

      if (masterRecords && masterRecords.length) {

        console.log("🚀 ~ file: userController.js ~ line 669 ~ module.exports.updateUser= ~ masterRecords", masterRecords)
        masterRecords = masterRecords && masterRecords.length ? masterRecords[0] : {}
        let sellerId = masterRecords.sellerId || {}
        const masterData = {
          sellerId: {
            ...sellerId,
            location: seller.location,
            name: seller.name,
            email: seller.email,
            sellerType: seller.sellerType,
            _id: seller._id,
            mobile: seller.mobile,
            sellerType: {
              type: Array,
              default: null
            },
            country: seller.location.country,
            businessName: seller.busenessId && seller.busenessId.name,
            userId: {
              name: seller.name,
              _id: seller.userId
            },
          }
          // keywords
        }
        updateMasterSellerDetails({ 'userId._id': seller.userId }, masterData)
      }

      respSuccess(
        res,
        {
          seller,
          buyer,
          activeChat,
        },
        user.email && user.isEmailVerified === 1
          ? "Your profile details are updated successfully"
          : "Updated Successfully"
      );
    } else {
      respError(res, "Failed to update");
    }
  } catch (error) {
    console.log(error, ' gggggggg -------------')
    respError(res, error.message);
  }
};

exports.updateUserLanguage = async (req, res) => {
  try {
    const { userID } = req;
    const user = await updateUser({ _id: userID }, req.body);
    console.log(
      "🚀 ~ file: userController.js ~ line 480 ~ exports.updateUserLanguage= ~ user",
      user
    );
    respSuccess(res);
  } catch (error) {
    respError(res, error.message);
  }
};

exports.verifiedEmail = async (req, res) => {
  try {
    const { encryptedData } = req.body;
    console.log(req.body, ' --------- bofff')
    const user = await getUserFromUserHash(encryptedData);
    let hash;
    if (user.length) {
      hash = user[0].userHash;
    }
    console.log('--___eamesh email verifies -----------')
    const userEmail = decrypt(hash);
    const data = await updateEmailVerification(encryptedData, {
      userEmail: userEmail,
      isEmailVerified: 2
    });
    console.log("🚀 ~ file: userController.js ~ line 732 ~ exports.verifiedEmail= ~ data", data)
    if (data.ok === 1) {
      let mobileVal = user[0].mobile.toString();
      await updateBuyer({ mobile: mobileVal }, { isEmailVerified: true });
      await updateSeller(
        { "mobile.mobile": mobileVal },
        { isEmailVerified: true }
      );
    }
    const url = req.get("origin");
    // const template = await emailVerified("https://tradebazaar.tech-active.com")
    const template = await emailVerified({ link: url, name: user[0].name });
    const message = {
      from: MailgunKeys.senderMail,
      to: userEmail,
      subject: "Email verified",
      html: template,
    };
    await sendSingleMail(message);
    return respSuccess(res);
  } catch (error) {
    return respError(res, error);
  }
};

module.exports.forgetPassword = async (req, res) => {
  try {
    let { mobile, password } = req.body;
    password = encodePassword(password);
    const user = await forgetPassword(mobile, { password });
    respSuccess(res, user, "Password Updated Successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateNewPassword = async (req, res) => {
  try {
    const url = req.get("origin");
    let { password, currentPassword } = req.body;
    let checkPassword = password;
    password = encodePassword(password);
    const { userID } = req;
    // console.log("req.body", req.body, userID)
    let findUser = await checkUserExistOrNot({ _id: userID });

    const curntPwd = findUser && findUser.length && findUser[0].password;
    const comparePass = await bcrypt.compare(currentPassword, curntPwd);
    const compareCurrentOldPass = await bcrypt.compare(checkPassword, curntPwd);
    if (compareCurrentOldPass) {
      return respError(
        res,
        "Entered password is same as old password, try to enter different password"
      );
    }
    if (!comparePass) {
      return respError(res, "Current pasword is not correct");
    }
    const user = await updateUser({ _id: userID }, { password });
    if (user && user.email && user.name) {
      const updatePasswordMsg = passwordUpdate({ name: user.name, url: url + '/signin' });
      const message = {
        from: MailgunKeys.senderMail,
        to: user.email,
        subject: "Password Update",
        html: commonTemplate(updatePasswordMsg),
      };
      /* await */ sendSingleMail(message);
    }
    respSuccess(res, user, "Password Updated Successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.deleteRecords = async (req, res) =>
  new Promise(async (resolve, reject) => {
    try {
      const arr = [
        "5f97acc7b9a4b5524568716a",
        "5f97ace6b9a4b5524568716b",
        "5f97acf2b9a4b5524568716c",
        "5fa4fac96eb907267c7d15ce",
        "5fa5506e0524f35f355955f2",
        "5fa61d53520fd81fba4a1d6d",
        "5fb397c072e59028f0d17e32",
        "5fb39ad034d3932a93e0f079",
        "5fb46f021135863cd3c66664",
        "5fb5f268805ec7db145b4e58",
        "5fddfd218994761734d8011b",
        "5fe08558ad5cb94f153017d6",
        "5fe226ddcc99a97286d53e35",
        "5fe2271e30e98d73b97671ea",
      ];
      const que = {
        _id: {
          $nin: arr,
        },
      };
      const range = {
        skip: req.skip,
        limit: req.limit,
      };
      // console.log("🚀 ~ file: userController.js ~ line 312 ~ module.exports.deleteRecords ~ range", range)
      const sellerType = await getSellerTypeAll(que, range);
      if (sellerType.length) {
        for (let i = 0; i < sellerType.length; i++) {
          const sType = sellerType[i];
          const query = {
            sellerType: {
              $in: sType._id,
            },
          };
          const seller = await checkSellerExist(query);
          // console.log("🚀 ~ file: userController.js ~ line 316 ~ module.exports.deleteRecords ~ query", seller)
          if (seller) {
            const pQuery = {
              _id: {
                $in: seller.sellerProductId,
              },
            };
            // console.log(pQuery, 'length ::::::: ', pQuery.length, ' delete ids #####################################')
            const delRec = await deleteSellerProducts(pQuery);
            // console.log(' seller pro delete --------------------------------------')
            if (delRec) {
              const delSell = await deleteSellerRecord(seller._id);
              // console.log(delSell.name, ' seller delte +++++++++++++++++++++++++++++++++++++++++++++')
            }
          } else {
            console.log("not exist----------------------------");
          }
          console.log(sType.name + " &&&& " + i, "    ~ seller Type");
        }
      }
      console.log("Completed----------");
      resolve();
      // res.send(sellerType)
    } catch (error) {
      console.log(
        "🚀 ~ file: userController.js ~ line 343 ~ module.exports.deleteRecords ~ error",
        error
      );
      reject(error);
    }
  });

exports.verificationEmail = async (req, res) => {

  try {
    const { email, mobile, token, userId } = req.body
    console.log("🚀 ~ file: userController.js ~ line 884 ~ exports.verificationEmail= ~ email", email)
    const { userID } = req
    const url = req.get("origin");
    if (email) {
      req.body.userHash = encrypt(email)
      const updateUserData = {
        userHash: req.body.userHash,
        email,
        isEmailVerified: 1
      }
      let { token } = req.headers.authorization.split("|")[1];
      token = token || req.token;
      const alteredToken = token.split(".").join("!");

      const link = `${url}/user/${req.body.userHash.encryptedData}&${alteredToken}`;
      console.log("🚀 ~ file: userController.js ~ line 891 ~ exports.verificationEmail= ~ link", link)
      const template = await activateAccount(link);
      let message = {
        from: MailgunKeys.senderMail,
        to: email,
        subject: "Ekbazaar email verification",
        html: template,
      };
      sendSingleMail(message);
      const updateData = {
        isEmailSent: true,
        email,
        isEmailVerified: false
      }
      await updateBuyer({ userId: userID }, updateData);
      await updateSeller({ userId: userID }, updateData);
      const ccc = await updateUser({ _id: userID }, updateUserData)
    }

    // const { email, mobile, token } = req.body
    // const { userID } = req
    // // const alteredToken = token.split('.').join('!')
    // // console.log(alteredToken)
    // req.body.userHash = encrypt(email)
    // // console.log(typeof req.body.userHash.iv, '555', typeof req.body.userHash.encryptedData)
    // const _email = decrypt(req.body.userHash)
    // console.log(_email, '_email.................')
    // const updateData = {
    //   userHash: req.body.userHash
    // }
    // req.body.isEmailVerified = 1
    // const data = await updateUser(userID, updateData)
    // if (data) {

    //   const auth = {
    //     auth: {
    //       api_key: mailgunAPIKey,
    //       domain: mailgunDomain
    //     }
    //   }

    //   const nodemailerMailgun = nodemailer.createTransport(mg(auth));

    //   const htmlMessage = `<section><p>Click <a href="https://ekbazaar.tech-active.com/user/${req.body.userHash.encryptedData}&${alteredToken}">here</a> to verify your email or on the link below</p><br/><a href="https://ekbazaar.tech-active.com/user/${req.body.userHash.encryptedData}&${alteredToken}">https://ekbazaar.tech-active.com/user/${req.body.userHash.encryptedData}&${alteredToken}</a></section>`;

    //   const link = `${siteURL}/user/${req.body.userHash.encryptedData}&${alteredToken}`

    //   const template = await activateAccount(link)
    //   const message = {
    //     from: senderMail,
    //     to: email,
    //     subject: "Ekbazaar email verification",
    //     "h:Reply-To": replyMail,
    //     html: template,
    //     text: "Mailgun rocks, pow pow!"
    //   };
    //   console.log(message, ' message -------')

    //   nodemailerMailgun.sendMail(message, (err, info) => {
    //     if (err) {
    //       console.log(`Error: ${err}`);
    //     } else {
    //       console.log(`Response: ${info}`);
    //     }
    //   });

    return respSuccess(res, { email, message: 'verification link has been sent to your email' })

    // }

  } catch (error) {
    console.log(error, ' eeeeeeeeeeeeeeee')
    return respError(res, error)

  }

}


module.exports.deleteCurrentAccount = async (req, res) => {

  try {
    const { deleteTrade, userId, sellerId, buyerId, permanentDelete, investment, tender } = req.body

    const investmentUrl = process.env.NODE_ENV === "production" ? 'https://investmentapi.ekbazaar.com/api/permanentlydisable' : 'https://investmentapi.tech-active.com/api/permanentlydisable'
    const tenderUrl = process.env.NODE_ENV === "production" ? `https://api.ekbazaar.com/api/v1/deleteTenderUser/${userId}` : `https://elastic.tech-active.com:8443/api/v1/deleteTenderUser/${userId}`

    const { userID, token } = req;
    const result = await updateUser({ _id: userId }, { deleteTrade })
    if (result) {
      let query = {}
      if (!sellerId) query.userId = userId
      else query._id = sellerId
      const sellerData = await getSellerVal(query)
      console.log("🚀 ~ file: userController.js ~ line 898 ~ module.exports.deleteCurrentAccount ~ sellerData", sellerData)

      if (!buyerId) query.userId = userId
      else query._id = buyerId
      const _buyer = await deleteBuyer({ _id: buyerId })
      console.log("🚀 ~ file: userController.js ~ line 902 ~ module.exports.deleteCurrentAccount ~ _buyer", _buyer)

      delete query._id
      delete query.userId
      if(!sellerId) query.userId = userId
      else query._id = sellerData._id
      // query._id = sellerData._id
      console.log("🚀 ~ file: userController.js ~ line 906 ~ module.exports.deleteCurrentAccount ~ query", query)

      const _seller = await deleteSellerRecord(query);
      console.log("🚀 ~ file: userController.js ~ line 908 ~ module.exports.deleteCurrentAccount ~ _seller", _seller)

      if (sellerData && sellerData.sellerProductId && sellerData.sellerProductId.length) {
        const pQuery = {
          _id: {
            $in: sellerData.sellerProductId,
          },
        };
        console.log("🚀 ~ file: userController.js ~ line 915 ~ module.exports.deleteCurrentAccount ~ pQuery", pQuery)
        const delRec = deleteSellerProducts(pQuery);
        console.log("🚀 ~ file: userController.js ~ line 916 ~ module.exports.deleteCurrentAccount ~ delRec", delRec)
        const delMaster = bulkDeleteMasterProducts(pQuery);
        console.log('master collectiona nd seller product delete')
      }
      const delMaster1 = deleteSellerPlans({ sellerId: sellerData._id });
      console.log("🚀 ~ file: userController.js ~ line 920 ~ module.exports.deleteCurrentAccount ~ delMaster1", delMaster1)
      if (permanentDelete) {

        const update = {
          status: true,
          reason: deleteTrade.reason
        }
        // const result = /* await */ updateUser({ _id: userId }, { deleteTendor: update, deleteInvestement: update })

        // Delete from Investment
        const res = axios.delete(investmentUrl, {
          headers: {
            'Content-Type': 'application/json',
            'authorization': `ekbazaar|${token}`,
          },
          data: {
            deleteInvestement: deleteTrade
          }
        });
        console.log("🚀 ~ file: userController.js ~ line 938 ~ module.exports.deleteCurrentAccount ~ res", res)

        // Delete From Tender
        const resTender = axios.delete(tenderUrl, {
          headers: {
            'Content-Type': 'application/json',
            'authorization': `ekbazaar|${token}`,
          },
          data: {
            deleteTendor: deleteTrade
          }
        });
        console.log("🚀 ~ file: userController.js ~ line 950 ~ module.exports.deleteCurrentAccount ~ resTender", resTender)
      }
    }
    respSuccess(res, "Deleted Succesfully")

  } catch (error) {

  }

}
