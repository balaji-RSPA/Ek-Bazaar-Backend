const Papa = require('papaparse')
const _fs = require('fs')
const fs = require('fs').promises
const path = require("path");
const _ = require('lodash');
const moment = require("moment");
const { Sellers } = require('../models')
const { sellers, mastercollections, sellerProducts, SMSQue, buyers, SellerPlans, QueEmails } = require('../modules')
const { getAllSellers, getUpdatedSellerDetails, getSellerProductDetails, addProductDetails, getSellerAllDetails } = sellers
const { updateMaster } = mastercollections
const { getSellerProducts, updateSellerProducts } = sellerProducts
const { getQueSMS, updateQueSMS, queSMSBulkInsert } = SMSQue
const { getRFPData, updateRFP } = buyers
const { bulkInserQemails, getQueEmail, updateQueEmails } = QueEmails
const { getExpirePlans, updateSellerPlans, getAboutToexpirePlan } = SellerPlans
const { sendSMS, sendBulkSMS } = require('../utils/utils')
const { planExpiry } = require('../utils/templates/smsTemplate/smsTemplate');
const { commonTemplate } = require('../utils/templates/emailTemplate/emailTemplate');
const { planExpired, planExpiring } = require('../utils/templates/emailTemplate/emailTemplateContent');
const {
    MailgunKeys
} = require("../utils/globalConstants");
const Logger = require('../utils/logger');
const { sendSingleMail } = require('../utils/mailgunService')
const { globalVaraibles } = require('../utils/utils')
const { searchFromElastic } = require('../modules/elasticSearchModule')
const isProd = globalVaraibles._IS_PROD_
const { pricing } = globalVaraibles.authServiceURL()


exports.sendQueEmails = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        const result = await getQueEmail({ isSent: false }, 0, 20)
        const updateIds = []
        if (result && result.length) {

            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                let message
                updateIds.push(element._id)
                // if (element.messageType === 'plan_expiry' || element.messageType === 'plan expiry'){
                // //    let expiryMessage = planExpired({date : element.createdAt,url:url});
                //     message = {
                //         subject: element.subject,
                //         html: commonTemplate(element.body),
                //         from: element.fromEmail,
                //         to: element.toEmail
                //     }
                // } else if (element.messageType === 'plan_abt_expire') {
                //     let expiringMessage = planExpiring({date : element.createdAt,url:url});
                //     message = {
                //         subject: element.subject,
                //         html: commonTemplate(expiringMessage),
                //         from: element.fromEmail,
                //         to: element.toEmail
                //     }
                // }else{
                message = {
                    subject: element.subject,
                    html: commonTemplate(element.body),
                    from: element.fromEmail,
                    to: element.toEmail
                }
                // }
                if (element.toEmail && element.fromEmail)
                    await sendSingleMail(message)
            }
            if (updateIds && updateIds.length)
                await updateQueEmails({ _id: { $in: updateIds } }, { isSent: true })
            console.log(updateIds, ' ------------------ Que Emails sent ----------- ')
        } else {
            console.log(' ---------- No Que Emails to send ------------------')
        }
        resolve()

    } catch (error) {
        console.log(error)
        reject(error)
    }

})


exports.getExpirePlansCron = async (req, res) =>
    new Promise(async (resolve, reject) => {
        try {
            console.log('expired plans')
            // const start = moment().startOf("day");
            // const end = moment(start).endOf("day");
            const sellerPlanIds = []
            const emailData = []
            // const smsData = []
            //  let url = '';
            //  if (process.env.NODE_ENV === "production") {
            //      url = `https://www.trade.ebazaar.com/pricing`
            //  } else if (process.env.NODE_ENV === 'development') {
            //      url = `http://localhost:8085/pricing`
            //  } else if (process.env.NODE_ENV === 'staging') {
            //      url = `https://tradebazaar.tech-active.com/pricing`
            //  }
            const result = await getExpirePlans();
            if (result.length > 0) {
                for (let index = 0; index < result.length; index++) {
                    const element = result[index];
                    sellerPlanIds.push(element._id)
                    // if (element && element.sellerId && element.sellerId.mobile && element.sellerId.mobile.length && element.sellerId.mobile[0]) {
                    //     const data2 = {
                    //        sellerId: element._id,
                    //        requestId: element._id,
                    //         mobile:{
                    //             mobile:element.sellerId.mobile[0].mobile, 
                    //             countryCode:element.sellerId.mobile[0].countryCode 
                    //         },
                    //         message: planExpiry(element.exprireDate),
                    //         messageType: "plan_expiry",
                    //     }
                    //     smsData.push(data2);
                    // }
                    // `Hi ${element.sellerId.name}<br/>We hope you have been enjoyed your plan.<br/>Unfortunately, your plan has expired.<br/>-- The Ekbazaar Team`,
                    if (element && element.sellerId && element.sellerId.email) {
                        const data = {
                            messageType: "plan_expiry",
                            sellerId: element._id,
                            userId: element.sellerId.userId,
                            fromEmail: MailgunKeys.senderMail,
                            toEmail: element.sellerId.email,
                            name: element.sellerId.name,
                            subject: "Plan Expired",
                            body: planExpired({ date: element.exprireDate, isTrial: element.isTrial, url: pricing })
                        };

                        emailData.push(data)
                        console.log(emailData, ' email')
                        console.log(sellerPlanIds, ' ids')
                    }
                }
                // await queSMSBulkInsert(smsData)
                await bulkInserQemails(emailData)
                await updateSellerPlans({ _id: { $in: sellerPlanIds } }, { expireStatus: true })

                console.log("expire plans inserted successfully");
                resolve("done");
            } else {
                console.log("Plan no records found");
                resolve("done");
            }
        } catch (error) {
            console.log(error, " catche ------------");
            reject(error);
        }
    });

exports.sendQueSms = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        const updateIds = []
        // const result = await getQueSMS({ status: true }, { skip: 0, limit: 10 })
        const result = await getRFPData({ status: true }, { skip: 0, limit: 1 })
        if (result && result.length) {
            const limit = 100
            const message = result[0].message
            const queSms = await getQueSMS({ status: true, messageType: "rfp", requestId: result[0]._id }, { skip: 0, limit: 100 })
            if (queSms && queSms.length) {


                let mobile = queSms && queSms.map((v) => {
                    updateIds.push(v._id)
                    return (v.mobile.mobile)
                }).toString()
                // mobile = '9916905753,9916905753'
                await sendBulkSMS(mobile, message)

                if (updateIds && updateIds.length) {
                    await updateQueSMS({ _id: { $in: updateIds } }, { status: false })
                    console.log('-----------  SMS QUE Ids UPDATED ----------------')
                }
                if (queSms.length < limit) {
                    await updateRFP({ _id: result[0]._id }, { status: false })
                    console.log('------------- RFP Updated -------------')
                }
            } else {
                await updateRFP({ _id: result[0]._id }, { status: false })
                console.log('------------- RFP Updated Else-------------')
            }

        } else {
            console.log(' --------------- NO RFP SMS IN QUEUE ----------------------')
        }
        resolve()

    } catch (error) {
        console.log(error)
        reject()

    }

})

const masterMapData = (val, type) => new Promise((resolve, reject) => {
    const _Scity = [];
    let serviceProductData;
    if (val.serviceCity && val.serviceCity.length) {
        // delete val.serviceCity._id
        serviceProductData = _.map(val.serviceCity, function (c) {
            return _.omit(c, ['region', '_id']);
        });
    }
    val.serviceCity && val.serviceCity.length && val.serviceCity.map((v) => {
        _Scity.push(v.city && v.city.name.toLowerCase())
        _Scity.push(v.state && v.state.name.toLowerCase())
        _Scity.push(v.country && v.country.name.toLowerCase())
        _Scity.push(v.region && v.region.toLowerCase())
    })
    if (val.sellerId && val.sellerId.location) {
        delete val.sellerId.location.city
        console.log(val.sellerId.location.city, 'location deletttttttttttttttttttt')
    }

    let keywords = []
    keywords.push(val.sellerId.name.toLowerCase())
    keywords.push(val.serviceType && val.serviceType.name.toLowerCase())
    keywords.push(val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId[0].name.toLowerCase())
    keywords.push(val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId[0].name.toLowerCase())
    keywords.push(val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId[0].name.toLowerCase())
    keywords.push(val.poductId && val.poductId.length && val.poductId[0].name.toLowerCase())
    keywords.push(val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId[0].name.toLowerCase())
    keywords.push(val.productDetails && val.productDetails.name.toLowerCase())
    keywords.push(val.productDetails && val.productDetails.productDescription && val.productDetails.productDescription.toLowerCase())
    keywords.push(..._Scity)

    keywords = _.without(_.uniq(keywords), '', null, undefined, 0)
    let data;
    if (type === "update") {
        data = {
            productDetails: val.productDetails && val.productDetails || null,
            status: val.status || true,
            batch: 1,
            keywords,
            serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
        }

    } else {
        data = {
            sellerId: val.sellerId && {
                location: val.sellerId && val.sellerId.location || null,
                name: val.sellerId && val.sellerId.name || null,
                email: val.sellerId && val.sellerId.email || null,

                sellerType: val.sellerId && val.sellerId.sellerType && val.sellerId.sellerType.length && {
                    _id: val.sellerId.sellerType[0]._id,
                    name: val.sellerId.sellerType[0].name
                } || null,

                _id: val.sellerId && val.sellerId._id || null,
                mobile: val.sellerId && val.sellerId.mobile || null,
                website: val.sellerId.website || null,
                isEmailVerified: val.sellerId.isEmailVerified || false,
                isPhoneVerified: val.sellerId.isPhoneVerified || false,
                sellerVerified: val.sellerId.sellerVerified || false,
                paidSeller: val.sellerId.paidSeller || false,
                international: val.sellerId.international || false,
                deactivateAccount: val.sellerId.deactivateAccount && val.sellerId.deactivateAccount.status || false,
                businessName: val.sellerId.busenessId && val.sellerId.busenessId.name || null
            } || null,
            userId: val.sellerId && val.sellerId.userId && {
                name: val.sellerId.name || null,
                _id: val.sellerId.userId
            } || null,
            productDetails: val.productDetails && val.productDetails || null,
            status: val.status || true,
            batch: 1,
            keywords,
            serviceType: val.serviceType && {
                _id: val.serviceType._id,
                name: val.serviceType.name
            } || null,
            parentCategoryId: val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId || null,
            primaryCategoryId: val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId || null,
            secondaryCategoryId: val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId || null,
            poductId: val.poductId && val.poductId.length && val.poductId || null,
            productSubcategoryId: val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId || null,
            // serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
            serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
        }

    }

    // if (type === 'insert') {
    //     data = {
    //         ...data,
    //         _id: val._id
    //     }
    // }
    resolve(data)

})

exports.updateSelleProfileChangesToProducts = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log(' updates eller------')
        const result = await getUpdatedSellerDetails({ profileUpdate: true }, 0, 1)
        console.log("🚀 ~ file: cron.js ~ line 153 ~ exports.updateSelleProfileChangesToProducts= ~ result", result)
        for (let index = 0; index < result.length; index++) {
            const seller = result[index];
            // const products = seller.sellerProductId
            const products = await getSellerProductDetails({ _id: { $in: seller.sellerProductId } })

            console.log("🚀 ~ file: cron.js ~ line 12 ~ exports.updateSelleProfileChangesToProducts= ~ result", JSON.stringify(products))
            for (let i = 0; i < products.length; i++) {
                const pro = products[index];

                const formateData = await masterMapData(pro, 'insert')
                // const updateResult = await addProductDetails({ _id: pro._id }, { keywords: formateData.keywords })
                // const masResult = await updateMaster({ _id: pro._id }, { sellerId: formateData.sellerId })
                console.log("🚀 ~ file: cron.js ~ line 115 ~ exports.updateSelleProfileChangesToProducts= ~ formateData", JSON.stringify(formateData))
            }


        }

    } catch (error) {
        console.log(error, ' error')

    }

})

exports.getAboutToExpirePlan = async (req, res) => {

    try {
        const emailData = []
        const smsData = []
        // let url = '';
        // if (process.env.NODE_ENV === "production") {
        //     url = `https://ekbazaar.tech-active.com`
        // } else if (process.env.NODE_ENV === 'development') {
        //     url = `http://localhost:8085`
        // } else if (process.env.NODE_ENV === 'staging') {
        //     url = `http://ekbazaar.tech-active.com`
        // }
        const result = await getAboutToexpirePlan();
        for (let index = 0; index < (result && result.length); index++) {
            const element = result[index];
            if (element && element.sellerId && element.sellerId.mobile && element.sellerId.mobile.length && element.sellerId.mobile[0]) {
                const data2 = {
                    sellerId: element._id,
                    requestId: element._id,
                    mobile: {
                        mobile: element.sellerId.mobile[0].mobile,
                        countryCode: element.sellerId.mobile[0].countryCode
                    },
                    message: planExpiry(element.exprireDate),
                    messageType: "plan_abt_expire",
                }
                smsData.push(data2);
            }
            if (element && element.sellerId && element.sellerId.email) {
                const date1 = moment(new Date(), 'DD/MM/YYYY');
                const date2 = moment(new Date(element.exprireDate), 'DD/MM/YYYY');
                const dayDiff = date2.diff(date1, 'days');
                const data = {
                    messageType: "plan_abt_expire",
                    sellerId: element._id,
                    userId: element.sellerId.userId,
                    fromEmail: MailgunKeys.senderMail,
                    toEmail: element.sellerId.email,
                    name: element.sellerId.name,
                    subject: "Plan About To Expire",
                    body: planExpiring({ date: element.exprireDate, isTrial: element.isTrial, url: pricing, dayDiff }),
                };
                emailData.push(data)
            }
        }
        if (emailData.length) {
            await bulkInserQemails(emailData)
        }
        if (smsData.length) {
            await queSMSBulkInsert(smsData)
        }
    } catch (error) {
        console.log("About to expire plan error:", error)
    }
}

exports.updateKeywords = async (req, res) => new Promise(async (resolve, reject) => {

    // try {
    //     const date1 = new Date(1610409601000).toISOString()
    //     console.log('keywords-------------', new Date(1610409601000).toISOString())
    //     const data = await getSellerProducts({ flag: 0, createdAt: { $lt: date1 } }, 0, 1000)
    //     console.log(data.length, ' ---- Prodoct count')
    //     // console.log("🚀 ~ file: cron.js ~ line 145 ~ exports.updateKeywords= ~ data", JSON.stringify(data))
    //     const updateIds = []
    //     if (data.length) {

    //         for (let index = 0; index < data.length; index++) {
    //             const product = data[index];
    //             let keywords = product.keywords
    //             let _Scity = product.keywords
    //             if (product.serviceCity && product.serviceCity.length) {
    //                 // console.log(product.serviceCity, ' tttttttttt')
    //                 product.serviceCity.map((v) => {
    //                     const alea = v.city && v.city.alias && v.city.alias.length && v.city.alias.map((al) => al.toLowerCase()) || null
    //                     if (alea && alea.length) {
    //                         // console.log(product._id)
    //                         _Scity.push(...alea)
    //                     }
    //                     // console.log(alea, ' -------------')
    //                     _Scity.push(v.city && v.city.name.toLowerCase())
    //                     _Scity.push(v.state && v.state.name.toLowerCase())
    //                     _Scity.push(v.country && v.country.name.toLowerCase())
    //                     _Scity.push(v.state && v.state.region && v.state.region.toLowerCase())
    //                 })
    //                 _Scity = _.without(_.uniq(_Scity), '', null, undefined, 0)
    //                 console.log(_Scity, ' Keywords----------------')


    //                 const updateResult = await addProductDetails({ _id: product._id }, { keywords: _Scity })
    //                 const masResult = await updateMaster({ _id: product._id }, { keywords: _Scity })

    //             }
    //             updateIds.push(product._id)
    //             console.log(' running count ---- ', index)
    //         }

    //         if (updateIds.length) {

    //             const updateResult = await updateSellerProducts({ _id: { $in: updateIds } }, { flag: 2 })
    //             console.log(updateIds, ' -------update query------')
    //         }
    //     } else {

    //         console.log('----- No Products to update keywords ----------')

    //     }
    //     console.log('---------Completed mapping--------------')
    //     resolve()

    // } catch (error) {
    //     console.log(error)
    // }

})

exports.sendDailyCount = async (req, res) => new Promise(async (resolve, reject) => {
    try {
        console.log(' email count started ------------')
        const query = {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "offers"
                        }
                    }
                ]
            }
        }

        const query_daily_offers = {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "offers"
                        }
                    },
                    {
                        "range": {
                            // "offers.validity.toDate": {
                            //     // "gte": new Date().toISOString()
                            //     "gte": new Date(moment.utc().startOf('day'))
                            // }
                            "offers.createdAt": {
                                "gte": new Date(moment.utc().subtract(1, 'day').startOf('day'))
                            }
                        }
                    }
                ]
            }
        }

        const aggs = {
            "aggs": {
                "level1": {
                    "terms": {
                        "field": "parentCategoryId._id.keyword"
                    },
                    "aggs": {
                        "level2": {
                            "terms": {
                                "field": "primaryCategoryId._id.keyword"
                            },
                            "aggs": {
                                "level3": {
                                    "terms": {
                                        "field": "secondaryCategoryId._id.keyword"
                                    },
                                    "aggs": {
                                        "level4": {
                                            "terms": {
                                                "field": "poductId._id.keyword"
                                            },
                                            "aggs": {
                                                "level5": {
                                                    "terms": {
                                                        "field": "productSubcategoryId._id.keyword"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const totalOffers = await searchFromElastic(query, { skip: 0, limit: 10 }, aggs);
        let totalOfferCount = totalOffers && totalOffers.length && totalOffers[1] || 0;

        const dailyOffers = await searchFromElastic(query_daily_offers, { skip: 0, limit: 10 }, aggs);
        let dailyOffersCoount = dailyOffers && dailyOffers.length && dailyOffers[1] || 0

        console.log("🚀 offers count: ", totalOfferCount, dailyOffersCoount)

        let sellerrawData = []
        const registerdate = new Date(moment('2021-07-16').startOf('day')).toISOString()
        const date = new Date(moment().startOf('day')).toISOString()

        const dateyesterday = new Date(moment.utc().subtract(1, 'day').startOf('day')).toISOString()
        const _dateyesterday = dateyesterday.substring(0, dateyesterday.indexOf('T'))
        // return true
        const totalSellerCount = await Sellers.find({ $and: [/* { sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { $where: "this.sellerProductId.length > 0" }, */ { userId: { $ne: null } }], createdAt: { $gte: registerdate, $lt: date } }).count().exec()

        const totalRegisteredSellers = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { $where: "this.sellerProductId.length > 0" }, { userId: { $ne: null } }], createdAt: { $gte: registerdate, $lt: date } }).count().exec()

        console.log("🚀 ~ file: cron.js ~ line 452 ~ exports.sendDailyCount= ~ totalSellerCount", totalSellerCount, totalRegisteredSellers)

        // const yesterdayTotalBuyerCount = await Sellers.find({$or: [{$and: [{sellerProductId: {$exists: true}}, {$where: "this.sellerProductId.length < 1"}]},{sellerProductId: {$exists: false}}, { sellerProductId : null }], name: {$exists: true}, createdAt: {$gte: registerdate, $lt: date}}).exec()
        // console.log("🚀 ~ file: cron.js ~ line 453 ~ exports.sendDailyCount= ~ yesterdayTotalBuyerCount", yesterdayTotalBuyerCount.length)

        // const yesterdayTotalCount = await Sellers.find({ createdAt: { $gte: registerdate, $lt: date }, name: { $exists: true }, userId: { $ne: null } }).exec()

        // console.log("🚀 ~ file: cron.js ~ line 456 ~ exports.sendDailyCount= ~ yesterdayTotalCount", yesterdayTotalCount.length, registerdate, date)

        // const yesterdayTotalBuyerCount = yesterdayTotalCount.length - totalSellerCount.length
        const incompletSellerCount = totalSellerCount - totalRegisteredSellers
        console.log("🚀 ~ file: cron.js ~ line 472 ~ exports.sendDailyCount= ~ incompletSellerCount", incompletSellerCount)
        // return true

        const selectFileds = 'name busenessId.name mobile hearingSource hearingSource email website createdAt sellerProductId'

        let source = ["GCC", "SMEC", "Paper Ads", "Online Ads", "Social Media", "From a Friend", "Desh Aur Vyapar", "Tamil Nadu", "Uttar Pradesh"]

        // const gcc_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */  { "hearingSource.source": "Gujarat Chamber of Commerce" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').populate({}).select(selectFileds).lean().exec()

        const gcc_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */  { "hearingSource.source": "Gujarat Chamber of Commerce" } ], createdAt: { $gte: dateyesterday, $lt: date } })
        gcc_count && gcc_count.length && sellerrawData.push(...gcc_count)

        // const smec_ount = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "SME Chamber of India (Maharashtra)" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()
        const smec_ount = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "SME Chamber of India (Maharashtra)" }], createdAt: { $gte: dateyesterday, $lt: date } })
        smec_ount && smec_ount.length && sellerrawData.push(...smec_ount)

        // const paper_ads_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Paper Ads" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const paper_ads_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Paper Ads" }], createdAt: { $gte: dateyesterday, $lt: date } })
        paper_ads_count && paper_ads_count.length && sellerrawData.push(...paper_ads_count)

        // const online_ads_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Online Ads " }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()
        const online_ads_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Online Ads " }], createdAt: { $gte: dateyesterday, $lt: date } })
        online_ads_count && online_ads_count.length && sellerrawData.push(...online_ads_count)

        // const social_media_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Social media" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const social_media_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Social media" }], createdAt: { $gte: dateyesterday, $lt: date } })
        social_media_count && social_media_count.legth && sellerrawData.push(...social_media_count)

        // const from_a_friend_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "From a friend" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const from_a_friend_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "From a friend" }], createdAt: { $gte: dateyesterday, $lt: date } })
        from_a_friend_count && from_a_friend_count.length && sellerrawData.push(...from_a_friend_count)

        // const desh_or_vyapar_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Desh aur Vyapar Rajasthan Newspaper " }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const desh_or_vyapar_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, /* { $where: "this.sellerProductId.length > 0" },  */ { "hearingSource.source": "Desh aur Vyapar Rajasthan Newspaper " }], createdAt: { $gte: dateyesterday, $lt: date } })
        desh_or_vyapar_count && desh_or_vyapar_count.length && sellerrawData.push(...desh_or_vyapar_count)


        // const tamil_nadu_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": "Tamil Nadu" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const tamil_nadu_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": "Tamil Nadu" }], createdAt: { $gte: dateyesterday, $lt: date } })
        tamil_nadu_count && tamil_nadu_count.length && sellerrawData.push(...tamil_nadu_count)


        // const uttar_pradesh_count = await Sellers.find({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": "Uttar Pradesh" }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const uttar_pradesh_count = await getSellerAllDetails({ $and: [{ sellerProductId: { $exists: true } }, { "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": "Uttar Pradesh" }], createdAt: { $gte: dateyesterday, $lt: date } })
        uttar_pradesh_count && uttar_pradesh_count.length && sellerrawData.push(...uttar_pradesh_count)

        // const hearingSourseNull = await Sellers.find({ $and: [{ "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": null }], createdAt: { $gte: dateyesterday, $lt: date } }).populate('busenessId').populate('sellerProductId').select(selectFileds).lean().exec()

        const hearingSourseNull = await getSellerAllDetails({ $and: [{ "hearingSource.referralCode": { $exists: true } }, { "hearingSource.source": null }], createdAt: { $gte: dateyesterday, $lt: date } })
        hearingSourseNull && hearingSourseNull.length && sellerrawData.push(...hearingSourseNull)
        // console.log(JSON.stringify(sellerrawData), 'llllllllllllllllllllll')
        // return true

        sellerrawData = sellerrawData && sellerrawData.length && sellerrawData.map((v) => {
            let l1 = [], l1Id = [], l2 = [], l2Id = [], l3 = [], l3Id = [], l4 = [], l4Id = [], l5 = [], l5Id = [], pro_names = []
            const details = v.sellerProductId && v.sellerProductId.length && v.sellerProductId.map((pro) => {

                pro.parentCategoryId && pro.parentCategoryId.length && l1.push(...pro.parentCategoryId.map((v1) => v1.name))
                pro.parentCategoryId && pro.parentCategoryId.length && l1Id.push(...pro.parentCategoryId.map((v1) => v1.vendorId))

                pro.primaryCategoryId && pro.primaryCategoryId.length && l2.push(...pro.primaryCategoryId.map((v1) => v1.name))
                pro.primaryCategoryId && pro.primaryCategoryId.length && l2Id.push(...pro.primaryCategoryId.map((v1) => v1.vendorId))

                pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3.push(...pro.secondaryCategoryId.map((v1) => v1.name))
                pro.secondaryCategoryId && pro.secondaryCategoryId.length && l3Id.push(...pro.secondaryCategoryId.map((v1) => v1.vendorId))

                pro.poductId && pro.poductId.length && l4.push(...pro.poductId.map((v1) => v1.name))
                pro.poductId && pro.poductId.length && l4Id.push(...pro.poductId.map((v1) => v1.vendorId))

                pro.productSubcategoryId && pro.productSubcategoryId.length && l5.push(...pro.productSubcategoryId.map((v1) => v1.name))
                pro.productSubcategoryId && pro.productSubcategoryId.length && l5Id.push(...pro.productSubcategoryId.map((v1) => v1.vendorId))

                pro.productDetails && pro.productDetails.name && pro_names.push(pro.productDetails.name)


            }) || ''
            return {
                name: v.name && v.name || null,
                businessName: v.busenessId && v.busenessId.name || "",
                email: v.email && v.email || "",
                mobile: v.mobile && v.mobile.length && v.mobile[0] && v.mobile[0].mobile || "",
                'hearingSource.source': v.hearingSource && v.hearingSource.source || "",
                'hearingSource.referralCode': v.hearingSource && v.hearingSource.referralCode || "",
                productsCount: v.sellerProductId && v.sellerProductId.length || 0,

                sellerProductsName: _.uniq(pro_names).toString() || '',

                level1: _.uniq(l1).toString(),
                level1_ids: _.uniq(l1Id).toString(),

                level2: _.uniq(l2).toString(),
                level2_ids: _.uniq(l2Id).toString(),

                level3: _.uniq(l3).toString(),
                level3_ids: _.uniq(l3Id).toString(),

                level4: _.uniq(l4).toString(),
                level4_ids: _.uniq(l4Id).toString(),

                level5: _.uniq(l5).toString(),
                level5_ids: _.uniq(l5Id).toString(),

                createdDate: v.createdAt || '',
            }
        })
        const FilePath = `sellerDetails-${new Date()}.csv`
        const FileSource = 'public/sellerDetailFiles/' + FilePath
        if (sellerrawData.length) {

            const csv = Papa.unparse(sellerrawData, {
                quotes: false, //or array of booleans
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ",",
                header: true,
                newline: "\r\n",
                skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                columns: null, //or array of strings
            });
            fs.writeFile(path.resolve(__dirname, '../../public/sellerDetailFiles', FilePath), csv, (err, data) => {
                console.log(err, "Completed data", data)
            })
        }

        const sum = gcc_count.length + smec_ount.length + paper_ads_count.length + online_ads_count.length + social_media_count.length + from_a_friend_count.length + desh_or_vyapar_count.length + tamil_nadu_count.length + uttar_pradesh_count.length

        source = source.map((src, i) => ({ key: src, value: i == 0 ? gcc_count.length : i == 1 ? smec_ount.length : i == 2 ? paper_ads_count.length : i == 3 ? online_ads_count.length : i == 4 ? social_media_count.length : i == 5 ? from_a_friend_count.length : i == 6 ? desh_or_vyapar_count.length : i == 7 ? tamil_nadu_count.length : uttar_pradesh_count.length }))


        let elem = source.map(src =>
            `<tr>
                <td>${src.key}</td>
                <td>${src.value}</td>
            </tr>`
        )

        const recipients = [{ email: 'shrey@active.agency', name: 'Shrey Kankaria' }, { email: 'akshay@active.agency', name: 'Akshay Agarwal' }, { email: 'ameen@active.agency', name: 'Ameen' }, { email: 'nagesh@ekbazaar.com', name: 'Nagesh' }, { email: 'sandeep@ekbazaar.com', name: 'Sandeep' }, { email: 'nk@ekbazaar.com', name: 'Nandakumar' }, { email: 'ramesh@active.agency', name: 'Ramesh Shettanoor' }, { email: 'darshan@active.agency', name: 'Darshan' }, { email: 'santosh@ekbazaar.com', name: 'Santosh' } ]
        let recipientVars = {};
        recipients.forEach((recipient, index) => {
            recipientVars = {
                ...recipientVars,
                [recipient.email]: {
                    id: index + 1,
                    name: recipient.name
                }
            }
        })
        // for (let i = 0; i < emails.length; i++) {
        const message = {
            from: MailgunKeys.senderMail,
            to: recipients.map(recipient => recipient.email),
            subject: `${_dateyesterday} Seller Subscriber/Offer Count`,
            'recipient-variables': JSON.stringify(recipientVars),
            attachments: [{
                filename: FilePath,
                content: sellerrawData.length && _fs.createReadStream(FileSource) || 'NoSellerData'
            }],
            html: `<!doctype html>
                <html lang="en">
                    <head>
                        <title>Table 01</title>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="x-apple-disable-message-reformatting">
                        <title></title>
                        <!-- Web Font / @font-face : BEGIN -->

                        <!--[if mso]>
                        <style>
                            * {
                                font-family: sans-serif !important;
                            }
                        </style>
                        <![endif]-->
                        
                        <!--[if !mso]><!-->
                        <link href='https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700' rel='stylesheet' type='text/css'>
                        <!--<![endif]-->
                        
                        <!-- Web Font / @font-face : END -->
                    
                        <link href='https://fonts.googleapis.com/css?family=Roboto:400,100,300,700' rel='stylesheet' type='text/css'>
                    
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
                        
                        <link rel="stylesheet" href="/table/css/style.css">

                        <!-- Web Font / @font-face : BEGIN -->
        
                        <!--[if mso]>
                        <style>
                            * {
                                font-family: sans-serif !important;
                            }
                        </style>
                        <![endif]-->
                    
                        <!--[if !mso]><!-->
                        <link href='https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700' rel='stylesheet' type='text/css'>
                        <!--<![endif]-->
                    
                        <!-- Web Font / @font-face : END -->
                    
                        <!-- CSS Reset -->
                        <style>
                    
                    
                            html,
                            body {
                                margin: 0 auto !important;
                                padding: 0 !important;
                                height: 100% !important;
                                width: 100% !important;
                            }
                    
                            * {
                                -ms-text-size-adjust: 100%;
                                -webkit-text-size-adjust: 100%;
                            }
                    
                            div[style*="margin: 16px 0"] {
                                margin: 0 !important;
                            }
                    
                            
                    
                            img {
                                -ms-interpolation-mode: bicubic;
                            }
                    
                            *[x-apple-data-detectors] {
                                color: inherit !important;
                                text-decoration: none !important;
                            }
                    
                            .x-gmail-data-detectors,
                            .x-gmail-data-detectors *,
                            .aBn {
                                border-bottom: 0 !important;
                                cursor: default !important;
                            }
                    
                            .a6S {
                                display: none !important;
                                opacity: 0.01 !important;
                            }
                    
                    
                            img.g-img + div {
                                display: none !important;
                            }
                    
                            .button-link {
                                text-decoration: none !important;
                            }
                    
                            @media  only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                                /* iPhone 6 and 6+ */
                                .email-container {
                                    min-width: 375px !important;
                                }
                            }
                    
                            #table1 {
                                font-family: Arial, Helvetica, sans-serif;
                                border-collapse: collapse;
                                width: 300px;
                                margin-left: 20px; 
                                margin-right: auto;
                              }
                              
                              #table1 td, #table1 th {
                                border: 1px solid #ddd;
                                padding: 8px;
                              }
                              
                              #table1 tr:nth-child(even){background-color: #f2f2f2;}
                              
                              #table1 tr:hover {background-color: #ddd;}
                              
                              #table1 th {
                                padding-top: 12px;
                                padding-bottom: 12px;
                                text-align: left;
                                background-color: #0000CD;
                                color: white;
                              }

                              #table2 {
                                font-family: Arial, Helvetica, sans-serif;
                                border-collapse: collapse;
                                width: 300px;
                                margin-left: 20px; 
                                margin-right: auto;
                              }
                              
                              #table2 td, #table2 th {
                                border: 1px solid #ddd;
                                padding: 8px;
                              }
                              
                              #table2 tr:nth-child(even){background-color: #f2f2f2;}
                              
                              #table2 tr:hover {background-color: #ddd;}
                              
                              #table2 th {
                                padding-top: 12px;
                                padding-bottom: 12px;
                                text-align: left;
                                background-color: #0000CD;
                                color: white;
                              }

                        </style>

                        <!--[if gte mso 9]>
                        <xml>
                            <o:OfficeDocumentSettings>
                                <o:AllowPNG/>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                            </o:OfficeDocumentSettings>
                        </xml>
                        <![endif]-->
                        <style>        
                            body, h1, h2, h3, h4, h5, h6, p, a {
                                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif;;
                            }
                    
                            .button-td,
                            .button-a {
                                transition: all 100ms ease-in;
                            }
                    
                            .button-td:hover,
                            .button-a:hover {
                                background: #45C8FF !important;
                                border-color: #45C8FF !important;
                            }
                    
                            @media  screen and (max-width: 480px) {
                    
                                .fluid {
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    height: auto !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                }
                    
                                .stack-column,
                                .stack-column-center {
                                    display: block !important;
                                    width: 100% !important;
                                    max-width: 100% !important;
                                    direction: ltr !important;
                                }
                    
                                .stack-column-center {
                                    text-align: center !important;
                                }
                    
                                .center-on-narrow {
                                    text-align: center !important;
                                    display: block !important;
                                    margin-left: auto !important;
                                    margin-right: auto !important;
                                    float: none !important;
                                }
                    
                                table.center-on-narrow {
                                    display: inline-block !important;
                                }
                            }
        
                        </style>
                    </head>
                    <body>
                        <section class="ftco-section">
                            <div class="container">
                                <div class="row justify-content-center">
                                    <div class="col-md-6 text-center mb-5">
                                        <h4 class="heading-section">Hi,</h5>
                                        <h4>Please find the subscriber count below:</h5>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="table-wrap">
                                            <table class="table" id="table1">
                                                <thead class="thead-primary">
                                                    <tr>
                                                    <th>Date</th>
                                                    <th>Total Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                    <td>${_dateyesterday}</td>
                                                    <td>${sum}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="table-wrap" style="margin-top:15px">
                                            <table class="table" id="table2">
                                                <thead class="thead-primary">
                                                    <tr>
                                                    <th>Source</th>
                                                    <th>Total Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                ${elem.toString().split(',').join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div style="margin-top: 15px;">
                                    <h4>Total Subscribers from ${moment('2021-07-16').startOf('day').format('MMMM Do YYYY')} till ${moment.utc().subtract(1, 'day').startOf('day').format('MMMM Do YYYY')} = ${/* yesterdayTotalCount.length */ totalSellerCount}</h4>
                                    <h4>Incomplete Sellers: <span>${/* yesterdayTotalCount.length */ incompletSellerCount}</span></h4>
                                    <h4>Registered Sellers: <span>${/* totalSellerCount.length */ totalRegisteredSellers}</span></h4>
                                    <h4>Total Offers: <span>${totalOfferCount}</span></h4>
                                    <h4>Todays Offers: <span>${dailyOffersCoount}</span></h4>
                                    <h4>Thank you. </h4>
                                </div>
                            </div>
                        </section>
                        <script src="/js/jquery.min.js"></script>
                        <script src="/js/popper.js"></script>
                        <script src="/js/bootstrap.min.js"></script>
                        <script src="/js/main.js"></script>
                
                    </body>
                </html>`,
        };
        let mail = await sendSingleMail(message);
        console.log("🚀 ~ file: cron.js ~ line 453 ~ exports.sendDailyCount=async ~ mail", mail)
        // }
        resolve(true)
    } catch (error) {
        Logger.error(error.message)
        console.error(error.message);
        reject(error.message)
    }
})
