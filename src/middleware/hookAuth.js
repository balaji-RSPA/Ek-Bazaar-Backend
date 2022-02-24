const crypto = require('crypto')

exports.hookAuth = (req, res, next) => {
    const screat = 'lpMc345sdiucht5';
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