const moment = require('moment');
const { capitalizeFirstLetter } = require('../../helpers')
module.exports.emailSuccessfulRegistration = (params) => {
  let message = {
    title : 'Welcome',
    image: 'https://ekbazaar.tech-active.com/assets/images/registrationthanks.png',
    body: 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.',
    greeting:`Hello ${params.name},`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink: `${params.url}/signin`,
    extraTitle: 'Have a question?',
    extracontent1: `Please <a href='${params.url}/contact'>contact our team</a> via direct messaging or email. We would be happy to help you.`,
    extracontent2: 'Thank you for choosing EkBazaar. We hope you enjoy our services.'
  }
  return message;
}
module.exports.otpVerification = (params) =>{
  let message = {
    title: 'OTP Verification',
    image: 'https://ekbazaar.tech-active.com/assets/images/passwordreset.png',
    body: `<p>Your one time password is <strong>${params.otp}<strong>.</p><p>Please enter the code and proceed with setting up a new password for your account.</p>`
  }
  return message;
}
module.exports.passwordUpdate = (params) => {
  let message = {
    title: 'Password Updated',
    image: 'https://ekbazaar.tech-active.com/assets/images/success.png',
    body: `<p><strong>Hello ${params.name},<strong></p><p>Your password has been changed recently. Please use the updated password to login to your account.</p>`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink: `${params.url}/signin`,
    extracontent1: `If you did not make the change. <a href='${params.url}/contact'>Please contact support.</a>`
  }
  return message;
}
module.exports.contactus = () => {
  let message = {
    title:'Support Request Received',
    image: 'https://ekbazaar.tech-active.com/assets/images/success.png',
    body: '<p>Your message has been received and will be soon answered by our support team.</p><br /><p>Thank you for choosing EkBazaar</p>',
  }
  return message;
}
module.exports.invoiceContent = (params) => {
  let message = {
    title: '',
    image: 'https://ekbazaar.tech-active.com/assets/images/invoice.png',
    body: `<p style="text-align: left">Thank you for subscribing to EkBazaar. The credit card ending xxxxx has been successfully charged Rs ${params.price}. A copy of receipt is also present in your EkBazaar account details.</p>
    <p style="text-align: left">Plan       : ${params.plan}</p>
    <p style="text-align: left">Valid from : ${moment().format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>`,
    buttonName: 'VIEW FULL INVOICE',
    buttonLink: params.invoiceLink,
    extracontent1: `<p style="text-align: center">Thank you for choosing EkBazaar</p>`
  }
  return message;
}
module.exports.planExpired = (params)=>{
  let message = {
    title: 'Plan Expired',
    image: 'https://ekbazaar.tech-active.com/assets/images/planExpired.png',
    body: `<p>Your free trial plan has expired on ${moment(params.date).format("Do MMMM YYYY")}.</p><p>You can continue using our services by simply completing your subscription.</p>`,
    buttonName: 'SUBSCRIBE',
    buttonLink: `${params.url}`
  }
  return message;
}
module.exports.planExpiring = (params)=>{
  let message = {
    title: 'Plan Expiring',
    image: 'https://ekbazaar.tech-active.com/assets/images/planExpiring.png',
    body: `<p>Thank you for joining Ekbazaar. We hope you’re enjoying your free trial.</p><p>Unfortunately, your free trial period is coming to a close and will officially end on ${moment(params.date).add(1, 'day').startOf('day').format('Do MMMM YYYY')}.</p><p>You can continue using our services by simply subscribing to one of our affordable plans.</p>`,
    buttonName: 'PRICING PLANS',
    buttonLink: `${params.url}/pricing`
  }
  return message;
}
module.exports.RfpEnquiryReceived = (params) => {
  let message = {
    title: 'Enquiry Received',
    image: 'https://ekbazaar.tech-active.com/assets/images/rfpEnquiryReceived.png',
    body: `<p>You have an enquiry for (${capitalizeFirstLetter(params.productDetails.name.name)}, ${params.productDetails.quantity}${capitalizeFirstLetter(params.productDetails.weight)}) from (${params.location}) by (${capitalizeFirstLetter(params.name)}) on ${params.date}.</p>`,
    buttonName: 'VIEW BUYER DETAILS',
    buttonLink:'google.com',
    extracontent1: `<p style="text-align: center">Thank you for choosing EkBazaar</p>`
  }
  return message;
}
module.exports.RfpEnquirySend = ()=>{
  let message = {
    title: 'Requirement Sent',
    image: 'https://ekbazaar.tech-active.com/assets/images/success.png',
    body: `<p>Thank you for submitting your requirements. The seller shall contact you on your shared contact details.</p>`,
  }
  return message;
}