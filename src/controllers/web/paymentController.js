const mongoose = require('mongoose');
const Razorpay = require('razorpay')
const axios = require("axios")
const request = require('request');
const { subscriptionPlan, sellers, Orders, Payments, SellerPlans, SellerPlanLogs, category, sellerProducts, mastercollections } = require("../../modules");
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

const { getSellerProfile, updateSeller } = sellers
const { getSellerPlan, createPlan, updateSellerPlan } = SellerPlans
const { addOrders, updateOrder } = Orders
const { addPayment, updatePayment } = Payments
const { addSellerPlanLog } = SellerPlanLogs
const { getAllSellerTypes } = category
const { updateSellerProducts } = sellerProducts
const { updateMasterBulkProducts } = mastercollections


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
            const gstValue = 18
            const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Annually" ? 12 : ''
            const pricePerMonth = planDetails && planDetails.price
            const price = pricePerMonth * parseInt(months)
            const gstAmount = (parseInt(price) * gstValue) / 100
            const totalAmount = parseInt(price) + gstAmount

            const result = await instance.orders.create({ amount: (totalAmount * 100).toString(), currency: "INR", receipt: 'order_9A33XWu170gUtm', payment_capture: 0 })
            // console.log(result, 'create Order')

            respSuccess(res, { ...result, key_id: razorPayCredentials.key_id })
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
        const gstValue = 18
        let deleteProduct = false
        console.log(req.body, ' order details--------')
        // console.log(req.params, ' pppppppppppppppppp')
        let seller = await getSellerProfile(sellerId)
        const planDetails = await getSubscriptionPlanDetail({ _id: subscriptionId })
        if (planDetails && seller && seller.length) {
            seller = seller[0]
            const existingGroup = seller.sellerType[0].group
            const currentGroup = planDetails.groupType

            let sellerPlanDetails = seller && seller.planId ? await getSellerPlan({ _id: seller.planId }) : null

            const months = planDetails && planDetails.type === "Quarterly" ? 3 : planDetails.type === "Annually" ? 12 : ''
            const pricePerMonth = planDetails && planDetails.price
            const price = pricePerMonth * parseInt(months)
            const gstAmount = (parseInt(price) * gstValue) / 100
            const totalAmount = parseInt(price) + gstAmount

            console.log(months, "-------", pricePerMonth, "-------", price, "-------", gstAmount, "-------", totalAmount)

            request({
                method: 'POST',
                url: `https://${razorPayCredentials.key_id}:${razorPayCredentials.key_secret}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
                form: {
                    amount: (totalAmount * 100),
                    currency: 'INR'
                }
            }, async function (error, response, body) {

                console.log('Status:', response.statusCode);
                // console.log('Headers:', JSON.stringify(response.headers));
                console.log('Response:', body);
                // respSuccess(res, body)
                const userData = {
                    userId: seller.userId,
                    sellerId: seller._id,
                }
                if (response.statusCode === 200) {
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
                        type: planDetails.type,
                    }
                    const payment = await addPayment(paymentJson)
                    const planData = {
                        ...userData,
                        ..._p_details,
                        createdAt: new Date(),
                        createdOn: new Date()
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
                        gst: gstValue,
                        price: price,
                        gstAmount: gstAmount,
                        total: totalAmount,
                        orderedOn: new Date(),
                        // paymentId: '', // payment collection id
                        // paymentStatus: '',
                        ipAddress: orderDetails && orderDetails.ipAddress || null,
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
                    let sellerUpdate = {
                        paidSeller: true,
                        sellerVerified: true
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
                    const sellerUpdateData = await updateSeller({ _id: seller._id }, sellerUpdate)
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
                    if (deleteProduct === true && seller.sellerProductId && seller.sellerProductId.length) {
                        updateSellerProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                        updateMasterBulkProducts({ _id: { $in: seller.sellerProductId } }, { isDeleted: true })
                        console.log('--- Old Service Type Product Status changed-------')
                        // update product deleta status true

                    }


                    if (seller && seller.email) {
                        const message = {
                            from: MailgunKeys.senderMail,
                            to: seller.email,
                            subject: 'Ekbazaar Subscription activated successfully',
                            html: `<p>Your Subscription plan activated successfully!</p><p>Service type: ${currentGroup === 1 ? "Manufacturers/Traders" : currentGroup === 2 ? "Farmer" : " Service"}</p><p>Plan Type: ${planDetails.type}</p><p>Price/Month : ${pricePerMonth}</p><p>Price : ${price}</p><p>GST(18%) : ${gstAmount}</p><p>Total : ${totalAmount}</p>`
                        }
                        await sendSingleMail(message)
                        await updateOrder({ _id: OrdersData._id }, { isEmailSent: true })
                    }
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

    } catch (error) {
        console.log(error)
        respError(error)

    }
}