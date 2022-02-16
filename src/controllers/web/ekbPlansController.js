const { respSuccess, respError } = require("../../utils/respHadler");
const { MailgunKeys, razorPayCredentials, stripeApiKeys } = require('../../utils/globalConstants');
const Razorpay = require('razorpay')



module.exports.createPlans = async (req, res) => {
    try {
        console.log("In create Plans");
        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
        });

        const result = instance.plans.create({
            period: "monthly",
            interval: 1,
            item: {
                name: "Farmer Quarterly Plan",
                amount: 10000,
                currency: "INR",
                description: "Plan is for Farmers"
            },
            notes: {
                notes_key_1: "User can use this plan",
                notes_key_2: "Must use it"
            }
        })

        console.log(result);
        respSuccess(res,result,"Plan created")
    } catch (error) {
        respError(res, error.message);
    }
};