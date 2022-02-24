const crypto = require('crypto')
const { MailgunKeys, razorPayCredentials, stripeApiKeys } = require('../utils/globalConstants')

exports.hookAuth = (req, res, next) => {
    const screat = 'rzr56HlptcCJtlkxzcx';
    const target = crypto.createHmac('sha256', screat);
    target.update(JSON.stringify(req.body));
    const digest = target.digest('hex');

    console.log(digest, "=======================", req.headers['x-razorpay-signature']);
    if (digest === req.headers['x-razorpay-signature']) {
        console.log('------Signature Match------');
        next();
    } else {
        console.log('Signature is not matching....');
        next();
    }
}