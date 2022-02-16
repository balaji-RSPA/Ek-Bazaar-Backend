const mongoose = require('mongoose');
const pdf = require("pdf-creator-node");
const fs = require('fs');
const path = require("path")
const Razorpay = require('razorpay')
const axios = require("axios")
const request = require('request');
const moment = require('moment')
const { ToWords } = require('to-words');
const { capitalizeFirstLetter } = require('../../utils/helpers')
const { subscriptionPlan, sellers, Orders, Payments, SellerPlans, SellerPlanLogs, category, sellerProducts, mastercollections, InvoiceNumber } = require("../../modules");
const { sendSingleMail } = require('../../utils/mailgunService')
const { MailgunKeys, razorPayCredentials, stripeApiKeys } = require('../../utils/globalConstants')
const stripe = require("stripe")(stripeApiKeys.secretKey);

const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const { uploadToDOSpace, sendSMS } = require('../../utils/utils')
const { addOrdersPlans } = require('../../modules/ordersModule');
const { planSubscription, planChanged } = require('../../utils/templates/smsTemplate/smsTemplate')
const { invoiceContent, planChangedEmail } = require('../../utils/templates/emailTemplate/emailTemplateContent');
const { commonTemplate } = require('../../utils/templates/emailTemplate/emailTemplate')
const { findPincode } = require('../../modules/pincodeModule')

const {
    getSubscriptionPlanDetail,
} = subscriptionPlan;

const { getSellerProfile, updateSeller, getUserProfile } = sellers
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans
const { addOrders, updateOrder, getOrderById } = Orders
const { addPayment, updatePayment } = Payments
const { addSellerPlanLog } = SellerPlanLogs
const { getAllSellerTypes } = category
const { updateSellerProducts } = sellerProducts
const { updateMasterBulkProducts } = mastercollections
const { getInvoiceNumber, updateInvoiceNumber, addInvoiceNumber } = InvoiceNumber
const isProd = process.env.NODE_ENV === 'production';
const toWords = new ToWords();

const createPdf = async (seller, plan, orderDetails) => new Promise((resolve, reject) => {

    try {
        const sellerDetails = {
            name: orderDetails && orderDetails.sellerDetails && capitalizeFirstLetter(orderDetails.sellerDetails.name) || seller.name,
            city: seller && seller.location && seller.location.city && capitalizeFirstLetter(seller.location.city.name) || '',
            state: seller && seller.location && seller.location.city && capitalizeFirstLetter(seller.location.state.name) || '',
            country: seller && seller.location && seller.location.country && capitalizeFirstLetter(seller.location.country.name) || '',
            showGst: seller && seller.sellerType && seller.sellerType.length && seller.sellerType[0]["name"] === "farmer" ? false : true,
            gstLable: seller && seller.sellerType && seller.sellerType.length && seller.sellerType[0]["name"] === "farmer" ? "Aadhar Number" : "GSTIN",
            gstNo: orderDetails && orderDetails.gstNo || '',
            address: orderDetails && orderDetails.address || '',
            pincode: orderDetails && orderDetails.pincode || '',
        }
        const orderData = {
            planType: plan && plan.type || '',
            pricePerMonth: plan && plan.price || '',
            // months: '3',
            features: plan && plan.features,
            igstAmount: orderDetails && orderDetails.gstAmount,
            cgstAmount: orderDetails && orderDetails.cgstAmount,
            sgstAmount: orderDetails && orderDetails.sgstAmount,

            amount: plan && plan.totalPlanPrice,
            orderTotal: orderDetails && orderDetails.total.toFixed(2),
            invoiceDate: moment(new Date()).format('DD/MM/YYYY'),
            startDate: plan && plan.isFreeTrialIncluded && plan.planValidFrom ? plan && moment(plan.planValidFrom).format('DD/MM/YYYY') : moment(new Date()).format('DD/MM/YYYY'),
            expireDate: plan && moment(new Date(plan.exprireDate)).format('DD/MM/YYYY'),
            // subscriptionValidety: plan && moment(new Date(plan.subscriptionValidety)).format('DD/MM/YYYY'),
            invoiceNumber: orderDetails && orderDetails.invoiceNo || '',
            // currency: orderDetails && orderDetails.currency || '',
            currency: orderDetails && orderDetails.currency === 'INR' ? "₹" : '$' || '',
            currencyInWords: orderDetails && orderDetails.currency === 'INR'
                ? `${toWords.convert(orderDetails && orderDetails.total/* , { currency: true } */)} Rupees Only`
                : `${toWords.convert(orderDetails && orderDetails.total/* , { currency: true } */)} Dollars Only`,
            country: orderDetails && orderDetails.country || '',
            currencyFlag: orderDetails && orderDetails.currency === 'INR' ? true : ''

        }
        /* const html = fs.readFileSync(path.resolve(__dirname, '../../..', 'src/utils/templates/invoice', 'invoiceTemplate.html'), 'utf8'); */
        let html;
        if (orderDetails && orderDetails.currency === "INR") {
            html = fs.readFileSync(
                path.resolve(
                    __dirname,
                    "../../..",
                    "src/utils/templates/invoice",
                    "invoiceTemplateNew.html"
                ),
                "utf8"
            );
        } else {
            html = fs.readFileSync(
                path.resolve(
                    __dirname,
                    "../../..",
                    "src/utils/templates/invoice",
                    "invoiceTemplateOnebazaarNew.html"
                ),
                "utf8"
            );
        }
        const options = {
            format: "A4",
            // orientation: "portrait",
            border: "10mm",
            // header: {
            //     // height: "45mm",
            //     contents: '<div style="text-align: center;">Ekbazaar</div>'
            // },
            // "footer": {
            //     // "height": "28mm",
            //     "contents": {
            //         // first: 'Cover page',
            //         2: 'Second page', // Any page number is working. 1-based index
            //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            //         // last: 'Last Page'
            //     }
            // }
        }

        const details = {
            orderData: { ...orderData },
            sellerDetails: { ...sellerDetails }
        }

        console.log(orderDetails, "orderDetailsorderDetails");

        const invoiceFileName = orderDetails && orderDetails.invoiceNo.toString() + '-invoice.pdf'

        console.log(invoiceFileName, 'invoiceFileName')


        const document = {
            html: html,
            data: {
                details: details
            },
            path: path.resolve(__dirname, "../../../", "public/orders", invoiceFileName)
        };
        pdf.create(document, options)
            .then(async (res) => {
                console.log(res)
                const output = `invoice-${orderDetails && orderDetails.invoiceNo}.pdf`
                const invoice = fs.readFileSync(res.filename);
                let data = {
                    Key: `${seller._id}/${orderDetails && orderDetails.invoiceNo}/${output}`,
                    body: invoice
                }
                const multidoc = await uploadToDOSpace(data)
                resolve({ ...multidoc, attachement: path.resolve(__dirname, "../../../", "public/orders", invoiceFileName) })

            })
            .catch(error => {
                console.error(error)
            });

    } catch (error) {
        console.log(error)
        respError(error)

    }

})


// const createOnebazaarPdf = async (seller, plan, orderDetails) => new Promise((resolve, reject) => {

//     try {
//         const sellerDetails = {
//             name: orderDetails && orderDetails.sellerDetails && capitalizeFirstLetter(orderDetails.sellerDetails.name) || seller.name,
//             city: seller && seller.location && seller.location.city && capitalizeFirstLetter(seller.location.city.name) || '',
//             state: seller && seller.location && seller.location.city && capitalizeFirstLetter(seller.location.state.name) || '',
//             country: seller && seller.location && seller.location.country && capitalizeFirstLetter(seller.location.country.name) || '',
//             gstLable: seller && seller.sellerType && seller.sellerType.length && seller.sellerType[0]["name"] === "farmer" ? "Aadhar Number" : "GST Number",
//             gstNo: orderDetails && orderDetails.gstNo || '',
//             address: orderDetails && orderDetails.address || '',
//             pincode: orderDetails && orderDetails.pincode || '',
//         }
//         const orderData = {
//             planType: plan && plan.type || '',
//             pricePerMonth: plan && plan.price || '',
//             // months: '3',
//             features: plan && plan.features,
//             igstAmount: orderDetails && orderDetails.gstAmount,
//             cgstAmount: orderDetails && orderDetails.cgstAmount,
//             sgstAmount: orderDetails && orderDetails.sgstAmount,

//             amount: plan && plan.totalPlanPrice,
//             orderTotal: orderDetails && orderDetails.total.toFixed(2),
//             invoiceDate: moment(new Date()).format('DD/MM/YYYY'),
//             startDate: plan && plan.isFreeTrialIncluded && plan.planValidFrom ? plan && moment(plan.planValidFrom).format('DD/MM/YYYY') : moment(new Date()).format('DD/MM/YYYY'),
//             expireDate: plan && moment(new Date(plan.exprireDate)).format('DD/MM/YYYY'),
//             // subscriptionValidety: plan && moment(new Date(plan.subscriptionValidety)).format('DD/MM/YYYY'),
//             invoiceNumber: orderDetails && orderDetails.invoiceNo || '',
//             // currency: orderDetails && orderDetails.currency || '',
//             currency: orderDetails && orderDetails.currency === 'INR' ? "₹" : '$' || '',
//             currencyInWords: toWords.convert(orderDetails && orderDetails.total/* , { currency: true } */),
//             country: orderDetails && orderDetails.country || '',
//             currencyFlag: orderDetails && orderDetails.currency === 'INR' ? true : ''

//         }
//         const html = fs.readFileSync(path.resolve(__dirname, '../../..', 'src/utils/templates/invoice', 'invoiceTemplateOnebazaar.html'), 'utf8');
//         const options = {
//             format: "A4",
//             // orientation: "portrait",
//             border: "10mm",
//             // header: {
//             //     // height: "45mm",
//             //     contents: '<div style="text-align: center;">Ekbazaar</div>'
//             // },
//             // "footer": {
//             //     // "height": "28mm",
//             //     "contents": {
//             //         // first: 'Cover page',
//             //         2: 'Second page', // Any page number is working. 1-based index
//             //         default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
//             //         // last: 'Last Page'
//             //     }
//             // }
//         }

//         const details = {
//             orderData: { ...orderData },
//             sellerDetails: { ...sellerDetails }
//         }
//         const invoiceFileName = orderDetails && orderDetails.invoiceNo.toString() + '-invoice.pdf'
//         const document = {
//             html: html,
//             data: {
//                 details: details
//             },
//             path: path.resolve(__dirname, "../../../", "public/orders", invoiceFileName)
//         };
//         pdf.create(document, options)
//             .then(async (res) => {
//                 console.log(res)
//                 const output = `invoice-${orderDetails && orderDetails.invoiceNo}.pdf`
//                 const invoice = fs.readFileSync(res.filename);
//                 let data = {
//                     Key: `${seller._id}/${orderDetails && orderDetails.invoiceNo}/${output}`,
//                     body: invoice
//                 }
//                 const multidoc = await uploadToDOSpace(data)
//                 resolve({ ...multidoc, attachement: path.resolve(__dirname, "../../../", "public/orders", invoiceFileName) })

//             })
//             .catch(error => {
//                 console.error(error)
//             });

//     } catch (error) {
//         console.log(error)
//         respError(error)

//     }

// })

async function CalculateGst(price, findPinCode, currency) {
    const gstValue = 18
    const cgst = 9
    let gstAmount = ''
    let cgstAmount = ''
    let sgstAmount = ''
    let totalAmount = ''
    if (currency === 'INR') {

        if (findPinCode.stateName === 'Karnataka') {
            console.log("karnataka")
            cgstAmount = (parseFloat(price) * cgst) / 100
            sgstAmount = (parseFloat(price) * cgst) / 100
            totalAmount = parseFloat(price) + cgstAmount + sgstAmount
        } else {
            console.log("non karnataka")
            gstAmount = (parseFloat(price) * gstValue) / 100
            totalAmount = parseFloat(price) + gstAmount
        }
    } else {
        totalAmount = parseFloat(price) + 0.0
    }
    return { gstAmount, cgstAmount, sgstAmount, totalAmount }
}

module.exports.cancleSubscription = async (req, res) => { 
    try{
        const { OrderId }  = req.body
        const ordersQuery = {_id: OrderId}
        const result = await getOrderById(ordersQuery)
        const raz_sub_id = result.paymentId.paymentResponse.razorpay_subscription_id;
        const sellerPlanQuery = { _id: result.sellerPlanId}
        
        
        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
        });

        //Making Subscription Cancel Request To Razorpay.
        const rzrResponce = await instance.subscriptions.cancel(raz_sub_id)

        if (rzrResponce && rzrResponce.status === 'cancelled'){
            const OrderUpdate = await updateOrder(ordersQuery, { canceled: true })
            const sellerPlansUpadte = await updateSellerPlan(sellerPlanQuery, { canceled: true })

            respSuccess(res,req.body,"Subscription Cancled" )
        }
    }catch(error){
        console.log(error)
        respError(error)
    }
}

module.exports.createRazorPayOrder = async (req, res) => {

    try {
        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
        });
        const { planId, pincode, currency, isSubscription } = req.body

        let findpincode = currency === 'INR' ? await findPincode({ pincode }) : '';
        if (!findpincode && currency === 'INR') {
            respError(res, "Invalid pincode");
        } else {
            const planDetails = await getSubscriptionPlanDetail({ _id: planId })
            // console.log(planDetails, 'test')
            if (planDetails) {
                const gstValue = 18
                const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Half Yearly" ? 6 : planDetails.type === "Yearly" ? 12 : ''

                const pricePerMonth = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
                const price = pricePerMonth /* * parseInt(months) */
                const includedGstAmount = await CalculateGst(price, findpincode, currency);
                // const gstAmount = (parseFloat(price) * gstValue) / 100
                // const totalAmount = parseFloat(price) + gstAmount
                let result;

                // Creating Order ID For Order Type Payment
                if(!isSubscription){
                    result = await instance.orders.create({ amount: parseInt((includedGstAmount.totalAmount * 100).toFixed(2)).toString(), currency, receipt: 'order_9A33XWu170gUtm', payment_capture: 0 })
                }

                // Creating Subscription ID For Subscription Type Payment
                if(isSubscription){
                    let plan_id = planDetails && planDetails.plan_id;
    
                    result = await instance.subscriptions.create({
                        plan_id,
                        total_count: parseInt(months),
                        customer_notify: 0,
                        notes: {
                            key1: "Assiging Plan to user"
                        }
                    })
                    result.currency = currency;
                }
                // console.log(result, 'create Order')

                respSuccess(res, { ...result, key_id: razorPayCredentials.key_id })
            }
        }
    } catch (error) {
        console.log(error)
        respError(error)

    }

}

module.exports.captureRazorPayPayment = async (req, res) => {

    try {
        const { sellerId, subscriptionId, orderDetails, userId, paymentResponse, currency, isSubscription } = req.body
        console.log("🚀 ~ file: paymentController.js ~ line 199 ~ module.exports.captureRazorPayPayment= ~  req.body", req.body)
        const url = req.get('origin');
        const dateNow = new Date();
        const gstValue = currency === 'INR' ? 18 : 0
        //  currency = 'INR'
        let deleteProduct = false
        const pincode = orderDetails && orderDetails.pincode;
        let findpincode = currency === 'INR' ? await findPincode({ pincode }) : '';
        if (!findpincode && currency === 'INR') {
            respError(res, 'Invalid pincode')
        } else {
            let seller = await getSellerProfile(sellerId)
            const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })

            if (planDetails && seller && seller.length) {
                seller = seller[0]
                const checkMobile = seller && seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile
                const existingGroup = seller.sellerType[0].group
                const currentGroup = planDetails.groupType

                let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null;
                const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
                const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
                const checkPaidSeller = sellerPlanDetails && sellerPlanDetails.isTrial === false;
                const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
                let newPlanType = '';

                const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Half Yearly" ? 6 : planDetails.type === "Yearly" ? 12 : ''
                const totalPrice = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
                let price;
                if(isSubscription){
                    price = totalPrice / months
                }else {
                    price = totalPrice
                }
                const includedGstAmount = await CalculateGst(price, findpincode, currency);
                console.log("🚀 ~ gggggggggggggggggggg  -------", includedGstAmount, req.params.paymentId)

                // const gstAmount = (parseFloat(price) * gstValue) / 100
                // const totalAmount = parseFloat(price) + gstAmount

                // console.log(months, "-------", pricePerMonth, "-------", price, "-------", gstAmount, "-------", totalAmount)

                request({
                    method: 'POST',
                    url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
                    form: {
                        amount: parseInt((includedGstAmount.totalAmount * 100).toFixed(2)).toString(),
                        currency
                    }
                }, async function (error, response, body) {
                    try {
                        console.log('Status:', response.statusCode);
                        // console.log('Headers:', JSON.stringify(response.headers));
                        console.log('Response:', body);
                        const userData = {
                            userId: seller.userId,
                            sellerId: seller._id,
                        }
                        if (response.statusCode === 200) {
                            const invoiceNumner = await getInvoiceNumber({ id: 1 })
                            const _invoice = invoiceNumner && invoiceNumner.invoiceNumber || ''
                            let planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
                            let date = new Date()
                            // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
                            const SourceCode = seller && seller.hearingSource && seller.hearingSource.referralCode;
                            let isFreeTrialIncluded = false;
                            let planValidFrom = moment()

                            if (seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller.hearingSource.referralCode === 'UTK1121') {
                                if (seller && seller.planId && seller.planId.isTrial) {
                                    const trialCreatedAt = seller.planId && seller.planId.createdAt;
                                    const today = moment();
                                    const daysFromRegistration = today.diff(moment(trialCreatedAt, 'DD-MM-YYYY'), 'days');
                                    const todayDate = new Date();
                                    if (daysFromRegistration <= 7) {
                                        planExpireDate = todayDate.setDate(todayDate.getDate() + parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration)

                                        planDetails.days = `${parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration}`

                                        isFreeTrialIncluded = true

                                        planValidFrom = moment(seller.planId.exprireDate)
                                    }
                                }
                            }
                            await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

                            const sellerDetails = {
                                name: orderDetails.name,
                                email: orderDetails.email || seller.email,
                                sellerType: seller.sellerType,
                                groupId: planDetails.groupType,
                                location: seller.location,
                                mobile: seller.mobile
                            }
                            const paymentJson = {
                                ...userData,
                                paymentResponse: paymentResponse,
                                paymentDetails: JSON.parse(body),
                                paymentSuccess: true,
                                isSubscription
                            }
                            const _p_details = {
                                subscriptionId: planDetails._id,
                                expireStatus: false,
                                name: planDetails.type,
                                price: planDetails.price,
                                usdPrice: planDetails.usdPrice,
                                description: planDetails.description,
                                features: planDetails.features,
                                days: planDetails.days,
                                extendTimes: null,
                                exprireDate: planExpireDate,
                                // subscriptionValidety,
                                hearingSourceCode: SourceCode,
                                isTrial: false,
                                planType: planDetails.type,
                                extendDays: planDetails.days,
                                groupType: planDetails.groupType,
                                billingType: planDetails.billingType,
                                priceUnit: planDetails.priceUnit,
                                type: planDetails.type,
                                currency
                            }
                            const payment = await addPayment(paymentJson)
                            const planData = {
                                ...userData,
                                ..._p_details,
                                isFreeTrialIncluded,
                                planValidFrom,
                                isSubscription,
                                canceled: false,
                                createdAt: new Date(),
                                createdOn: new Date()
                            }

                            const order_details = {
                                ...userData,
                                invoiceNo: _invoice,
                                invoicePath: '',
                                gstNo: orderDetails && orderDetails.gst || null,
                                address: orderDetails && orderDetails.address || null,
                                pincode: orderDetails && orderDetails.pincode || null,
                                country: orderDetails && orderDetails.country || null,
                                sellerDetails: {
                                    ...sellerDetails
                                },
                                // sellerPlanId: '', // seller plan collectio id
                                subscriptionId: subscriptionId,
                                // orderPlanId: '', // order items/plans id
                                gst: gstValue,
                                price: price,
                                gstAmount: includedGstAmount.gstAmount,
                                cgstAmount: includedGstAmount.cgstAmount,
                                sgstAmount: includedGstAmount.sgstAmount,
                                total: includedGstAmount.totalAmount,
                                orderedOn: new Date(),
                                hearingSourceCode: SourceCode,
                                // paymentId: '', // payment collection id
                                // paymentStatus: '',
                                ipAddress: orderDetails && orderDetails.ipAddress || null,
                                currency: currency,
                                isSubscription
                                // isEmailSent: ''
                            }
                            const OrdersData = await addOrders(order_details)

                            const orderItem = {
                                ...userData,
                                orderId: OrdersData._id,
                                subscriptionId: planDetails._id,
                                ..._p_details,
                                isFreeTrialIncluded,
                                planValidFrom,
                                isSubscription
                            }
                            const orderItemData = await addOrdersPlans(orderItem)
                            let sellerUpdate = {
                                paidSeller: true,
                                sellerVerified: true,
                                isSubscription
                            }
                            console.log(existingGroup, '!==', currentGroup, ' Group equality check------')
                            if (existingGroup !== currentGroup) {
                                const sellerType = await getAllSellerTypes(0, 10, { group: parseInt(currentGroup) })
                                const typeSeller = sellerType.map((item) => item._id)
                                sellerUpdate = {
                                    ...sellerUpdate,
                                    sellerType: typeSeller
                                }
                                deleteProduct = true
                            }
                            const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })
                            if (sellerPlanDetails) {
                                sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData);
                            } else {
                                sellerPlanDetails = await createPlan(planData)
                                sellerUpdate.planId = sellerPlanDetails._id
                            }
                            const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)

                            const planLog = {
                                ...userData,
                                sellerPlanId: sellerPlanDetails._id,
                                subscriptionId: planDetails._id,
                                sellerDetails: { ...sellerDetails },
                                planDetails: {
                                    ..._p_details,
                                    exprireDate: new Date(_p_details.exprireDate)
                                },
                                isSubscription
                            }
                            const OrderUpdate = await updateOrder({ _id: OrdersData._id }, { orderPlanId: orderItemData._id, paymentId: payment._id, planId: sellerPlanDetails._id, sellerPlanId: sellerPlanDetails._id })
                            // Generate invoice
                            const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, totalPrice, isFreeTrialIncluded, planValidFrom }, order_details)


                            await addSellerPlanLog(planLog)
                            if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
                                updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                                updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                                console.log('--- Old Service Type Product Status changed-------')
                                // update product deleta status true

                            }

                            // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
                            if (currency === 'INR' && checkMobile && isProd && planTo && planFrom && checkPaidSeller) {
                                const msgData = {
                                    plan: _p_details.planType,
                                    currency: currency,
                                    amount: includedGstAmount.totalAmount,
                                    url: invoice.Location,
                                    name: order_details.invoiceNo.toString() + '-invoice.pdf',
                                    till: _p_details.exprireDate,
                                    to: planTo,
                                    from: planFrom
                                }
                        /* await */ sendSMS(checkMobile, planChanged(msgData))
                            } else if (currency === 'INR' && checkMobile && isProd) {
                                const msgData = {
                                    plan: _p_details.planType,
                                    currency: currency,
                                    amount: includedGstAmount.totalAmount,
                                    url: invoice && invoice.Location || null,
                                    name: order_details.invoiceNo.toString() + '-invoice.pdf',
                                    till: _p_details.exprireDate
                                }
                        /* await */ sendSMS(checkMobile, planSubscription(msgData))
                            } else {
                                console.log("================sms not send===========")
                            }
                            if (orderDetails && orderDetails.email/* seller && seller.email */ && planTo && planFrom && checkPaidSeller) {
                                let planChangedEmailMsg = planChangedEmail({
                                    oldPlanType,
                                    newPlanType: _p_details.planType,
                                    from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                                    till: _p_details.exprireDate,
                                    // till: _p_details.subscriptionValidety,
                                    url
                                })
                                const message = {
                                    from: MailgunKeys.senderMail,
                                    to: orderDetails && orderDetails.email || seller.email,
                                    subject: 'Plan changed',
                                    html: commonTemplate(planChangedEmailMsg),
                                }
                         /* await */ sendSingleMail(message)
                            } else {
                                console.log("==============Plan Changed Email Not Send====================")
                            }
                            if (orderDetails && orderDetails.email) {
                                let invoiceEmailMsg = invoiceContent({
                                    plan: _p_details.planType,
                                    from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                                    till: _p_details.exprireDate,
                                    price: includedGstAmount.totalAmount,
                                    invoiceLink: invoice.Location,
                                    cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
                                    isOneBazzar : false
                                });
                                const message = {
                                    from: MailgunKeys.senderMail,
                                    to: orderDetails.email || seller.email,
                                    subject: 'Ekbazaar Subscription activated successfully',
                                    html: commonTemplate(invoiceEmailMsg),
                                    // attachment: invoice.attachement,
                                    attachments: [{ // stream as an attachment
                                        filename: 'invoice.pdf',
                                        content: fs.createReadStream(invoice.attachement)
                                        // path: invoice.Location,
                                    }]
                                }
                            /* await */ sendSingleMail(message)
                            } else {
                                console.log("==============Invoice Not Send====================")
                            }
                            await updateOrder({ _id: OrdersData._id }, { isEmailSent: true, invoicePath: invoice && invoice.Location || '' })
                            console.log('------------------ Payment done ---------')
                            return respSuccess(res, { payment: true }, 'subscription activated successfully!')
                        } else {
                            console.log('-------  Payment Failled -------------')
                            const paymentJson = {
                                ...userData,
                                paymentResponse: paymentResponse,
                                paymentDetails: JSON.parse(body),
                                paymentSuccess: false
                            }
                            const payment = await addPayment(paymentJson)
                            return respSuccess(res, { payment: false }, 'Payment failed')
                        }
                    } catch (err) {
                        console.log(err);
                    }
                });
            } else
                return respSuccess(res, { payment: false }, 'Payment failed')

        }
    } catch (error) {
        console.log(error)
        respError(error)

    }
}


// For Manully Assign Plan.

// const insertPlaneInDb = async (sellerId, subscriptionId, orderDetails, paymentResponse, body) => {
//     try {
//         const currency = 'INR';
//         const url = 'https://trade.ekbazaar.com/';
//         const dateNow = new Date();
//         const gstValue = currency === 'INR' ? 18 : 0
//         let deleteProduct = false
//         const pincode = orderDetails && orderDetails.pincode;
//         let seller = await getSellerProfile(sellerId)
//         const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })
//         seller = seller[0]
//         const checkMobile = seller && seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile
//         const existingGroup = seller.sellerType[0].group
//         const currentGroup = planDetails.groupType

//         let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null;
//         const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
//         const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
//         const checkPaidSeller = sellerPlanDetails && sellerPlanDetails.isTrial === false;
//         const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
//         let newPlanType = '';

//         const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Half Yearly" ? 6 : planDetails.type === "Yearly" ? 12 : ''
//         const pricePerMonth = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
//         const price = pricePerMonth/*  * parseInt(months) */
//         const includedGstAmount = await CalculateGst(price, findpincode, currency);



//         const userData = {
//             userId: seller.userId,
//             sellerId: seller._id,
//         }

//         const invoiceNumner = await getInvoiceNumber({ id: 1 })
//         const _invoice = invoiceNumner && invoiceNumner.invoiceNumber || ''
//         let planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
//         let date = new Date()
//         // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
//         const SourceCode = seller && seller.hearingSource && seller.hearingSource.referralCode;
//         let isFreeTrialIncluded = false;
//         let planValidFrom = moment()

//         if (seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller.hearingSource.referralCode === 'UTK1121') {
//             if (seller && seller.planId && seller.planId.isTrial) {
//                 const trialCreatedAt = seller.planId && seller.planId.createdAt;
//                 const today = moment();
//                 const daysFromRegistration = today.diff(moment(trialCreatedAt, 'DD-MM-YYYY'), 'days');
//                 const todayDate = new Date();
//                 if (daysFromRegistration <= 7) {
//                     planExpireDate = todayDate.setDate(todayDate.getDate() + parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration)

//                     planDetails.days = `${parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration}`

//                     isFreeTrialIncluded = true

//                     planValidFrom = moment(seller.planId.exprireDate)
//                 }
//             }
//         }
//         await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

//         const sellerDetails = {
//             name: orderDetails.name,
//             email: orderDetails.email || seller.email,
//             sellerType: seller.sellerType,
//             groupId: planDetails.groupType,
//             location: seller.location,
//             mobile: seller.mobile
//         }
//         const paymentJson = {
//             ...userData,
//             paymentResponse: paymentResponse,
//             paymentDetails: JSON.parse(body),
//             paymentSuccess: true
//         }
//         const _p_details = {
//             subscriptionId: planDetails._id,
//             expireStatus: false,
//             name: planDetails.type,
//             price: planDetails.price,
//             usdPrice: planDetails.usdPrice,
//             description: planDetails.description,
//             features: planDetails.features,
//             days: planDetails.days,
//             extendTimes: null,
//             exprireDate: planExpireDate,
//             // subscriptionValidety,
//             hearingSourceCode: SourceCode,
//             isTrial: false,
//             planType: planDetails.type,
//             extendDays: planDetails.days,
//             groupType: planDetails.groupType,
//             billingType: planDetails.billingType,
//             priceUnit: planDetails.priceUnit,
//             type: planDetails.type,
//             currency
//         }
//         const payment = await addPayment(paymentJson)
//         const planData = {
//             ...userData,
//             ..._p_details,
//             isFreeTrialIncluded,
//             planValidFrom,
//             createdAt: new Date(),
//             createdOn: new Date()
//         }

//         const order_details = {
//             ...userData,
//             invoiceNo: _invoice,
//             invoicePath: '',
//             gstNo: orderDetails && orderDetails.gst || null,
//             address: orderDetails && orderDetails.address || null,
//             pincode: orderDetails && orderDetails.pincode || null,
//             country: orderDetails && orderDetails.country || null,
//             sellerDetails: {
//                 ...sellerDetails
//             },
//             // sellerPlanId: '', // seller plan collectio id
//             subscriptionId: subscriptionId,
//             // orderPlanId: '', // order items/plans id
//             gst: gstValue,
//             price: price,
//             gstAmount: includedGstAmount.gstAmount,
//             cgstAmount: includedGstAmount.cgstAmount,
//             sgstAmount: includedGstAmount.sgstAmount,
//             total: includedGstAmount.totalAmount,
//             orderedOn: new Date(),
//             hearingSourceCode: SourceCode,
//             // paymentId: '', // payment collection id
//             // paymentStatus: '',
//             ipAddress: orderDetails && orderDetails.ipAddress || null,
//             currency: currency
//             // isEmailSent: ''
//         }
//         const OrdersData = await addOrders(order_details)

//         const orderItem = {
//             ...userData,
//             orderId: OrdersData._id,
//             subscriptionId: planDetails._id,
//             ..._p_details,
//             isFreeTrialIncluded,
//             planValidFrom

//         }
//         const orderItemData = await addOrdersPlans(orderItem)
//         let sellerUpdate = {
//             paidSeller: true,
//             sellerVerified: true,
//         }
//         console.log(existingGroup, '!==', currentGroup, ' Group equality check------')
//         if (existingGroup !== currentGroup) {
//             const sellerType = await getAllSellerTypes(0, 10, { group: parseInt(currentGroup) })
//             const typeSeller = sellerType.map((item) => item._id)
//             sellerUpdate = {
//                 ...sellerUpdate,
//                 sellerType: typeSeller
//             }
//             deleteProduct = true
//         }
//         const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })
//         if (sellerPlanDetails) {
//             sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData);
//         } else {
//             sellerPlanDetails = await createPlan(planData)
//             sellerUpdate.planId = sellerPlanDetails._id
//         }
//         const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)

//         const planLog = {
//             ...userData,
//             sellerPlanId: sellerPlanDetails._id,
//             subscriptionId: planDetails._id,
//             sellerDetails: { ...sellerDetails },
//             planDetails: {
//                 ..._p_details,
//                 exprireDate: new Date(_p_details.exprireDate)
//             }
//         }
//         const OrderUpdate = await updateOrder({ _id: OrdersData._id }, { orderPlanId: orderItemData._id, paymentId: payment._id, planId: sellerPlanDetails._id, sellerPlanId: sellerPlanDetails._id })
//         // Generate invoice
//         const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)


//         await addSellerPlanLog(planLog)
//         if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
//             updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
//             updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
//             console.log('--- Old Service Type Product Status changed-------')
//             // update product deleta status true

//         }

//         // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
//         if (currency === 'INR' && checkMobile && isProd && planTo && planFrom && checkPaidSeller) {
//             const msgData = {
//                 plan: _p_details.planType,
//                 currency: currency,
//                 amount: includedGstAmount.totalAmount,
//                 url: invoice.Location,
//                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
//                 till: _p_details.exprireDate,
//                 to: planTo,
//                 from: planFrom
//             }
//                         /* await */ sendSMS(checkMobile, planChanged(msgData))
//         } else if (currency === 'INR' && checkMobile && isProd) {
//             const msgData = {
//                 plan: _p_details.planType,
//                 currency: currency,
//                 amount: includedGstAmount.totalAmount,
//                 url: invoice && invoice.Location || null,
//                 name: order_details.invoiceNo.toString() + '-invoice.pdf',
//                 till: _p_details.exprireDate
//             }
//                         /* await */ sendSMS(checkMobile, planSubscription(msgData))
//         } else {
//             console.log("================sms not send===========")
//         }
//         if (orderDetails && orderDetails.email/* seller && seller.email */ && planTo && planFrom && checkPaidSeller) {
//             let planChangedEmailMsg = planChangedEmail({
//                 oldPlanType,
//                 newPlanType: _p_details.planType,
//                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
//                 till: _p_details.exprireDate,
//                 // till: _p_details.subscriptionValidety,
//                 url
//             })
//             const message = {
//                 from: MailgunKeys.senderMail,
//                 to: orderDetails && orderDetails.email || seller.email,
//                 subject: 'Plan changed',
//                 html: commonTemplate(planChangedEmailMsg),
//             }
//                          /* await */ sendSingleMail(message)
//         } else {
//             console.log("==============Plan Changed Email Not Send====================")
//         }
//         if (orderDetails && orderDetails.email) {
//             let invoiceEmailMsg = invoiceContent({
//                 plan: _p_details.planType,
//                 from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
//                 till: _p_details.exprireDate,
//                 price: includedGstAmount.totalAmount,
//                 invoiceLink: invoice.Location,
//                 cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
//                 isOneBazzar: false
//             });
//             const message = {
//                 from: MailgunKeys.senderMail,
//                 to: orderDetails.email || seller.email,
//                 subject: 'Ekbazaar Subscription activated successfully',
//                 html: commonTemplate(invoiceEmailMsg),
//                 // attachment: invoice.attachement,
//                 attachments: [{ // stream as an attachment
//                     filename: 'invoice.pdf',
//                     content: fs.createReadStream(invoice.attachement)
//                     // path: invoice.Location,
//                 }]
//             }
//                             /* await */ sendSingleMail(message)
//         } else {
//             console.log("==============Invoice Not Send====================")
//         }
//         await updateOrder({ _id: OrdersData._id }, { isEmailSent: true, invoicePath: invoice && invoice.Location || '' })
//         console.log('------------------ Payment done ---------')

//     } catch (error) {
//         console.log(error);
//     }
// }

// module.exports.addPlanManully = async (req, res) => {
//     try {
//         const sellerId = '61fba51c47b8ed1de5844ba5';
//         const subscriptionId = '601d2cbb88a56c05672ebe27';
//         const orderDetails = {
//             name: 'balwinder singh',
//             email: 'balwindersingh1504@gmail.com',
//             mobile: { countryCode: '+91', mobile: '9876657987' },
//             gst: '',
//             address: '',
//             pincode: '160020',
//             planName: 'Quarterly',
//             groupType: 'Manufacturers/Traders',
//             validityFrom: '08/05/2022',
//             validityTill: '06/08/2022',
//             price: 750,
//             gstAmount: 135,
//             total: '',
//             loader: true,
//             refresh: false,
//             active: true,
//             submitted: true,
//             paymentStatus: false,
//             country: '',
//             ipAddress: '193.176.84.139'
//           }

//         const paymentResponse = {
//             razorpay_payment_id: 'pay_IrVW5ut7tWZ5uT',
//             razorpay_order_id: 'order_IrVVRHo78SkAWP',
//             razorpay_signature: '0365887893b028a4eddc1687f365ef62b0b2e3598babed2d2adca7515fc82012'
//         }

//         let bodyReq = {}

//         request({
//             method: 'GET',
//             url: `https://rzp_live_CTVuq0QYf0mDPH:KOY2qN10NCtcbgZmtpq87wOW@api.razorpay.com/v1/payments/pay_IrVW5ut7tWZ5uT`,
    
//         }, async function (error, response, body) {
//             bodyReq = body;
//             console.log(bodyReq,"11111111111111111111111111111");
//         })


//         insertPlaneInDb(sellerId, subscriptionId, orderDetails, paymentResponse, bodyReq);
//         // return respSuccess(res, { payment: true }, 'subscription activated successfully!')
//     } catch (error) {
//         console.log(error);
//     }
// }

module.exports.createStripePayment = async (req, res) => {
    let { amount, id, description, currency } = req.body;
    try {
        const payment = await stripe.paymentIntents.create({
            amount: amount,
            currency: "USD",
            description: id,
            payment_method: id,
            confirm: true,
        });

        console.log("Stripe Response :", payment);
        res.json({
            response: payment,
            message: "Payment Successful",
            success: true,
        });
    } catch (error) {
        console.log("Stripe Error: ", error);
        res.json({
            message: "Payment Failed",
            success: false,
        });
    }
};

module.exports.planActivation = async (req, res) => {

    try {
        const { sellerId, subscriptionId, orderDetails, userId, paymentResponse, currency, paymentMethod } = req.body
        console.log("🚀 ~ file: paymentController.js ~ line 199 ~ module.exports.stripe= ~  req.body", req.body)
        const url = req.get('origin');
        const dateNow = new Date();
        const gstValue = currency === 'INR' ? 18 : 0
        //  currency = 'INR'
        let deleteProduct = false
        const pincode = orderDetails && orderDetails.pincode;
        let findpincode = currency === 'INR' ? await findPincode({ pincode }) : '';
        if (!findpincode && currency === 'INR') {
            respError(res, 'Invalid pincode')
        } else {
            let seller = await getSellerProfile(sellerId)
            const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })

            if (planDetails && seller && seller.length) {
                seller = seller[0]
                const checkMobile = seller && seller.mobile && seller.mobile.length && seller.mobile[0] && seller.mobile[0].mobile
                const existingGroup = seller.sellerType[0].group
                const currentGroup = planDetails.groupType

                let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null;
                const planTo = sellerPlanDetails && sellerPlanDetails.exprireDate;
                const planFrom = sellerPlanDetails && sellerPlanDetails.createdAt;
                const checkPaidSeller = sellerPlanDetails && sellerPlanDetails.isTrial === false;
                const oldPlanType = sellerPlanDetails && sellerPlanDetails.planType;
                let newPlanType = '';

                const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Half Yearly" ? 6 : planDetails.type === "Yearly" ? 12 : ''
                const pricePerMonth = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
                const price = pricePerMonth/*  * parseInt(months) */
                const includedGstAmount = await CalculateGst(price, findpincode, currency);
                console.log("🚀 ~ gggggggggggggggggggg  -------", includedGstAmount)

                // const gstAmount = (parseFloat(price) * gstValue) / 100
                // const totalAmount = parseFloat(price) + gstAmount

                // console.log(months, "-------", pricePerMonth, "-------", price, "-------", gstAmount, "-------", totalAmount)

                try {
                    const userData = {
                        userId: seller.userId,
                        sellerId: seller._id,
                    }
                    const invoiceNumner = await getInvoiceNumber({ id: 1 })
                    const _invoice = invoiceNumner && invoiceNumner.invoiceNumber || ''
                    let planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
                    let date = new Date()
                    // let subscriptionValidety = date.setDate(date.getDate() + parseInt(planDetails.days))
                    const SourceCode = seller && seller.hearingSource && seller.hearingSource.referralCode;
                    let isFreeTrialIncluded = false;
                    let planValidFrom = moment()

                    if (seller && seller.hearingSource && seller.hearingSource.source === 'Uttarakhand' && seller.hearingSource.referralCode === 'UTK1121') {
                        if (seller && seller.planId && seller.planId.isTrial) {
                            const trialCreatedAt = seller.planId && seller.planId.createdAt;
                            const today = moment();
                            const daysFromRegistration = today.diff(moment(trialCreatedAt, 'DD-MM-YYYY'), 'days');
                            const todayDate = new Date();
                            if (daysFromRegistration <= 7) {
                                planExpireDate = todayDate.setDate(todayDate.getDate() + parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration)

                                planDetails.days = `${parseInt(planDetails.days) + parseInt(seller.planId.days) - daysFromRegistration}`

                                isFreeTrialIncluded = true

                                planValidFrom = moment(seller.planId.exprireDate)
                            }
                        }
                    }
                    await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

                    const sellerDetails = {
                        name: orderDetails.name,
                        email: orderDetails.email || seller.email,
                        sellerType: seller.sellerType,
                        groupId: planDetails.groupType,
                        location: seller.location,
                        mobile: seller.mobile
                    }
                    const paymentJson = {
                        ...userData,
                        paymentResponse: paymentResponse,
                        paymentDetails: paymentMethod,
                        paymentSuccess: true
                    }
                    const _p_details = {
                        subscriptionId: planDetails._id,
                        expireStatus: false,
                        name: planDetails.type,
                        price: planDetails.price,
                        usdPrice: planDetails.usdPrice,
                        description: planDetails.description,
                        features: planDetails.features,
                        days: planDetails.days,
                        extendTimes: null,
                        exprireDate: planExpireDate,
                        // subscriptionValidety,
                        hearingSourceCode: SourceCode,
                        isTrial: false,
                        planType: planDetails.type,
                        extendDays: planDetails.days,
                        groupType: planDetails.groupType,
                        billingType: planDetails.billingType,
                        priceUnit: planDetails.priceUnit,
                        type: planDetails.type,
                        currency
                    }
                    const payment = await addPayment(paymentJson)
                    const planData = {
                        ...userData,
                        ..._p_details,
                        isFreeTrialIncluded,
                        planValidFrom,
                        createdAt: new Date(),
                        createdOn: new Date()
                    }

                    const order_details = {
                        ...userData,
                        invoiceNo: _invoice,
                        invoicePath: '',
                        gstNo: orderDetails && orderDetails.gst || null,
                        address: orderDetails && orderDetails.address || null,
                        pincode: orderDetails && orderDetails.pincode || null,
                        country: orderDetails && orderDetails.country || null,
                        sellerDetails: {
                            ...sellerDetails
                        },
                        // sellerPlanId: '', // seller plan collectio id
                        subscriptionId: subscriptionId,
                        // orderPlanId: '', // order items/plans id
                        gst: gstValue,
                        price: price,
                        gstAmount: includedGstAmount.gstAmount,
                        cgstAmount: includedGstAmount.cgstAmount,
                        sgstAmount: includedGstAmount.sgstAmount,
                        total: includedGstAmount.totalAmount,
                        orderedOn: new Date(),
                        hearingSourceCode: SourceCode,
                        // paymentId: '', // payment collection id
                        // paymentStatus: '',
                        ipAddress: orderDetails && orderDetails.ipAddress || null,
                        currency: currency
                        // isEmailSent: ''
                    }
                    const OrdersData = await addOrders(order_details)

                    const orderItem = {
                        ...userData,
                        orderId: OrdersData._id,
                        subscriptionId: planDetails._id,
                        ..._p_details,
                        isFreeTrialIncluded,
                        planValidFrom

                    }
                    const orderItemData = await addOrdersPlans(orderItem)
                    let sellerUpdate = {
                        paidSeller: true,
                        sellerVerified: true,
                    }
                    console.log(existingGroup, '!==', currentGroup, ' Group equality check------')
                    if (existingGroup !== currentGroup) {
                        const sellerType = await getAllSellerTypes(0, 10, { group: parseInt(currentGroup) })
                        const typeSeller = sellerType.map((item) => item._id)
                        sellerUpdate = {
                            ...sellerUpdate,
                            sellerType: typeSeller
                        }
                        deleteProduct = true
                    }
                    const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })
                    if (sellerPlanDetails) {
                        sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData);
                    } else {
                        sellerPlanDetails = await createPlan(planData)
                        sellerUpdate.planId = sellerPlanDetails._id
                    }
                    const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)

                    const planLog = {
                        ...userData,
                        sellerPlanId: sellerPlanDetails._id,
                        subscriptionId: planDetails._id,
                        sellerDetails: { ...sellerDetails },
                        planDetails: {
                            ..._p_details,
                            exprireDate: new Date(_p_details.exprireDate)
                        }
                    }
                    const OrderUpdate = await updateOrder({ _id: OrdersData._id }, { orderPlanId: orderItemData._id, paymentId: payment._id, planId: sellerPlanDetails._id, sellerPlanId: sellerPlanDetails._id })
                    // Generate invoice
                    const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)

                    // const invoice = await createOnebazaarPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth, isFreeTrialIncluded, planValidFrom }, order_details)


                    await addSellerPlanLog(planLog)
                    if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
                        updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                        updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                        console.log('--- Old Service Type Product Status changed-------')
                        // update product deleta status true

                    }

                    // const invoicePath = path.resolve(__dirname, "../../../", "public/orders", order_details.invoiceNo.toString() + '-invoice.pdf')
                    if (currency === 'INR' && checkMobile && isProd && planTo && planFrom && checkPaidSeller) {
                        const msgData = {
                            plan: _p_details.planType,
                            currency: currency,
                            amount: includedGstAmount.totalAmount,
                            url: invoice.Location,
                            name: order_details.invoiceNo.toString() + '-invoice.pdf',
                            till: _p_details.exprireDate,
                            to: planTo,
                            from: planFrom
                        }
                    /* await */ sendSMS(checkMobile, planChanged(msgData))
                    } else if (currency === 'INR' && checkMobile && isProd) {
                        const msgData = {
                            plan: _p_details.planType,
                            currency: currency,
                            amount: includedGstAmount.totalAmount,
                            url: invoice && invoice.Location || null,
                            name: order_details.invoiceNo.toString() + '-invoice.pdf',
                            till: _p_details.exprireDate
                        }
                    /* await */ sendSMS(checkMobile, planSubscription(msgData))
                    } else {
                        console.log("================sms not send===========")
                    }
                    console.log()
                    if (orderDetails && orderDetails.email/* seller && seller.email */ && planTo && planFrom && checkPaidSeller) {
                        let planChangedEmailMsg = planChangedEmail({
                            oldPlanType,
                            newPlanType: _p_details.planType,
                            from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                            till: _p_details.exprireDate,
                            // till: _p_details.subscriptionValidety,
                            url
                        })
                        const message = {
                            from: MailgunKeys.senderMail,
                            to: orderDetails && orderDetails.email || seller.email,
                            subject: 'Plan changed',
                            html: commonTemplate(planChangedEmailMsg),
                        }
                        await sendSingleMail(message)
                    } else {
                        console.log("==============Plan Changed Email Not Send====================")
                    }
                    if (orderDetails && orderDetails.email) {
                        let invoiceEmailMsg = invoiceContent({
                            plan: _p_details.planType,
                            from: isFreeTrialIncluded && planValidFrom ? planValidFrom : new Date(),
                            till: _p_details.exprireDate,
                            price: includedGstAmount.totalAmount,
                            invoiceLink: invoice.Location,
                            cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4,
                            isOneBazzar: true,
                        });
                        const message = {
                            from: MailgunKeys.senderMail,
                            to: orderDetails.email || seller.email,
                            subject: 'Onebazaar Subscription activated successfully',
                            html: commonTemplate(invoiceEmailMsg),
                            // attachment: invoice.attachement,
                            attachments: [{ // stream as an attachment
                                filename: 'invoice.pdf',
                                content: fs.createReadStream(invoice.attachement)
                                // path: invoice.Location,
                            }]
                        }
                        await sendSingleMail(message)
                    } else {
                        console.log("==============Invoice Not Send====================")
                    }
                    await updateOrder({ _id: OrdersData._id }, { isEmailSent: true, invoicePath: invoice && invoice.Location || '' })
                    console.log('------------------ Payment done ---------')
                    return respSuccess(res, { payment: true }, 'subscription activated successfully!')
                } catch (err) {
                    console.log(err);
                }

            } else
                return respSuccess(res, { payment: false }, 'Payment failed')

        }
    } catch (error) {
        console.log(error)
        respError(error)

    }
}