const camelcaseKeys = require("camelcase-keys");
const _ = require('lodash')
const axios = require("axios")
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { createToken, encodePassword } = require("../../utils/utils");
const { sellers, buyers, mastercollections, subscriptionPlan, SellerPlans, SellerPlanLogs } = require("../../modules");
const { getSellerTypeAll } = require('../../modules/locationsModule')
const { checkSellerExist, deleteSellerRecord } = require('../../modules/sellersModule')
const { deleteSellerProducts } = require('../../modules/sellerProductModule')
const {
  MailgunKeys,
  fromEmail
} = require('../../utils/globalConstants')
const bcrypt = require("bcrypt");

const crypto = require('crypto')
const {
  activateAccount
} = require('../../utils/templates/activeteAccount/activateAccount')
const {
  emailVerified
} = require('../../utils/templates/accountActivated/emailVerified')
const {
  sendSingleMail
} = require('../../utils/mailgunService')
const { getSubscriptionPlanDetail } = subscriptionPlan
const { createTrialPlan } = SellerPlans
const algorithm = 'aes-256-cbc'
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
  addbusinessDetails
} = sellers;
const {
  getBuyer,
  addBuyer,
  updateBuyer,
  getUserFromUserHash,
  updateEmailVerification

} = buyers;
const { getMaster, addMaster, updateMaster } = mastercollections
const { addSellerPlanLog } = SellerPlanLogs
const { sms } = require("../../utils/globalConstants")
// const {username, password, senderID, smsURL} = sms

const isProd = process.env.NODE_ENV === "production"


function encrypt(text) {

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    // key : key.toString('hex')
  };

}

function decrypt(text) {
  const iv = Buffer.from(text.iv, 'hex');
  // const enKey = Buffer.from(text.key, 'hex')
  const encryptedText = Buffer.from(text.encryptedData, 'hex');
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
    const { mobile } = req.body;
    const seller = await checkUserExistOrNot({ mobile });
    if (seller && seller.length) {
      respSuccess(res, "User with number already exist");
    }
    return respError(res, "No User found with this number");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile, reset } = req.body;
    const seller = await checkUserExistOrNot({ mobile });
    if (seller && seller.length && !reset) {
      return respError(res, "User with this number already exist");
    }
    if (reset && (!seller || !seller.length)) return respError(res, "No User found with this number");
    const otp = 1234;
    const checkUser = seller && seller.length && seller[0].email && seller[0].isEmailVerified === 2;
    if (isProd) {
      const url = "https://api.ekbazaar.com/api/v1/sendOTP"
      const resp = await axios.post(url, {
        mobile
      })
      if (resp.data.success) {
        if (checkUser) {
          //send email
          const message = {
            from: MailgunKeys.senderMail,
            to: seller[0].email,
            subject: 'Forgot Password OTP',
            html: `<p>Your OTP is : <strong>${resp.data.data.otp}</strong></p>`
          }
          await sendSingleMail(message)
        }else{
          console.log("=======Email is not verified yet================")
        }
        return respSuccess(res, {
          otp: resp.data.data.otp
        }, checkUser ? 'Your OTP has been send successfully, check your email or sms' : "");
      }
    } else {
      if (checkUser) {
        //send email
        const message = {
          from: MailgunKeys.senderMail,
          to: seller[0].email,
          subject: 'Forgot Password OTP',
          html: `<p>Your OTP is : <strong>${otp}</strong></p>`
        }
        await sendSingleMail(message)
      }else{
        console.log("=======Email is not verified yet================")
      }
      return respSuccess(res, {
        otp
      }, checkUser ? 'Your OTP has been send successfully, check your email or sms' : "");
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

  const {
    browser, version, os, platform, source
  } = userAgent
  return {
    browser,
    version,
    os,
    platform,
    source
  }

}

module.exports.addUser = async (req, res) => {
  try {
    const { password, mobile, ipAddress, preferredLanguage } = req.body;
    const dateNow = new Date();
    req.body.password = encodePassword(password);
    const tenderUser = {
      countryCode: mobile.countryCode,
      mobile: mobile.mobile,
      isPhoneVerified: 2,
      password: req.body.password,
      preferredLanguage
    };

    const user = await addUser(tenderUser);

    req.body.userId = user._id;
    const buyerData = {
      countryCode: mobile.countryCode,
      mobile: mobile.mobile,
      isPhoneVerified: true,
      userId: user._id,
    };
    const sellerData = {
      mobile,
      isPhoneVerified: true,
      userId: user._id,
    };
    const buyer = await addBuyer(buyerData);

    const seller = await addSeller(sellerData);
    const masterData = {
      sellerId: {
        _id: seller._id,
        mobile: seller.mobile
      },
      userId: {
        name: seller.name || null,
        _id: seller.userId
      }
    }
    // const masterResult = await addMaster(masterData)
    // console.log("🚀 ~ file: userController.js ~ line 141 ~ module.exports.addUser= ~ masterResult", masterResult)
    // const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
    // const _seller = await updateSeller(seller._id, {
    //   busenessId: bsnsDtls._id,
    // });
    if (seller && buyer) {
      const trialPlan = await getSubscriptionPlanDetail({ planType: "trail", status: true })
      if (trialPlan) {
        const sellerDetails = {
          sellerId: seller._id,
          userId: seller.userId,
          name: seller.name || null,
          email: seller.email || null,
          mobile: seller.mobile || null,
          sellerType: seller.sellerType || null,
          paidSeller: seller.paidSeller,
          planId: seller.planId,
          trialExtends: seller.trialExtends

        }
        const planData = {
          name: trialPlan.type,
          description: trialPlan.description,
          features: trialPlan.features,
          days: trialPlan.days,
          extendTimes: trialPlan.numberOfExtends,
          exprireDate: dateNow.setDate(dateNow.getDate() + parseInt(trialPlan.days)),
          userId: seller.userId,
          sellerId: seller._id,
          isTrial: true,
          planType: trialPlan.type,
          extendDays: trialPlan.days,
          subscriptionId: trialPlan._id,
          createdOn: new Date(dateNow)
        }

        const planResult = await createTrialPlan(planData)
        const planDatra = {
          planId: planResult._id,
          trialExtends: trialPlan.numberOfExtends,
        }
        const sellerUpdate = await updateSeller({ _id: seller._id }, planDatra);

        const planLog = {
          sellerId: seller._id,
          userId: seller.userId,
          sellerPlanId: sellerUpdate.planId,
          subscriptionId: trialPlan._id,
          sellerDetails: { ...sellerDetails },
          planDetails: {
            ...planData,
            exprireDate: new Date(planData.exprireDate)
          }
        }
        const log = await addSellerPlanLog(planLog)

      }
      const deviceId = machineIdSync();
      const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { userId: seller.userId });
      const finalData = {
        userAgent,
        userId: seller.userId,
        token,
        deviceId,
        ipAddress
      }
      console.log('account created-------------------')

      const result1 = await handleUserSession(seller.userId, finalData)
      return respSuccess(
        res,
        { token, buyer, seller },
        "Account Created Successfully"
      );
    }
    return respError(res, "Account not Created");
  } catch (error) {
    console.log(error)
    respError(res, error.message);
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const { userID } = req;
    const user = await getUserProfile(userID)
    const seller = await getSeller(userID, req.body.status);
    const buyer = await getBuyer(userID);
    const userData = {
      user,
      seller,
      buyer
    };
    respSuccess(res, userData);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { userID } = req;
    const _buyer = req.body.buyer || {}
    console.log('-----------update seller -------------------', req.body)
    let { name, email, business, location, mobile, type, sellerType } = req.body;

    let userData = {
      name: _buyer && _buyer.name || name,
      city: _buyer && _buyer.location && _buyer.location.city || location.city || null,
      email: _buyer && _buyer.email || email || null,
    };
    let _seller = await getSeller(userID)
    let buyerData = {
      name,
      email,
      location,
      userId: userID,
      // mobile: _buyer.mobile || _seller.mobile,
      ..._buyer
    };
    let sellerData
    sellerData = {
      name,
      email: email || null,
      location,
      sellerType: sellerType ? [sellerType] : _seller.sellerType,
      userId: userID,
      ..._buyer
    };
    if((_buyer.mobile && _buyer.mobile.length) ||(mobile && mobile.length)) {
      buyerData.mobile = _buyer.mobile[0]["mobile"] || mobile[0]["mobile"]
      buyerData.mobile = _buyer.mobile[0]["countryCode"] || mobile[0]["countryCode"]
      sellerData.mobile = _buyer.mobile || mobile
    }
    if (_seller && _seller.sellerProductId && _seller.sellerProductId.length) {
      sellerData = {
        ...sellerData,
        profileUpdate: true,
      }
    }
    if (userData && userData.email) {
      userData.userHash = encrypt(userData.email)
    }
    const user = await updateUser({ _id: userID }, userData);
    delete sellerData.countryCode
    let seller = await updateSeller({ userId: userID }, sellerData);
    if (_buyer && _buyer.mobile) {
      buyerData.mobile = _buyer.mobile[0].mobile;
      buyerData.countryCode = _buyer.mobile[0].countryCode;
    }
    delete buyerData && buyerData._id;
    buyer = await updateBuyer({ userId: userID }, buyerData);

    if (business) {
      const bsnsDtls = await addbusinessDetails(seller._id, { name: business });
      const _seller = await updateSeller({ userId: userID }, {
        busenessId: bsnsDtls._id,
      });
    }
    seller = await getSeller(userID)
    buyer = await getBuyer(userID)

    // let keywords = []
    // keywords.push(seller.name.toLowerCase())
    // keywords.push(...seller.sellerType.map((v) => v.name.toLowerCase()))
    // keywords = _.without(_.uniq(keywords), '', null, undefined)

    // const masterData = {
    //   sellerId: {
    //     location: seller.location,
    //     name: seller.name,
    //     email: seller.email,
    //     sellerType: seller.sellerType,
    //     _id: seller._id,
    //     mobile: seller.mobile
    //   },
    //   userId: {
    //     name: seller.name,
    //     _id: seller.userId
    //   },
    //   keywords
    // }
    // const masterResult = await updateMaster({ 'userId._id': seller.userId }, masterData)

    if (user && buyer && seller) {

      if (buyer.isEmailSend === false && buyer.email) {
        seller.isEmailSent = true;
        buyer.isEmailSent = true
        const message = {
          from: MailgunKeys.senderMail,
          to: buyer.email,
          subject: 'Successful Registration',
          html: `<p>Your profile has been successfully registered</p>`
        }
        await sendSingleMail(message)
        await updateBuyer({ _id: buyer._id }, buyer);
        await updateSeller({ _id: seller._id }, seller);
      }

      if (user.email && user.isEmailVerified === 1) {
        let {
          token
        } = req.headers.authorization.split('|')[1]
        token = token || req.token
        // req.body.userHash = encrypt(user.email)
        const alteredToken = token.split('.').join('!')
        const url = req.get('origin');
        // const link = "https://tradebazaar.tech-active.com/user/" + userData.userHash.encryptedData + "&" + alteredToken
        const link = `${url}/user/${userData.userHash.encryptedData}&${alteredToken}`
        const template = await activateAccount(link)

        const message = {
          from: MailgunKeys.senderMail,
          to: user.email,
          subject: 'Ekbazaar email verification',
          html: template
        }
        await sendSingleMail(message)
      }
      respSuccess(res, {
        seller,
        buyer
      }, user.email && user.isEmailVerified === 1 ? "Updated Successfully and check your email to activate your email" : "Updated Successfully");
    } else {
      respError(res, "Failed to update");
    }
  } catch (error) {
    respError(res, error.message);
  }
};

exports.verifiedEmail = async (req, res) => {

  try {

    const {
      encryptedData
    } = req.body
    const user = await getUserFromUserHash(encryptedData)
    let hash;
    if (user.length) { hash = user[0].userHash }
    const userEmail = decrypt(hash)
    const data = await updateEmailVerification(encryptedData, {
      userEmail: userEmail
    })
    if (data.ok === 1) {
      let mobileVal = user[0].mobile.toString();
      await updateBuyer({ "mobile": mobileVal }, { isEmailVerified: true })
      await updateSeller({ "mobile.mobile": mobileVal }, { isEmailVerified: true })
    }
    const url = req.get('origin');
    // const template = await emailVerified("https://tradebazaar.tech-active.com")
    const template = await emailVerified(url)
    const message = {
      from: MailgunKeys.senderMail,
      to: userEmail,
      subject: "Email verified",
      html: template
    }
    await sendSingleMail(message)
    return respSuccess(res)

  } catch (error) {
    return respError(res, error)

  }

}

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
    let { password, currentPassword } = req.body;
    let checkPassword = password;
    password = encodePassword(password);
    const { userID } = req;
    // console.log("req.body", req.body, userID)
    let findUser = await checkUserExistOrNot({ _id: userID });

    const curntPwd = findUser && findUser.length && findUser[0].password
    const comparePass = await bcrypt.compare(currentPassword, curntPwd);
    const compareCurrentOldPass = await bcrypt.compare(checkPassword, curntPwd);
    if (compareCurrentOldPass){
      return respError(res, "Entered password is same as old password, try to enter different password")
    }
    if (!comparePass) {
      return respError(res, "Current pasword is not correct")
    }
    const user = await updateUser({ _id: userID }, { password });
    if (user && user.email) {
      const message = {
        from: MailgunKeys.senderMail,
        to: user.email,
        subject: 'Password Update',
        html: `<p>Your password has been successfully updated</p>`
      }
      await sendSingleMail(message)
    }
    respSuccess(res, user, "Password Updated Successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

// let dt = new Date()
//     let date = `${dt.getUTCDate()}`
//     let month = `${dt.getUTCMonth()+1}`
//     let year = `${dt.getUTCFullYear()}`
//     let hours = `${dt.getUTCHours()}`
//     let minutes = `${dt.getUTCMinutes()}`
//     let seconds = `${dt.getUTCSeconds()}`
//     let milisecs = `${dt.getUTCMilliseconds()}`

//     const currentTime = `${year}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date} ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${seconds.length === 1 ? `0${seconds}` : seconds}.${milisecs}Z`

//     const timestamp = dt.getTime()
//     const newTimestamp = timestamp - 12000000
//     dt = new Date(newTimestamp)
//     date = `${dt.getUTCDate()}`
//     month = `${dt.getUTCMonth()+1}`
//     year = `${dt.getUTCFullYear()}`
//     hours = `${dt.getUTCHours()}`
//     minutes = `${dt.getUTCMinutes()}`
//     seconds = `${dt.getUTCSeconds()}`
//     milisecs = `${dt.getUTCMilliseconds()}`

//     const startTime = `${year}-${month.length === 1 ? `0${month}` : month}-${date.length === 1 ? `0${date}` : date} ${hours.length === 1 ? `0${hours}` : hours}:${minutes.length === 1 ? `0${minutes}` : minutes}:${seconds.length === 1 ? `0${seconds}` : seconds}.${milisecs}Z`

module.exports.deleteRecords = async (req, res) => new Promise(async (resolve, reject) => {

  try {

    // console.log('delete ------')
    const arr = ['5f97acc7b9a4b5524568716a', '5f97ace6b9a4b5524568716b', '5f97acf2b9a4b5524568716c', '5fa4fac96eb907267c7d15ce', '5fa5506e0524f35f355955f2',
      '5fa61d53520fd81fba4a1d6d', '5fb397c072e59028f0d17e32', '5fb39ad034d3932a93e0f079', '5fb46f021135863cd3c66664', '5fb5f268805ec7db145b4e58', '5fddfd218994761734d8011b',
      '5fe08558ad5cb94f153017d6', '5fe226ddcc99a97286d53e35', '5fe2271e30e98d73b97671ea']
    const que = {
      _id: {
        $nin: arr
      }
    }
    const range = {
      skip: req.skip,
      limit: req.limit
    }
    // console.log("🚀 ~ file: userController.js ~ line 312 ~ module.exports.deleteRecords ~ range", range)
    const sellerType = await getSellerTypeAll(que, range)
    if (sellerType.length) {
      for (let i = 0; i < sellerType.length; i++) {
        const sType = sellerType[i]
        const query = {
          sellerType: {
            $in: sType._id
          }
        }
        const seller = await checkSellerExist(query)
        // console.log("🚀 ~ file: userController.js ~ line 316 ~ module.exports.deleteRecords ~ query", seller)
        if (seller) {
          const pQuery = {
            _id: {
              $in: seller.sellerProductId
            }
          }
          // console.log(pQuery, 'length ::::::: ', pQuery.length, ' delete ids #####################################')
          const delRec = await deleteSellerProducts(pQuery)
          // console.log(' seller pro delete --------------------------------------')
          if (delRec) {
            const delSell = await deleteSellerRecord(seller._id)
            // console.log(delSell.name, ' seller delte +++++++++++++++++++++++++++++++++++++++++++++')
          }
        } else {
          console.log('not exist----------------------------')
        }
        console.log(sType.name + ' &&&& ' + i, "    ~ seller Type")
      }
    }
    console.log('Completed----------')
    resolve()
    // res.send(sellerType)

  } catch (error) {
    console.log("🚀 ~ file: userController.js ~ line 343 ~ module.exports.deleteRecords ~ error", error)
    reject(error)
  }

})




