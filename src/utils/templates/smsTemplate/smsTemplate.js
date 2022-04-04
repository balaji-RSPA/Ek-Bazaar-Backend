const moment = require('moment');
const { capitalizeFirstLetter } = require('../../helpers')
const _IS_PROD_ = global.environment === "production"
// const signInLink = _IS_PROD_ ? 'https://trade.ekbazaar.com/signin' : 'https://tradebazaar.tech-active.com/signin'

module.exports.successfulRegistration = (params) => {
  // Your account has been activated with ${params.promoCode ? "90" : "30"} days free trial.
  const successfulMessage = params.userType === 'buyer' ?
    `Dear Customer,
    Thank you for signing up.
    We have successfully registered your account on Ekbazaar.com.` 
    :
    `Dear ${params.name}, Your account has been activated with Ekbazaar.com. Thank you for choosing our platform for growing your business`
  return {
    successfulMessage, templateId: params.userType === "buyer" ? "1707161760855637940" : /* "1707161760972078390" */"1707164724891341855"
  };
}
module.exports.sendOtp = (params) => {

  const otpMessage = params.reset ?
    `${params.otp} is your OTP to reset password at Ekbazaar.com.`
    // `${params.otp} is your OTP to complete your mobile number verification at Ekbazaar.com.`
    :
    // `${params.otp} is your OTP to complete your mobile number verification at Ekbazaar.com.`
    `“Dear Customer, ${params.otp} is the verification code to register or login for ekbazaar.com. Verification code is valid only for 30 minutes."`
    // "'" + params.otp + "' is your OTP to complete your mobile number verification at Ekbazaar.com."
  return {
    otpMessage, templateId: params.reset ? "1707161760961818887" : "1707160102358853974"
  }
}

// `You have an enquiry from EkBazaar.com for  ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc},

// Details below: ${capitalizeFirstLetter(params.name)}

// To view buyer contact details please register or login to trade.ekbazaar.com/signup

// Ekbazaar.com`

// Note: Please complete registration on www.trade.ekbazaar.com/signup to get more inquiries`


module.exports.RFQOneToOne = (params) => ({message: `You have an enquiry from EkBazaar.com for  ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc},

  Details below: ${capitalizeFirstLetter(params.name)}

  To view buyer contact details please register or login to trade.ekbazaar.com/signup

  Ekbazaar.com`, templateId: "1707161760988707150"})
// `You have an enquiry from EkBazaar.com for ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc}.
//   Details below: ${capitalizeFirstLetter(params.name)}-
//   To view buyer contact details please register or login to ${_IS_PROD_ ? "https://www.trade.ekbazaar.com/signup" : "https://tradebazaar.com/signup"}
//   Ekbazaar-Trade ${_IS_PROD_ ? "https://www.trade.ekbazaar.com" : "https://tradebazaar.com"}`;


module.exports.RFQOneToOneBuyer = (params) => ({message: `Dear ${params.buyerName}, Your enquiry has been submitted to the seller. Please find the seller contact details

Seller Name: ${params.sellerName}
Phone: ${params.sellerPhone}

EKBAZAAR.COM`, templateId: "1707162874515721885"});

module.exports.removeListingMsg = () => ({message: `Dear ${'customer'},

  We have received your request to remove your listing. Your request will be processed within ${7} days. We will contact incase of any information.

  Ekbazaar.com`, templateId: "1707161761063408239"})
// `Dear Customer,\n\n We have received your request. We will contact you within 7 working days and remove your listing.\nThank you.`

module.exports.businessProfileIncomplete = () => ({message: `Dear ${'customer'},

  Please complete your business profile to receive enquiries from buyers. Click {#var#} {#var#} to complete profile.

  Ekbazaar.com`, templateId: "1707161761045734248"})
// `Dear Customer,\n\nPlease complete your business profile to receive enquiries from buyers. https://www.trade.ekbazaar.com/seller/seller-central`;

module.exports.businessProfileComplete = () => ({message: `Dear ${'customer'},

  Thank you for completing your business profile. You are now eligible to receive enquiries from buyers.

  Ekbazaar.com`, templateId: "1707161761052033746"})
// `Dear Customer,\n\n Thank you for completing your business profile. You are now eligible to receive enquiries from buyers.`;

module.exports.planExpiry = (date) => `Dear Customer,\n\n Your free trial is coming to a close and will end on ${moment(date).format("Do MMMM ,YYYY")}. Please subscribe to continue enjoying the benefits. Thank you. Ekbazaar-Trade https://trade.ekbazaar.com/seller/seller-central/seller-account`

module.exports.planSubscription = (params) => `Dear Customer,\n\n Thank you for subscribing to Ekbazaar.com.\nPlan:${params.plan} \nValid From:${moment().format("DD/MM/YYYY")} \nValid Till:${moment(params.till).format("DD/MM/YYYY")} \nAmount Paid:${params.currency}-${params.amount} Click <a href = ${params.url}>${params.name}</a> to download your invoice.`

module.exports.planChanged = (params) => `Dear Customer,\n\nYour plan has been changed from ${moment(params.from).format("DD/MM/YYYY")} to ${moment(params.to).format("DD/MM/YYYY")}. \nValid From:${moment().format("DD/MM/YYYY")} \nValid Till:${moment(params.till).format("DD/MM/YYYY")} \nAmount Paid:${params.currency}-${params.amount} Click <a href = ${params.url}>${params.name}</a> to download your invoice.Thank you for choosing Ekbazaar.com.`

module.exports.partialRegistred = (params) => ({messagePartial:`Dear ${params.name} , Please complete your registration in-order to receive business enquiries from buyers. https://trade.ekbazaar.com/signin Ekbazaar.com`,templateId:'1707162919188812931'})