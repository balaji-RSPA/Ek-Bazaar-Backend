const camelcaseKeys = require("camelcase-keys");
const axios = require("axios")
const { capitalizeFirstLetter } = require('../../utils/helpers')
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { buyers, sellers, category, elastic, location, SMSQue, QueEmails } = require("../../modules");
const {RfpEnquirySend,RfpEnquiryReceived} = require('../../utils/templates/emailTemplate/emailTemplateContent');
const { commonTemplate } = require('../../utils/templates/emailTemplate/emailTemplate');
const moment = require('moment');
const {
  postRFP,
  checkBuyerExistOrNot,
  addBuyer,
  getBuyer,
  updateBuyer,
  getAllBuyers,
  getRFPData,
  getRFP,
  updateBuyerPassword,
  updateRFP
} = buyers;
const {
  sendSingleMail
} = require('../../utils/mailgunService')
const { getProductByName } = category
const { sellerSearch, searchFromElastic, getSuggestions } = elastic
const { checkUserExistOrNot, updateUser, addUser, handleUserSession, addSeller, getSellerProfile, checkSellerExist, updateSeller } = sellers
const { getCity } = location
const { createToken, messageContent, sendSMS } = require("../../utils/utils");
const { queSMSBulkInsert, getQueSMS } = SMSQue
const { bulkInserQemails } = QueEmails;

const {ssoRedirect} = require("../../../sso-tools/checkSSORedirect")

const { sms,MailgunKeys } = require("../../utils/globalConstants")
const { RFQOneToOne,RFQOneToOneBuyer }  = require("../../utils/templates/smsTemplate/smsTemplate")
const { username, password, senderID, smsURL } = sms

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

module.exports.queSmsData = async (productDetails, _loc, user, name, mobile, rfp, url) => {

  try {
    //productDetails.name !== 'undefined' 
    if (productDetails && productDetails.name && productDetails.name.name) {
      // const query = {
      //   "term": {
      //     "name.keyword": productDetails.name
      //   }
      // }
      // let suggestions = await getSuggestions(query, {}, '', '')
      // const pro = suggestions && suggestions.length && suggestions[0] && suggestions[0].length && suggestions[0][0]._source || '';
      // console.log("🚀 ~ file: buyerController.js ~ line 50 ~ module.exports.queSmsData= ~ pro", pro)
      const pro = {
        id: productDetails.name && productDetails.name.id,
        search: productDetails.name && productDetails.name.search || ''
      }
      if (pro) {
        let parentId, productId, secondaryId, primaryId, level5Id = ''
        if (pro.search === 'level1')
          parentId = pro.id
        else if (pro.search === 'level2')
          primaryId = pro.id
        else if (pro.search === 'level3')
          secondaryId = pro.id
        else if (pro.search === 'level4')
          productId = pro.id
        else if (pro.search === 'level5')
          level5Id = pro.id
        const reqQuery = {
          parentId, productId, secondaryId, primaryId, level5Id, userId: true, findByEmail: true
        }
        const result = await sellerSearch(reqQuery);
        const Searchquery = result.query, limit = 1000
        let skip = 0, status = true, totalInsertion = 0
        const sellerIds = []
        let msg = ''
        let bdy = ''
        while (status) {
          const seller = await searchFromElastic(Searchquery, { skip, limit }, result.aggs, { "sellerId.paidSeller": "desc" });
          console.log("🚀 ~ file: buyerController.js ~ line 92 ~ module.exports.queSmsData= ~ seller", seller && seller[0].length)
          
          if (seller[0] && seller[0].length) {
            const sellers = seller[0]
            const QueData = sellers.filter(v => v._source.sellerId.mobile && v._source.sellerId.mobile.length).map(v => {
              const sellerId = v._source.sellerId
              msg = RFQOneToOne({productDetails, _loc, name})
              bdy = RfpEnquiryReceived({productDetails, _loc, name,url,sellerId : sellerId._id});

              totalInsertion++
              sellerIds.push(sellerId._id)

              return ({
                sellerId: sellerId._id || null,
                buyerId: user && user._id || null,
                userId: user && user._id || null,
                name: name,
                subject: "Product Enquiry",
                body: bdy,
                fromEmail: rfp && rfp.buyerDetails && rfp.buyerDetails.email,
                toEmail: sellerId.email,
                mobile: {
                  countryCode: sellerId.mobile && sellerId.mobile.length && sellerId.mobile[0].countryCode,
                  mobile: sellerId.mobile && sellerId.mobile.length && sellerId.mobile[0].mobile,
                },
                message: msg,
                messageType: 'rfp',
                requestId: rfp._id
              })
            })
            await bulkInserQemails(QueData)
            // await queSMSBulkInsert(QueData)
            skip += limit

          } else status = false

        } if (!status) {
          console.log('No matching seller products--------------------------')
        }

        if (sellerIds && sellerIds.length) {
          await updateRFP({ _id: rfp._id }, { sellerId: sellerIds, totalCount: totalInsertion, message: msg })
        }
        console.log(" SMS count", totalInsertion)
      } else {
        console.log(' product not matching---------------')
      }
    }

    return true

  } catch (error) {
    console.log(error)

  }

}


module.exports.createRFP = async (req, res, next) => {
  try {
    const { mobile, name, email, location, productDetails, ipAddress, requestType, sellerId, user, __user } = req.body
    console.log("🚀 ~ file: buyerController.js ~ line 37 ~ module.exports.createRFP= ~ req.body", req.body)
    // const user = await checkUserExistOrNot({ mobile: mobile.mobile })
    const url = req.get('origin');
    if (user && user.length) {

      const userData = {
        name,
        email,
      }
      // const user = await updateUser({ mobile: mobile.mobile }, userData)
      const buyerData = {
        name: user[0]["name"],
        email: user[0]["email"],
        mobile: user[0]["mobile"],
        countryCode: user[0]["countryCode"],
        location,
        userId: user[0]._id
      }
      const exist = await checkBuyerExistOrNot({ mobile: mobile.mobile })
      if(exist && exist.length && exist[0].deactivateAccount && exist[0].deactivateAccount.status){
        return respError(res, " User Account Deactivated")
      }
      let buyer
      if (exist && exist.length) {
        buyer = exist[0]
        console.log()
      }
      else
        buyer = await addBuyer(buyerData)

      const sellerData = {
        // name,
        email: email || null,
        // mobile,
        location,
        // sellerType: serviceType,
        // userId: user._id,
      };

      // const sellerExist = await checkSellerExist({ userId: user._id })
      // if (sellerExist && sellerExist !== '')
      //   await updateSeller({ userId: user._id }, sellerData)

      const rfpData = {
        buyerId: buyer._id,
        buyerDetails: {
          name,
          email,
          mobile: mobile.mobile,
          location,
          sellerId: sellerId || null
        },
        productDetails,
        requestType,
        sellerId: sellerId || null
      }
      const rfp = await postRFP(rfpData)
      const locationDetails = await getCity({ _id: location.city })
      const _loc = locationDetails ? `${capitalizeFirstLetter(locationDetails.name)}, ${locationDetails.state && capitalizeFirstLetter(locationDetails.state.name)}` : ''
      const sellerDtl = await getSellerProfile(sellerId);
      if (sellerDtl && sellerDtl.length && sellerDtl[0].email && requestType === 1 && email) {
        // const message = {
        //   from: email,
        //   to: sellerDtl[0].email,
        //   subject: 'Product Enquiry',
        //   html: `<p>Somebody has enquired about the product</p>`
        // }
        // await sendSingleMail(message)
        await sendEmailSeller({
          buyerEmail: email,
          sellerEmail: sellerDtl[0].email,
           sellerId: sellerDtl[0]._id,
           url : url,
          _loc,
          productDetails,
          name
        })
        await sendEmailBuyer(email)
      }
      if (sellerDtl && sellerDtl.length && requestType === 1 && global.environment === "production") {
        const sellerData = await getSellerProfile(sellerId)
        console.log("🚀 ~ file: buyerController.js ~ line 238 ~ module.exports.createRFP= ~ sellerData", sellerData)
        // const constsellerContactNo = sellerDtl && sellerData.length && sellerData[0].mobile.length ? sellerData[0].mobile[0] : ''
        const constsellerContactNo = sellerData[0].mobile.length ? sellerData[0].mobile[0] : ''
        console.log("🚀 ~ file: buyerController.js ~ line 240 ~ module.exports.createRFP= ~ constsellerContactNo", constsellerContactNo)
        if (constsellerContactNo && constsellerContactNo.mobile) {
          console.log('message sending...........')
          let _resp = await sendSMS(constsellerContactNo.mobile, RFQOneToOne({ productDetails, _loc, name }))
          console.log("🚀 ~ file: buyerController.js ~ line 244 ~ module.exports.createRFP= ~ _resp", _resp)
          // await sendSMS(mobile.mobile, RFQOneToOneBuyer())
        } else {
          console.log(' no seller contact number')
        }
      } else if (!sellerId && requestType === 2) {
        this.queSmsData(productDetails, _loc, user, name, mobile, rfp, url)
        await sendEmailBuyer(email)
        // const message = {
        //   from: MailgunKeys.senderMail,
        //   to: email,
        //   subject: 'Product Enquiry',
        //   html: `<p>This is confirmation that your enquiry has been successfully send to the seller.</p>`
        // }
        // await sendSingleMail(message)
        // await sendSMS(mobile, RFQOneToOneBuyer())

        if (global.environment === "production")
          await sendSMS(mobile.mobile, RFQOneToOneBuyer())
      } else {
        console.log(' Single contact beta user exist------------')
      }
      respSuccess(res, "Your requirement has successfully submitted")
    } else {
      console.log(' not register buyer-----------------')
      // const userData = {
      //   name,
      //   email,
      //   mobile: mobile.mobile,
      //   countryCode: mobile.countryCode,
      //   password: null
      // }
      const user = __user//await addUser(userData)
      const buyerData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        location,
        userId: user._id
      }
      const buyer = await addBuyer(buyerData)

      const sellerData = {
        name,
        email: email || null,
        mobile,
        location,
        // sellerType: serviceType,
        userId: user._id,
      };
      const seller = await addSeller(sellerData);

      const rfpData = {
        buyerId: buyer._id,
        buyerDetails: {
          name,
          email,
          mobile: mobile.mobile,
          location
        },
        productDetails,
        requestType,
        sellerId: sellerId || null
      }

      if (buyer && seller) {

        const data = {
          url: req.body.url
        }
        if (data.url) {
          const ssoToken = data.url.substring(data.url.indexOf("=") + 1)
          // req.session.ssoToken = ssoToken
          req.query = {
            ssoToken: ssoToken
          }
        }
        const response = await ssoRedirect(req, res, next)
        console.log("🚀 ~ file: buyerController.js ~ line 319 ~ module.exports.createRFP= ~ response", response)
        const _user = response.user
        console.log("🚀 ~ file: buyerController.js ~ line 320 ~ module.exports.createRFP= ~ _user", _user)
        const { token } = response

        const deviceId = _user.deviceId;
        const userAgent = getUserAgent(req.useragent)
        // const token = createToken(deviceId, { userId: buyer.userId });
        const finalData = {
          userAgent,
          userId: buyer.userId,
          token,
          deviceId,
          ipAddress: ipAddress || null
        }

        const result1 = await handleUserSession(user._id, finalData)
        const rfp = await postRFP(rfpData)

        const locationDetails = await getCity({ _id: location.city })
        const _loc = locationDetails ? `${capitalizeFirstLetter(locationDetails.name)}, ${locationDetails.state && capitalizeFirstLetter(locationDetails.state.name)}` : ''
        const sellerDtl = await getSellerProfile(sellerId)
        if (sellerDtl && sellerDtl.length && sellerDtl[0].email && requestType === 1 && email) {
          // const message = {
          //   from: email,
          //   to: sellerDtl[0].email,
          //   subject: 'Product Enquiry',
          //   html: `<p>Somebody has enquired about the product</p>`
          // }
          // await sendSingleMail(message)
          await sendEmailSeller({
            buyerEmail: email,
            sellerEmail: sellerDtl[0].email,
            sellerId: sellerDtl[0]._id,
            url: url,
            _loc,
            productDetails,
            name
          })
          await sendEmailBuyer(email)
        }
        if (sellerDtl && sellerDtl.length && requestType === 1 && global.environment === "production") {
          // const sellerData = await getSellerProfile(sellerId)
          const constsellerContactNo = sellerDtl && sellerDtl.length && sellerDtl[0].mobile.length ? sellerDtl[0].mobile[0] : ''
          if (constsellerContactNo && constsellerContactNo.mobile) {
            console.log('message sending...........')
            await sendSMS(constsellerContactNo.mobile, RFQOneToOne({ productDetails, _loc, name }))
            await sendSMS(mobile.mobile, RFQOneToOneBuyer())

          }
        } else if (!sellerId && requestType === 2) {

         this.queSmsData(productDetails, _loc, user, name, mobile, rfp, url )
         await sendEmailBuyer(email)
        // const message = {
        //   from: MailgunKeys.senderMail,
        //   to: email,
        //   subject: 'Product Enquiry',
        //   html: `<p>This is confirmation that your enquiry has been successfully send to the seller.</p>`
        // }
        // await sendSingleMail(message)
        //  await sendSMS(mobile, RFQOneToOneBuyer())
          // this.queSmsData(productDetails, _loc, user, name, mobile, rfp)
          if (global.environment === "production") {
            const resp = await sendSMS(mobile.mobile, RFQOneToOneBuyer())
            console.log("sent meassage response", resp)
          }
        } else {
          console.log(' Single contact beta------------')
        }

        respSuccess(res, { token, buyer, seller }, "Your requirement has successfully submitted.")
      }
    }

  } catch (error) {
    console.log(error)
    respError(res, error.message)
  }
}

module.exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const buyer = await checkBuyerExistOrNot(mobile);
    if (buyer) {
      respError(res, "A buyer with this number already exist");
    }
    const otp = 1234;
    respSuccess(res, { otp });
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.verifyBuyerMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const { buyerID } = req;
    const buyer = await updateBuyer(buyerID, { isPhoneVerified: true });
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.addBuyer = async (req, res) => {
  try {
    const { ipAddress } = req.body;
    req.body.isPhoneVerified = true;
    const buyer = await addBuyer(req.body);
    if (buyer) {
      const deviceId = machineIdSync();
      // const userAgent = getUserAgent(req.useragent)
      const token = createToken(deviceId, { buyerId: buyer._id });
      // const finalData = {
      //   userAgent,
      //   buyerId: buyer._id,
      //   token,
      //   deviceId,
      //   ipAddress
      // }

      // const result1 = await handleUserSession(data._id, finalData)
      return respSuccess(res, { token, buyer }, "Auth Success");
    }
    return respError(res, "Buyer not added");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getBuyer = async (req, res) => {
  try {
    const { buyerID } = req;
    const buyer = await getBuyer(buyerID);
    respSuccess(res, buyer);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateBuyer = async (req, res) => {
  console.log("update buyer---------------------")
  try {
    // const { buyerID } = req;
    const { userID } = req
    // const { buyerNotifications } = req.body
    // console.log(userID,  req.body, ' test------')
    const buyer = await updateBuyer({ userId: userID }, req.body);
    respSuccess(res, 'Updated Successfully');
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllBuyers = async (req, res) => {
  try {
    const buyers = await getAllBuyers();
    respSuccess(res, buyers);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateBuyerPassword = async (req, res) => {
  try {
    const { mobile } = req.body;
    const seller = await updateSellerPassword(mobile, req.body);
    respSuccess(res, seller);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * get RFPs
 */
module.exports.getRFPS = async (req, res) => {
  try {
    const {
      userID,
      params
    } = req;
    let obj = {
      skip: parseInt(params.skip),
      limit: parseInt(params.limit)
    }
    let condition = {$and: [{sellerId: params.SellerId},{requestType: 1}]}
    const RFP = await getRFPData(condition, obj);
    let totalCount = await getRFP(condition);
    totalCount = totalCount.length;
    respSuccess(res, {
      RFP,
      totalCount
    });
  } catch (error) {
    respError(res, error.message);
  }
};

async function sendEmailBuyer(email){
  let messagecontent = RfpEnquirySend();
  const message = {
    from: MailgunKeys.senderMail,
    to: email,
    subject: 'Product Enquiry',
    html: commonTemplate(messagecontent)
  }
  await sendSingleMail(message)
}
async function sendEmailSeller(params){
 let messagecontent = RfpEnquiryReceived(params);
 const message = {
   from: params.buyerEmail,
   to: params.sellerEmail,
   subject: 'Product Enquiry',
   html: commonTemplate(messagecontent)
 }
  await sendSingleMail(message)
}
// module.exports.queEmailData = async(productDetails,loc,user, name, mobile, rfp) => {
//   let emailParams = {};
//   try {
//     emailParams.userId = user && user._id;
//     emailParams.sellerId = rfp && rfp.sellerId;
//     emailParams.name = name;
//     emailParams.subject = "Product Enquiry";
//     emailParams.body = "Need more details about product";
//     emailParams.fromEmail = rfp && rfp.buyerDetails && rfp.buyerDetails.email;
//     emailParams.toEmail ="";
//     emailParams.type ="rfp";

//   }catch(err){
//      console.log(error)
//   }     
// }
