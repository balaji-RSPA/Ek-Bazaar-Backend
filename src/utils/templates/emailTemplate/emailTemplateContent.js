const moment = require('moment');
module.exports.emailSuccessfulRegistration = (params) => {
  let message = {
    title : 'Welcome',
    image: 'https://ekbazaar.tech-active.com/assets/images/registrationthanks.png',
    body: 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.',
    greeting:`Hello ${params.name},`,
    buttonName: 'LOGIN TO YOUR ACCOUNT',
    buttonLink:'google.com',
    extraTitle: 'Have a question?',
    extracontent1: 'Please <a href=`https://ekbazaar.tech-active.com/`>contact our team</a> via direct messaging or email. We would be happy to help you.',
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
    buttonLink:'google.com',
    extracontent1: `If you did not make the change. <a href='https://ekbazaar.tech-active.com/'>Please contact support.</a>`
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
    title: 'Invoice',
    image: 'https://ekbazaar.tech-active.com/assets/images/invoice.png',
    body: `<p style="text-align: left">Thank you for subscribing to EkBazaar. The credit card ending xxxxx has been successfully charged Rs ${params.price}. A copy of receipt is also present in your EkBazaar account details.</p>
    <p style="text-align: left">Plan       : ${params.plan}</p>
    <p style="text-align: left">Valid from : ${moment().format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>`,
    buttonName: 'VIEW FULL INVOICE',
    buttonLink: 'google.com',
    extracontent1: `<p style="text-align: center">Thank you for choosing EkBazaar</p>`
  }
  return message;
}