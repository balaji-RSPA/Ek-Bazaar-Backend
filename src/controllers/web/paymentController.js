const mongoose = require('mongoose');
const Razorpay = require('razorpay')
const { subscriptionPlan, } = require("../../modules");
const {
    respSuccess,
    respError
} = require('../../utils/respHadler')
const {
    getSubscriptionPlanDetail,
} = subscriptionPlan;


module.exports.razorPay = async (req, res) => {

    try {

        var instance = new Razorpay({
            key_id: 'rzp_test_jCeoTVbZGMSzfn',
            key_secret: 'V8BiRAAeeqxBVheb0xWIBL8E',
        });
        const { planId } = req.body
        const planDetails = await getSubscriptionPlanDetail({ _id: planId })
        console.log(planDetails, 'test')
        if (planDetails) {

            const result = await instance.orders.create({ amount: (1/* planDetails.price */ * 100).toString(), currency: "INR", receipt: 'order_9A33XWu170gUtm', payment_capture: 0 })
            console.log(result, 'create Order')

            respSuccess(res, result)
        }


    } catch (error) {
        console.log(error)
        respError(error)

    }

}