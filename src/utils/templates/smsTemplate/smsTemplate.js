const moment = require('moment');
const { capitalizeFirstLetter } = require('../../helpers')
const _IS_PROD_ = global.environment === "production"

  module.exports.successfulRegistration = (params) => {
    const successfulMessage = params.userType === 'buyer' ?
      `Dear Customer, 
      Thank you for signing up. 
      We have successfully registered your account on Ekbazaar.com.` :
      `Dear ${params.name},

      Your account has been activated with {#var#} free trial.  
       
      Thank you for choosing Ekbazaar.com`
    return {
      successfulMessage
    };
  }
  module.exports.sendOtp = (params) => {
    
    const otpMessage = params.reset ?
    `${params.otp} is your OTP to reset password at Ekbazaar.com.`
     : 
     "'"+ params.otp +"' is your OTP to complete your mobile number verification at Ekbazaar.com."
    return {
      otpMessage
    }
  }
  
  module.exports.RFQOneToOne = (params) => `You have an enquiry from EkBazaar.com for  ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc}, 
 
  Details below: ${capitalizeFirstLetter(params.name)} 
   
  To view buyer contact details please register or login to trade.ekbazaar.com/signup
  
  Ekbazaar.com`
  
  // `You have an enquiry from EkBazaar.com for ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc}.
  //   Details below: ${capitalizeFirstLetter(params.name)}-
  //   To view buyer contact details please register or login to ${_IS_PROD_ ? "https://www.trade.ekbazaar.com/signup" : "https://tradebazaar.com/signup"}
  //   Ekbazaar-Trade ${_IS_PROD_ ? "https://www.trade.ekbazaar.com" : "https://tradebazaar.com"}`;


  module.exports.RFQOneToOneBuyer = () => `Thank you for submitting your requirement.  
 
  Your enquiry has been forwarded to ${'sellers'}.  
   
  
  Ekbazaar.com`;

  module.exports.removeListingMsg = () => `Dear ${'customer'},

  We have received your request to remove your listing. Your request will be processed within ${7} days. We will contact incase of any information.
  
  Ekbazaar.com`
  // `Dear Customer,\n\n We have received your request. We will contact you within 7 working days and remove your listing.\nThank you.`

  module.exports.businessProfileIncomplete = () => `Dear ${'customer'},

  Please complete your business profile to receive enquiries from buyers. Click {#var#} {#var#} to complete profile.
  
  Ekbazaar.com`
  // `Dear Customer,\n\nPlease complete your business profile to receive enquiries from buyers. https://www.trade.ekbazaar.com/seller/seller-central`;

  module.exports.businessProfileComplete = () => `Dear ${'customer'},

  Thank you for completing your business profile. You are now eligible to receive enquiries from buyers.
  
  Ekbazaar.com`
  // `Dear Customer,\n\n Thank you for completing your business profile. You are now eligible to receive enquiries from buyers.`;
  
  module.exports.planExpiry = (date) => `Dear Customer,\n\n Your free trial is coming to a close and will end on ${moment(date).format("Do MMMM ,YYYY")}. Please subscribe to continue enjoying the benefits. Thank you. Ekbazaar-Trade https://www.trade.ekbazaar.com/seller/seller-central/seller-account`

  module.exports.planSubscription = (params) => `Dear Customer,\n\n Thank you for subscribing to Ekbazaar.com.\nPlan:${params.plan} \nValid From:${moment().format("DD/MM/YYYY")} \nValid Till:${moment(params.till).format("DD/MM/YYYY")} \nAmount Paid:${params.currency}-${params.amount} Click <a href = ${params.url}>${params.name}</a> to download your invoice.`

  module.exports.planChanged = (params) => `Dear Customer,\n\nYour plan has been changed from ${moment(params.from).format("DD/MM/YYYY")} to ${moment(params.to).format("DD/MM/YYYY")}. \nValid From:${moment().format("DD/MM/YYYY")} \nValid Till:${moment(params.till).format("DD/MM/YYYY")} \nAmount Paid:${params.currency}-${params.amount} Click <a href = ${params.url}>${params.name}</a> to download your invoice.Thank you for choosing Ekbazaar.com.`