const moment = require('moment');
const { capitalizeFirstLetter } = require('../../helpers')
const { imageURLS } = require('../../globalConstants')
const { registrationthanks, otpverification, passwordUpdated, invoice, planExpired, planExpiring, planChange, enquiry, announcements } = imageURLS

module.exports.emailSuccessfulRegistration = (params) => { //userType
  let message = {
    title: 'Ekbazaar Trade- Successful Registration',
    image: registrationthanks,
    body: params.userType === 'seller' ? 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.' : 'Thank you for registering.',
    greeting: `Hello ${params.name},`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink: `${params.url}/signin`,
    extraTitle: 'Have a question?',
    extracontent1: `Please <a href='${params.url}/contact'>contact our team</a> via direct messaging or email. <p>We would be happy to help you.</p>`,
    extracontent2: 'Thank you for choosing EkBazaar. We hope you enjoy our services.'
  }
  return message;
}
module.exports.otpVerification = (params) => {
  let message = {
    title: 'Ekbazaar Trade- OTP Verification',
    image: otpverification,
    body: `<p>Your one time password is <strong>${params.otp}<strong>.</p><p>Please enter the code and proceed with setting up a new password for your account.</p>`
  }
  return message;
}
module.exports.passwordUpdate = (params) => {
  let message = {
    title: 'Ekbazaar Trade- Password Updated',
    image: passwordUpdated,
    body: `<p><strong>Hello ${params.name},<strong></p><p>Your password has been changed recently. Please use the updated password to login to your account.</p>`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink: `${params.url}`,
    extracontent1: `<p style="text-align:center;margin-top: -13px;">If you did not make the change. <a href='${params.url}/contact'>Please contact support.</a></p>`
  }
  return message;
}
module.exports.contactus = (params) => {
  let message = {
    title: `Support request received ${params.id}`,
    image: passwordUpdated,
    body: '<p>Your message has been received and will be soon answered by our support team.</p><br /><p>Thank you for choosing EkBazaar</p>',
  }
  return message;
}
module.exports.invoiceContent = (params) => {
  let message = {
    title: 'Ekbazaar Trade- Invoice',
    image: invoice,
    body: `<p style="text-align: left">Thank you for subscribing to EkBazaar. The credit card ending x${params.cardNo} has been successfully charged Rs ${params.price}. A copy of receipt is also present in your EkBazaar account details.</p>
    <p style="text-align: left">Plan       : ${params.plan}</p>
    <p style="text-align: left">Valid from : ${moment().format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>`,
    buttonName: 'VIEW FULL INVOICE',
    buttonLink: params.invoiceLink,
    extracontent1: `<p style="text-align: center; margin-top:-13px;">Thank you for choosing EkBazaar</p>`
  }
  return message;
}
module.exports.planExpired = (params) => {
  let message = '';
  if (params.isTrial) {
    message = {
      title: 'Ekbazaar Trade- Plan Expired',
      image: planExpired,
      body: `<p>Your free trial plan has expired on ${moment(params.date).format("Do MMMM YYYY")}.</p><p>You can continue using our services by simply completing your subscription.</p>`,
      buttonName: 'SUBSCRIBE',
      buttonLink: `${params.url}`
    }
  } else {
    message = {
      title: 'Ekbazaar Trade- Plan Expired',
      image: planExpired,
      body: `<p>Your plan has expired. Please renew your plan</p>`,
      buttonName: 'SUBSCRIBE',
      buttonLink: `${params.url}`
    }
  }
  return message;
}
module.exports.planExpiring = (params) => {
  let message = ''
  if (params.isTrial && params.dayDiff) {
    message = {
      title: 'Ekbazaar Trade- Plan About To Expire',
      image: planExpiring,
      body: `<p>We hope you’re enjoying your free trial.</p><p>Unfortunately, your free trial period is about to expire in ${params.dayDiff} days and will officially end on ${moment(params.date).format('Do MMMM YYYY')}.</p><p>You can continue using our services by simply subscribing to one of our affordable plans.</p>`,
      buttonName: 'PRICING PLANS',
      buttonLink: `${params.url}`
    }
  } else if (params.dayDiff && params.isTrial === false) {
    message = {
      title: 'Ekbazaar Trade- Plan About To Expire',
      image: planExpiring,
      body: `<p>Your plan is about to expire in ${params.dayDiff} days.Please renew your plan</p>`,
      buttonName: 'PRICING PLANS',
      buttonLink: `${params.url}`
    }
  } else {
    message = {
      title: 'Ekbazaar Trade- Plan About To Expire',
      image: planExpiring,
      body: `<p>Your Plan is Expiring Today! Please Renew to access the benefits of a Subscriber</p>`,
      buttonName: 'PRICING PLANS',
      buttonLink: `${params.url}`
    }
  }

  return message;
}
module.exports.RfpEnquiryReceived = (params) => {
  let message = {
    title: 'Ekbazaar Trade- Enquiry Received',
    image: enquiry,
    body: `<p>You have an enquiry for (${capitalizeFirstLetter(params.productDetails.name.name)}, ${params.productDetails.quantity}${capitalizeFirstLetter(params.productDetails.weight)}) from (${params._loc}) by (${capitalizeFirstLetter(params.name)}) on ${moment().format('Do MMM YYYY')}.</p>`,
    buttonName: 'VIEW BUYER DETAILS',
    buttonLink: `${params.url}/seller/seller-central/enquiry?sellerId=${params.sellerId}&skip=0&limit=10`,
    extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing EkBazaar</p>`
  }
  return message;
}
module.exports.RfpEnquirySend = () => {
  let message = {
    title: 'Ekbazaar Trade- Requirement Sent',
    image: passwordUpdated,
    body: `<p>Thank you for submitting your requirements. The seller shall contact you on your shared contact details.</p>`,
  }
  return message;
}
module.exports.planChangedEmail = (params) => {
  console.log("🚀 ~ file: emailTemplateContent.js ~ line 132 ~ params", params)
  let message = {
    title: 'Ekbazaar Trade- Plan changed',
    image: planChange,
    body: `<p style="text-align: left">Your plan has been changed from ${params.oldPlanType} to ${params.newPlanType}.</p>
    <p style="text-align: left">Valid from : ${moment(params.from).format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>
    `,
    buttonName: 'VIEW YOUR PLAN',
    buttonLink: `${params.url}/seller/seller-central/seller-account?skip=0&limit=10&tab=3`,
    extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing EK Bazaar. Have a good day.</p>`
  }
  return message;
}
module.exports.listingRemovalReq = () => {
  let message = {
    title: 'Ekbazaar Trade- Listing Removal Request',
    image: announcements,
    // body: `<p>Thank you.</p><p>We will contact you within 7 working days and remove your listing.</p>`,
    body: `<p>Your request for removing your product listing has been received. We shall contact you shortly in this regard and take necessary action.</p>`,
  }
  return message;
}
module.exports.partialSellerRegistration = (params) => {
    let message = {
    title: 'Ekbazaar Trade - Incomplete Registration',
    body: `<p>Please complete your registration in-order to receive business enquiries from buyers.</p>`,
    buttonName: 'Complete your registration',
    buttonLink: `${params.url}/seller/seller-central/bussiness-profile`,
  }  
  return message;
}