const { MailgunKeys, razorPayCredentials, stripeApiKeys } = require('../utils/globalConstants')

exports.hookAuth = (req, res, next) => {
    const mySecret = 'test56849';
    // const mySecret = razorPayCredentials.key_secret
        razorpay = require("razorpay")
    let signature = req.headers['x-razorpay-signature'];
    console.log("🚀 ~ file: hookAuth.js ~ line 8 ~ signature", signature)
    // const target = crypto.createHmac('sha256', screat);
    // target.update(JSON.stringify(req.body));
    // const digest = target.digest('hex');

    // let digest = crypto.createHmac('sha256', mySecret)
    //     .update(JSON.stringify(req.body))
    //     .digest('hex');

    let digest = razorpay.validateWebhookSignature(req.body, signature, mySecret);
    console.log(digest, " =====================================", req.headers['x-razorpay-signature']);

    // console.log(digest, "=======================", req.headers['x-razorpay-signature']); 
    if (digest) {
        console.log('------Signature Match------');
        next();
    } else {
        console.log('Signature is not matching....');
        next();
    }
}