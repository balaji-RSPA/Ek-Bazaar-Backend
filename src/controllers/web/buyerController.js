const camelcaseKeys = require("camelcase-keys");
const axios = require("axios")
const { capitalizeFirstLetter } = require('../../utils/helpers')
const { machineIdSync } = require("node-machine-id");
const { respSuccess, respError } = require("../../utils/respHadler");
const { buyers, sellers, category, elastic, location, SMSQue } = require("../../modules");
const {
  postRFP,
  checkBuyerExistOrNot,
  addBuyer,
  getBuyer,
  updateBuyer,
  getAllBuyers,
  getRFP,
  updateBuyerPassword,
  updateRFP
} = buyers;
const { getProductByName } = category
const { sellerSearch, searchFromElastic, getSuggestions } = elastic
const { checkUserExistOrNot, updateUser, addUser, handleUserSession, addSeller, getSellerProfile } = sellers
const { getCity } = location
const { createToken, messageContent, sendSMS } = require("../../utils/utils");
const { queSMSBulkInsert, getQueSMS } = SMSQue

const { sms } = require("../../utils/globalConstants")
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

module.exports.queSmsData = async (productDetails, _loc, user, name, mobile, rfp) => {

  try {


    if (productDetails.name !== 'undefined' && productDetails.name && productDetails.name.name) {
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
      // console.log("🚀 ~ file: buyerController.js ~ line 58 ~ module.exports.queSmsData= ~ pro", pro, productDetails.name.name)
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
          parentId, productId, secondaryId, primaryId, level5Id, userId: true
        }
        const result = await sellerSearch(reqQuery);
        const Searchquery = result.query, limit = 1000
        let skip = 0, status = true, totalInsertion = 0
        const sellerIds = []
        let msg = ''

        while (status) {

          const seller = await searchFromElastic(Searchquery, { skip, limit }, result.aggs);

          if (seller[0] && seller[0].length) {

            const sellers = seller[0]
            const QueData = sellers.filter(v => v._source.sellerId.mobile && v._source.sellerId.mobile.length).map(v => {
              const sellerId = v._source.sellerId

              msg = messageContent(productDetails, _loc, name)

              totalInsertion++
              sellerIds.push(sellerId._id)

              return ({
                sellerId: sellerId._id || null,
                buyerId: user && user._id || null,
                mobile: {
                  countryCode: sellerId.mobile && sellerId.mobile.length && sellerId.mobile[0].countryCode,
                  mobile: sellerId.mobile && sellerId.mobile.length && sellerId.mobile[0].mobile,
                },
                message: msg,
                messageType: 'rfp',
                requestId: rfp._id
              })
            })

            await queSMSBulkInsert(QueData)
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


module.exports.createRFP = async (req, res) => {
  try {
    const { mobile, name, email, location, productDetails, ipAddress, requestType, sellerId } = req.body
    console.log("🚀 ~ file: buyerController.js ~ line 37 ~ module.exports.createRFP= ~ req.body", req.body)
    const user = await checkUserExistOrNot({ mobile: mobile.mobile })
    console.log("~ user", user, productDetails)
    if (user && user.length) {
      // const range = {
      //   skip: 0,
      //   limit: 5,
      // };
      // const productResult = await getProductByName({name: productDetails.name})
      // const searchQuery = await sellerSearch({productId: productResult._id})
      // const { query } = searchQuery;
      // const seller = await searchFromElastic(query, range);
      // const resp = {
      //   total: seller[1],
      //   data: seller[0],
      // };
      // seller[0].map((sell) => {
      //   console.log(sell._source.email, '---------')
      // })
      // console.log("productResult", resp)

      const userData = {
        name,
        email,
      }
      const user = await updateUser({ mobile: mobile.mobile }, userData)
      const buyerData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        location,
        userId: user._id
      }
      const exist = await checkBuyerExistOrNot({ mobile: mobile.mobile })
      let buyer
      if (exist && exist.length)
        buyer = await updateBuyer({ userId: user._id }, buyerData)
      else
        buyer = await addBuyer(buyerData)
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

      if (sellerId && requestType === 1 && global.environment === "production") {
        const sellerData = await getSellerProfile(sellerId)
        const constsellerContactNo = sellerData && sellerData.length && sellerData[0].mobile.length ? sellerData[0].mobile[0] : ''
        if (constsellerContactNo && constsellerContactNo.mobile) {
          console.log('message sending...........')
          const response = await sendSMS(constsellerContactNo.mobile, messageContent(productDetails, _loc, name))
          // const url = "https://api.ekbazaar.com/api/v1/sendOTP"
          // const resp = await axios.post(url, {
          //   mobile: constsellerContactNo.mobile,
          //   message: messageContent(productDetails, _loc, name)
          // })

        }
      } else if (!sellerId && requestType === 2) {

        this.queSmsData(productDetails, _loc, user, name, mobile, rfp)

      }
      respSuccess(res, "Your requirement has successfully submitted")
    } else {
      console.log(' not register buyer-----------------')
      const userData = {
        name,
        email,
        mobile: mobile.mobile,
        countryCode: mobile.countryCode,
        password: null
      }
      const user = await addUser(userData)
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
        const deviceId = machineIdSync();
        const userAgent = getUserAgent(req.useragent)
        const token = createToken(deviceId, { userId: buyer.userId });
        const finalData = {
          userAgent,
          userId: buyer.userId,
          token,
          deviceId,
          ipAddress: ipAddress || null
        }

        const result1 = await handleUserSession(user._id, finalData)
        const rfp = await postRFP(rfpData)

        if (sellerId && requestType === 1 && global.environment === "production") {
          const sellerData = await getSellerProfile(sellerId)
          const locationDetails = await getCity({ _id: location.city })
          const constsellerContactNo = sellerData && sellerData.length && sellerData[0].mobile.length ? sellerData[0].mobile[0] : ''
          const _loc = locationDetails ? `${capitalizeFirstLetter(locationDetails.name)}, ${locationDetails.state && capitalizeFirstLetter(locationDetails.state.name)}` : ''
          if (constsellerContactNo && constsellerContactNo.mobile) {
            console.log('message sending...........')
            const response = await sendSMS(constsellerContactNo.mobile, messageContent(productDetails, _loc, name))
            // const url = "https://api.ekbazaar.com/api/v1/sendOTP"
            // const resp = await axios.post(url, {
            //   mobile: constsellerContactNo.mobile,
            //   message: messageContent(productDetails, _loc, name)
            // })

          }
        } else if (!sellerId && requestType === 2) {

          this.queSmsData(productDetails, _loc, user, name, mobile, rfp)

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
      userID
    } = req;
    // const {
    //   sellerId
    // } = req.params;
    const RFP = await getRFP({
      sellerId: userID
    });
    respSuccess(res, RFP);
  } catch (error) {
    respError(res, error.message);
  }
};
