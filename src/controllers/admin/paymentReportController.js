const mongoose = require('mongoose');
const { respSuccess, respError } = require("../../utils/respHadler");
const { sellers, buyers, category, mastercollections, Payments } = require("../../modules");
const Papa = require('papaparse')
const fs = require('fs');
const path = require('path');

const { findPayments} = Payments

const { razorPayCredentials } = require('../../utils/globalConstants');
const Razorpay = require("razorpay");



module.exports.getCancledSubscriptionUsers = async (req, res) => {
    try {
        const totelCount = 1000;
        let skip = 0;
        let totelCancledSub = [];

        for (let i = 0; i <= totelCount; i += 100) {
            skip = i
            
            var instance = new Razorpay({
                key_id: razorPayCredentials.key_id, //'rzp_test_jCeoTVbZGMSzfn',
                key_secret: razorPayCredentials.key_secret, //'V8BiRAAeeqxBVheb0xWIBL8E',
            });

            const res = await instance.subscriptions.all({ count: 100, skip });

            const { items } = res;
            const cancelled = items.filter((sb) => {
                return sb.status === 'cancelled'
            })
            totelCancledSub = [...totelCancledSub, ...cancelled]
        }
        const subArr = totelCancledSub.map((cs) => cs.id)
        console.log(subArr.length, "##################");

        let query = { isSubscription: true, "paymentResponse.razorpay_subscription_id": { $in: subArr}}
        const responce = await findPayments(query);

        console.log(responce.length,'@@@@@@@@@@@@');
        let reportObjArr = responce.map((cancleUser)=>{
            let subscriptionId = cancleUser && cancleUser.paymentResponse && cancleUser.paymentResponse.razorpay_subscription_id;
            let userName = cancleUser && cancleUser.orderId && cancleUser.orderId.sellerDetails && cancleUser.orderId.sellerDetails.name;
            let userEmail = cancleUser && cancleUser.orderId && cancleUser.orderId.sellerDetails && cancleUser.orderId.sellerDetails.email;
            let mobile = cancleUser && cancleUser.orderId && cancleUser.orderId.sellerDetails && cancleUser.orderId.sellerDetails.mobile && cancleUser.orderId.sellerDetails.mobile.length && cancleUser.orderId.sellerDetails.mobile[0].mobile

            return { subscriptionId, userName, userEmail, mobile}
        })

        console.log(reportObjArr.length,"$$$$$$$$$$$$$$$$$")

        const FilePath = `cancleSubscriptionUser-list-${new Date()}.csv`
        const FileSource = 'public/sellerDetailFiles/' + FilePath

        // console.log(expiredTrialSeller.length, "produts.length");
        if (reportObjArr.length) {

            const csv = Papa.unparse(reportObjArr, {
                quotes: false, //or array of booleans
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ",",
                header: true,
                newline: "\r\n",
                skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                columns: null, //or array of strings
            });
            fs.writeFile(path.resolve(__dirname, '../../../public/sellerDetailFiles', FilePath), csv, (err, data) => {
                console.log(err, "Completed data", data)
            })
        }

        

    } catch (error) {
        // respError(res, error.message);
        console.log(error,"###########");
    }
};