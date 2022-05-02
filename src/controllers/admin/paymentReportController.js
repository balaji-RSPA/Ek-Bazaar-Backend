const mongoose = require('mongoose');
const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers, buyers, category, mastercollections } = require("../../modules");

const { razorPayCredentials } = require('../../utils/globalConstants')



module.exports.getCancledSubscriptionUsers = async (req, res) => {
    try {
        var instance = new Razorpay({
            key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
            key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
        });

        const res = instance.subscriptions.all({ count:100});

        console.log(res,"##################");

    } catch (error) {
        respError(res, error.message);
    }
};