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
const { MailgunKeys, razorPayCredentials } = require('../../utils/globalConstants')
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

const { getSellerProfile, updateSeller } = sellers
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans
const { addOrders, updateOrder } = Orders
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
            expireDate: plan && moment(new Date(plan.exprireDate)).format('DD/MM/YYYY'),
            invoiceNumber: orderDetails && orderDetails.invoiceNo || '',
            // currency: orderDetails && orderDetails.currency || '',
            currency: orderDetails && orderDetails.currency === 'INR' ? "₹" : '$' || '',
            currencyInWords: toWords.convert(orderDetails && orderDetails.total/* , { currency: true } */),
            country: orderDetails && orderDetails.country || '',
            currencyFlag: orderDetails && orderDetails.currency === 'INR' ? true : ''

        }
        const html = fs.readFileSync(path.resolve(__dirname, '../../..', 'src/utils/templates/invoice', 'invoiceTemplate.html'), 'utf8');
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
        const invoiceFileName = orderDetails && orderDetails.invoiceNo.toString() + '-invoice.pdf'
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

module.exports.createRazorPayOrder = async (req, res) => {

    try {
        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
        });
        const { planId, pincode, currency } = req.body
        let findpincode = currency === 'INR' ? await findPincode({ pincode }) : '';
        if (!findpincode && currency === 'INR') {
            respError(res, "Invalid pincode");
        } else {
            const planDetails = await getSubscriptionPlanDetail({ _id: planId })
            // console.log(planDetails, 'test')
            if (planDetails) {
                const gstValue = 18
                const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Annually" ? 12 : ''

                const pricePerMonth = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
                const price = pricePerMonth /* * parseInt(months) */
                const includedGstAmount = await CalculateGst(price, findpincode, currency);
                // const gstAmount = (parseFloat(price) * gstValue) / 100
                // const totalAmount = parseFloat(price) + gstAmount

                const result = await instance.orders.create({ amount: parseInt((includedGstAmount.totalAmount * 100).toFixed(2)).toString(), currency, receipt: 'order_9A33XWu170gUtm', payment_capture: 0 })
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
        const { sellerId, subscriptionId, orderDetails, userId, paymentResponse, currency } = req.body
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

                const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Annually" ? 12 : ''
                const pricePerMonth = planDetails && (currency === 'INR' ? planDetails.price : planDetails.usdPrice)
                const price = pricePerMonth/*  * parseInt(months) */
                const includedGstAmount = await CalculateGst(price, findpincode, currency);
                console.log("🚀 ~ gggggggggggggggggggg  -------", includedGstAmount)

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
                        const planExpireDate = dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days))
                        await updateInvoiceNumber({ id: 1 }, { invoiceNumber: parseInt(invoiceNumner.invoiceNumber) + 1 })

                        const sellerDetails = {
                            name: orderDetails.name,
                            email: seller.email,
                            sellerType: seller.sellerType,
                            groupId: planDetails.groupType,
                            location: seller.location,
                            mobile: seller.mobile
                        }
                        const paymentJson = {
                            ...userData,
                            paymentResponse: paymentResponse,
                            paymentDetails: JSON.parse(body),
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
                            ..._p_details
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
                        const invoice = await createPdf(seller, { ..._p_details, totalPlanPrice: price, pricePerMonth }, order_details)
                        console.log(invoice, ' Invoice file path')

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
                        if (seller && seller.email && planTo && planFrom && checkPaidSeller) {
                            let planChangedEmailMsg = planChangedEmail({
                                oldPlanType,
                                newPlanType: _p_details.planType,
                                expiryDate: sellerPlanDetails && sellerPlanDetails.exprireDate,
                                url
                            })
                            const message = {
                                from: MailgunKeys.senderMail,
                                to: seller.email,
                                subject: 'Plan changed',
                                html: commonTemplate(planChangedEmailMsg),
                            }
                         /* await */ sendSingleMail(message)
                        } else {
                            console.log("==============Plan Changed Email Not Send====================")
                        }
                        if (seller && seller.email) {
                            let invoiceEmailMsg = invoiceContent({
                                plan: _p_details.planType,
                                till: _p_details.exprireDate,
                                price: includedGstAmount.totalAmount,
                                invoiceLink: invoice.Location,
                                cardNo: paymentJson.paymentDetails && paymentJson.paymentDetails.card && paymentJson.paymentDetails.card.last4
                            });
                            const message = {
                                from: MailgunKeys.senderMail,
                                to: seller.email,
                                subject: 'Ekbazaar Subscription activated successfully',
                                html: commonTemplate(invoiceEmailMsg),
                                attachment: invoice.attachement
                                // attachments: [{ // stream as an attachment
                                //     filename: 'invoice.pdf',
                                //     path: invoice.Location
                                // }]
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
                });
            } else
                return respSuccess(res, { payment: false }, 'Payment failed')

        }
    } catch (error) {
        console.log(error)
        respError(error)

    }
}
