const { reject } = require('lodash');
const _ = require('lodash');
const moment = require("moment");
const { sellers, mastercollections, sellerProducts, SMSQue, buyers, SellerPlans, QueEmails } = require('../modules')
const { getAllSellers, getUpdatedSellerDetails, getSellerProductDetails, addProductDetails } = sellers
const { updateMaster } = mastercollections
const { getSellerProducts, updateSellerProducts } = sellerProducts
const { getQueSMS, updateQueSMS, queSMSBulkInsert } = SMSQue
const { getRFPData, updateRFP } = buyers
const { bulkInserQemails, getQueEmail, updateQueEmails } = QueEmails
const { getExpirePlans, updateSellerPlans,getAboutToexpirePlan } = SellerPlans
const { sendSMS, sendBulkSMS } = require('../utils/utils')
const { planExpiry } = require('../utils/templates/smsTemplate/smsTemplate');
const { commonTemplate } = require('../utils/templates/emailTemplate/emailTemplate');
const { planExpired,planExpiring } = require('../utils/templates/emailTemplate/emailTemplateContent');
const {
    MailgunKeys
} = require("../utils/globalConstants");
const { sendSingleMail } = require('../utils/mailgunService')



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
             let url = '';
             if (process.env.NODE_ENV === "production") {
                 url = `https://ekbazaar.tech-active.com`
             } else if (process.env.NODE_ENV === 'development') {
                 url = `http://localhost:8085`
             } else if (process.env.NODE_ENV === 'staging') {
                 url = `http://ekbazaar.tech-active.com`
             }
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
                            body: planExpired({date : element.exprireDate,isTrial : element.isTrial,url:url})
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

exports.getAboutToExpirePlan = async (req,res) =>{

    try{
        const emailData = []
        const smsData = []
        let url = '';
        if (process.env.NODE_ENV === "production") {
            url = `https://ekbazaar.tech-active.com`
        } else if (process.env.NODE_ENV === 'development') {
            url = `http://localhost:8085`
        } else if (process.env.NODE_ENV === 'staging') {
            url = `http://ekbazaar.tech-active.com`
        }
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
                 const date1 = moment();
                 const date2 = moment(element.exprireDate);
                 const dayDiff = date2.diff(date1, 'days');
                const data = {
                    messageType: "plan_abt_expire",
                    sellerId: element._id,
                    userId: element.sellerId.userId,
                    fromEmail: MailgunKeys.senderMail,
                    toEmail: element.sellerId.email,
                    name: element.sellerId.name,
                    subject: "Plan About To Expire",
                    body: planExpiring({date:element.exprireDate, isTrial : element.isTrial, url: url,dayDiff}),
                };
                emailData.push(data)
            }
        }
        if (emailData.length){
            await bulkInserQemails(emailData)
        }
        if (smsData.length){
            await queSMSBulkInsert(smsData)
        }   
    }catch(error){
     console.log("About to expire plan error:",error)
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