const mongoose = require('mongoose');
const Razorpay = require('razorpay')
const axios = require("axios")
const request = require('request');
const { subscriptionPlan, sellers, Orders, Payments, SellerPlans, SellerPlanLogs } = require("../../modules");
const { sendSingleMail } = require('../../utils/mailgunService')
const { MailgunKeys, razorPayCredentials } = require('../../utils/globalConstants')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const { addOrdersPlans } = require('../../modules/ordersModule');
const {
    getSubscriptionPlanDetail,
} = subscriptionPlan;

const { getSellerProfile } = sellers
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans
const { addOrders, updateOrder } = Orders
const { addPayment, updatePayment } = Payments
const { addSellerPlanLog } = SellerPlanLogs


module.exports.createRazorPayOrder = async (req, res) => {

    try {

        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret,//'V8BiRAAeeqxBVheb0xWIBL8E',
        });
        const { planId } = req.body
        const planDetails = await getSubscriptionPlanDetail({ _id: planId })
        // console.log(planDetails, 'test')
        if (planDetails) {

            const result = await instance.orders.create({ amount: (1/* planDetails.price */ * 100).toString(), currency: "INR", receipt: 'order_9A33XWu170gUtm', payment_capture: 0 })
            // console.log(result, 'create Order')

            respSuccess(res, result)
        }


    } catch (error) {
        console.log(error)
        respError(error)

    }

}

module.exports.captureRazorPayPayment = async (req, res) => {

    try {
        const { sellerId, subscriptionId, orderDetails, userId, paymentResponse } = req.body
        const dateNow = new Date();
        console.log(req.body, ' bbbbbbbbbbbbbbbb')
        // console.log(req.params, ' pppppppppppppppppp')
        let seller = await getSellerProfile(sellerId)
        const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })
        if (planDetails && seller && seller.length) {
            seller = seller[0]
            let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null

            const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Annually" ? 12 : ''
            const pricePerMonth = planDetails && planDetails.price
            const price = pricePerMonth * parseInt(months)
            const gstAmount = (parseInt(price) * 18) / 100
            const totalAmount = parseInt(price) + gstAmount
            console.log(months, "-------", pricePerMonth, "-------", price, "-------", gstAmount, "-------", totalAmount)

            // request({
            //     method: 'POST',
            //     url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
            //     form: {
            //         amount: 100, //totalAmount,
            //         currency: 'INR'
            //     }
            // }, function (error, response, body) {
            //     console.log('Status:', response.statusCode);
            //     console.log('Headers:', JSON.stringify(response.headers));
            //     console.log('Response:', body);
            //     respSuccess(res, body)
            // });

            const body = {
                "id": "pay_GYxlgxH6zURQ4K",
                "entity": "payment",
                "amount": 100,
                "currency": "INR",
                "status": "captured",
                "order_id": "order_GYxla9vyWBPpbO",
                "invoice_id": null,
                "international": false,
                "method": "card",
                "amount_refunded": 0,
                "refund_status": null,
                "captured": true,
                "description": "List up to 20 products/services, add business details, contact interested buyers directly",
                "card_id": "card_GYxlh1ce6JIa6t",
                "card": {
                    "id": "card_GYxlh1ce6JIa6t",
                    "entity": "card",
                    "name": "Harshil Mathur",
                    "last4": "0008",
                    "network": "MasterCard",
                    "type": "unknown",
                    "issuer": "",
                    "international": false,
                    "emi": false,
                    "sub_type": "consumer"
                },
                "bank": null,
                "wallet": null,
                "vpa": null,
                "email": "ramesh123@active.agency",
                "contact": "+919916905753",
                "notes": [],
                "fee": 2,
                "tax": 0,
                "error_code": null,
                "error_description": null,
                "error_source": null,
                "error_step": null,
                "error_reason": null,
                "acquirer_data": {
                    "auth_code": "586886"
                },
                "created_at": 1612761832
            }
            const userData = {
                userId: seller.userId,
                sellerId: seller._id,
            }
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
                paymentDetails: body
            }
            const _p_details = {
                subscriptionId: planDetails._id,
                expireStatus: false,
                name: planDetails.type,
                price: planDetails.price,
                description: planDetails.description,
                features: planDetails.features,
                days: planDetails.days,
                extendTimes: null,
                exprireDate: dateNow.setDate(dateNow.getDate() + parseInt(planDetails.days)),
                isTrial: false,
                planType: planDetails.type,
                extendDays: planDetails.days,
                groupType: planDetails.groupType,
                billingType: planDetails.billingType,
                priceUnit: planDetails.priceUnit,
                type: planDetails.type
            }
            const payment = await addPayment(paymentJson)
            const planData = {
                ...userData,
                ..._p_details
            }

            const orderdetails = {
                ...userData,
                invoiceNo: '',
                invoicePath: '',
                gstNo: orderDetails && orderDetails.gst || null,
                sellerDetails: {
                    ...sellerDetails
                },
                // sellerPlanId: '', // seller plan collectio id
                subscriptionId: subscriptionId,
                // orderPlanId: '', // order items/plans id
                price: price,
                gstAmount: gstAmount,
                total: totalAmount,
                orderedOn: new Date(dateNow),
                // paymentId: '', // payment collection id
                // paymentStatus: '',
                // ipAddress: '',
                // isEmailSent: ''
            }
            const OrdersData = await addOrders(orderdetails)

            const orderItem = {
                ...userData,
                orderId: OrdersData._id,
                subscriptionId: planDetails._id,
                ..._p_details
            }
            const orderItemData = await addOrdersPlans(orderItem)
            const patmentUpdate = await updatePayment({ _id: payment._id }, { orderId: OrdersData._id })

            if (sellerPlanDetails) {

                sellerPlanDetails = await updateSellerPlan({ _id: sellerPlanDetails._id }, planData)

            } else {
                sellerPlanDetails = await createPlan(planData)
            }

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
            await addSellerPlanLog(planLog)
            if (seller && seller.email) {
                const message = {
                    from: MailgunKeys.senderMail,
                    to: seller.email,
                    subject: 'Ekbazaar Subscription activated successfully',
                    html: `<p>Your Subscription plan activated successfully!</p>`
                }
                await sendSingleMail(message)
                await updateOrder({ _id: OrdersData._id }, { isEmailSent: true })
            }
            respSuccess(res, 'Updated successfully!')
        }
        respSuccess()

        // request({
        //     method: 'POST',
        //     url: `https://rzp_test_jCeoTVbZGMSzfn:V8BiRAAeeqxBVheb0xWIBL8E@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
        //     form: {
        //         amount: 100,
        //         currency: 'INR'
        //     }
        // }, function (error, response, body) {
        //     console.log('Status:', response.statusCode);
        //     console.log('Headers:', JSON.stringify(response.headers));
        //     console.log('Response:', body);
        //     respSuccess(res, body)
        // });

    } catch (error) {
        console.log(error)
        respError(error)

    }
}