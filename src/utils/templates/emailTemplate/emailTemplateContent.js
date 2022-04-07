const moment = require('moment');
const { capitalizeFirstLetter } = require('../../helpers')
const { imageURLS } = require('../../globalConstants')
const { registrationthanks, otpverification, passwordUpdated, invoice, planExpired, planExpiring, planChange, enquiry, announcements } = imageURLS

module.exports.emailSuccessfulRegistration = (params) => { //userType
  let message;
  if (!params.url.includes('onebazaar')) {
    message = {
      // For Ekbazaar
      title: 'Ekbazaar Trade- Successful Registration',
      image: registrationthanks,
      // body: params.userType === 'seller' ? 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.' : 'Thank you for registering.',
      body: params.userType === 'seller' ? 'You have successfully registered and your account has been activated on Trade Bazaar' : 'Thank you for registering.',
      greeting: `Hello ${params.name},`,
      buttonName: 'LOGIN TO YOUR ACCOUNT',
      buttonLink: `${params.url}/signin`,
      extraTitle: 'Have a question?',
      extracontent1: `Please <a href='${params.url}/contact'>contact our team</a> via direct messaging or email. <p>We would be happy to help you.</p>`,
      extracontent2: `Thank you for choosing EkBazaar. We hope you enjoy our services.`,
      originOneFlag: params.url.includes('onebazaar') ? true : false
    }
  } else {
    //FOR ONEBAZZAR
    message = {
      title: 'Onebazaar Trade- Successful Registration',
      image: registrationthanks,
      body: params.userType === 'seller' ? 'You have successfully registered and your account has been activated with a 30 days free trial for Trade Bazaar.' : 'Thank you for registering.',
      greeting: `Hello ${params.name},`,
      buttonName: 'LOGIN TO YOUR ACCOUNT',
      buttonLink: `${params.url}/signin`,
      extraTitle: 'Have a question?',
      extracontent1: `Please <a href='${params.url}/contact'>contact our team</a> via direct messaging or email. <p>We would be happy to help you.</p>`,
      extracontent2: `Thank you for choosing OneBazaar. We hope you enjoy our services`,
      originOneFlag: params.url.includes('onebazaar') ? true : false
    }
  }
  return message;
}
module.exports.otpVerification = (params) => {
  let message;
  if (!params.url.includes('onebazaar')) {
    // For EKB
    message = {
      title: 'Ekbazaar Trade- OTP Verification',
      image: otpverification,
      body: `<p>Your one time password is <strong>${params.otp}<strong>.</p><p>Please enter the code and proceed with setting up a new password for your account.</p>`,
      originOneFlag: false
    }
  } else {
    // For ONE
    message = {
      title: 'Onebazaar Trade- OTP Verification',
      image: otpverification,
      body: `<p>Your one time password is <strong>${params.otp}<strong>.</p><p>Please enter the code and proceed with setting up a new password for your account.</p>`,
      originOneFlag: true
    }
  }

  return message;
}
module.exports.passwordUpdate = (params) => {
  let message
  if (!params.url.includes('onebazaar')) {
    // For EKB
    message = {
      title: 'Ekbazaar Trade- Password Updated',
      image: passwordUpdated,
      body: `<p><strong>Hello ${params.name},<strong></p><p>Your password has been changed recently. Please use the updated password to login to your account.</p>`,
      buttonName: 'LOGIN TO YOUR ACCOUNT',
      buttonLink: `${params.url}/signin`,
      extracontent1: `<p style="text-align:center;margin-top: -13px;">If you did not make the change. <a href='${params.url}/contact'>Please contact support.</a></p>`,
      originOneFlag: false
    }
  } else {
    // For ONE
    message = {
      title: 'Onebazaar Trade- Password Updated',
      image: passwordUpdated,
      body: `<p><strong>Hello ${params.name},<strong></p><p>Your password has been changed recently. Please use the updated password to login to your account.</p>`,
      buttonName: 'LOGIN TO YOUR ACCOUNT',
      buttonLink: `${params.url}/signin`,
      extracontent1: `<p style="text-align:center;margin-top: -13px;">If you did not make the change. <a href='${params.url}/contact'>Please contact support.</a></p>`,
      originOneFlag: true
    }
  }

  return message;
}
module.exports.contactus = (params) => {
  let message
  if (!params.origin.includes('onebazaar')) {
    // FOR EKB
    message = {
      title: `Support request received ${params.id}`,
      image: passwordUpdated,
      body: '<p>Your message has been received and will be soon answered by our support team.</p><br /><p>Thank you for choosing EkBazaar</p>',
      originOneFlag: false
    }
  } else {
    // FOR ONE
    message = {
      title: `Support request received ${params.id}`,
      image: passwordUpdated,
      body: '<p>Your message has been received and will be soon answered by our support team.</p><br /><p>Thank you for choosing OneBazaar</p>',
      originOneFlag: true
    }
  }
  return message;
}

module.exports.invoiceContent = (params) => {
  let message;

  if (!params.isOneBazzar) {
    // FOR EKB
    message = {
      title: 'Ekbazaar Trade- Invoice',
      image: invoice,
      body: `<p style="text-align: left">Thank you for subscribing to EkBazaar. ${params.cardNo ? `The credit card ending x${params.cardNo}` : 'You'} has been successfully charged Rs ${params.price}. A copy of receipt is also present in your EkBazaar account details.</p>
      <p style="text-align: left">Plan       : ${params.plan}</p>
      <p style="text-align: left">Valid from : ${moment(params.from).format("Do MMM YYYY")}</p>
      <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>`,
      buttonName: 'VIEW FULL INVOICE',
      buttonLink: params.invoiceLink,
      extracontent1: `<p style="text-align: center; margin-top:-13px;">Thank you for choosing EkBazaar</p>`,
      originOneFlag: false
    }
  } else {
    // FOR ONE
    message = {
      title: 'Onebazaar Trade- Invoice',
      image: invoice,
      body: `<p style="text-align: left">Thank you for subscribing to EkBazaar. ${params.cardNo ? `The credit card ending x${params.cardNo}` : 'You'} has been successfully charged $ ${params.price}. A copy of receipt is also present in your EkBazaar account details.</p>
      <p style="text-align: left">Plan       : ${params.plan}</p>
      <p style="text-align: left">Valid from : ${moment(params.from).format("Do MMM YYYY")}</p>
      <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>`,
      buttonName: 'VIEW FULL INVOICE',
      buttonLink: params.invoiceLink,
      extracontent1: `<p style="text-align: center; margin-top:-13px;">Thank you for choosing OneBazaar</p>`,
      originOneFlag: true
    }
  }
  return message;
}
module.exports.planExpired = (params) => {
  let message = '';
  if (!params.isOneBazzar) {
    // FOR EKB
    if (params.isTrial) {
      message = {
        title: 'Ekbazaar Trade- Plan Expired',
        image: planExpired,
        body: `<p>Your free trial plan has expired on ${moment(params.date).format("Do MMMM YYYY")}.</p><p>You can continue using our services by simply completing your subscription.</p>`,
        buttonName: 'SUBSCRIBE',
        buttonLink: `${params.url}`,
        originOneFlag: false
      }
    } else {
      message = {
        title: 'Ekbazaar Trade- Plan Expired',
        image: planExpired,
        body: `<p>Your plan has expired. Please renew your plan</p>`,
        buttonName: 'SUBSCRIBE',
        buttonLink: `${params.url}`,
        originOneFlag: false
      }
    }
  } else {
    // FOR ONE
    if (params.isTrial) {
      message = {
        title: 'Onebazaar Trade- Plan Expired',
        image: planExpired,
        body: `<p>Your free trial plan has expired on ${moment(params.date).format("Do MMMM YYYY")}.</p><p>You can continue using our services by simply completing your subscription.</p>`,
        buttonName: 'SUBSCRIBE',
        buttonLink: `${params.url}`,
        originOneFlag: true
      }
    } else {
      message = {
        title: 'Onebazaar Trade- Plan Expired',
        image: planExpired,
        body: `<p>Your plan has expired. Please renew your plan</p>`,
        buttonName: 'SUBSCRIBE',
        buttonLink: `${params.url}`,
        originOneFlag: true
      }
    }
  }

  return message;
}
module.exports.planExpiring = (params) => {
  let message = ''
  if (!params.isOneBazzar) {
    // FOR EKB
    if (params.isTrial && params.dayDiff) {
      message = {
        title: 'Ekbazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>We hope you’re enjoying your free trial.</p><p>Unfortunately, your free trial period is about to expire in ${params.dayDiff} days and will officially end on ${moment(params.date).format('Do MMMM YYYY')}.</p><p>You can continue using our services by simply subscribing to one of our affordable plans.</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: false
      }
    } else if (params.dayDiff && params.isTrial === false) {

      message = {
        title: 'Ekbazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>Your plan is about to expire in ${params.dayDiff} days.Please renew your plan</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: false
      }
    } else {
      message = {
        title: 'Ekbazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>Your Plan is Expiring Today! Please Renew to access the benefits of a Subscriber</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: false
      }
    }

    // For OneBazzar   
  } else {
    if (params.isTrial && params.dayDiff) {
      message = {
        title: 'Onebazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>We hope you’re enjoying your free trial.</p><p>Unfortunately, your free trial period is about to expire in ${params.dayDiff} days and will officially end on ${moment(params.date).format('Do MMMM YYYY')}.</p><p>You can continue using our services by simply subscribing to one of our affordable plans.</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: true
      }
    } else if (params.dayDiff && params.isTrial === false) {
      message = {
        title: 'Onebazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>Your plan is about to expire in ${params.dayDiff} days.Please renew your plan</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: true
      }
    } else {
      message = {
        title: 'Onebazaar Trade- Plan About To Expire',
        image: planExpiring,
        body: `<p>Your Plan is Expiring Today! Please Renew to access the benefits of a Subscriber</p>`,
        buttonName: 'PRICING PLANS',
        buttonLink: `${params.url}`,
        originOneFlag: true
      }
    }
  }

  return message;
}
module.exports.RfpEnquiryReceived = (params) => {
  let message;
  if (!params.url.includes('onebazaar')) {
    message = {
      title: 'Ekbazaar Trade- Enquiry Received',
      image: enquiry,
      body: `<p>You have an enquiry for (${capitalizeFirstLetter(params.productDetails.name.name)}, ${params.productDetails.quantity}${capitalizeFirstLetter(params.productDetails.weight)}) from (${params._loc}) by (${capitalizeFirstLetter(params.name)}) on ${moment().format('Do MMM YYYY')}.</p>`,
      buttonName: 'VIEW BUYER DETAILS',
      buttonLink: `${params.url}/seller/seller-central/enquiry?sellerId=${params.sellerId}&skip=0&limit=10`,
      extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing EkBazaar</p>`,
      originOneFlag: false
    }
  } else {
    // For One
    message = {
      title: 'Onebazaar Trade- Enquiry Received',
      image: enquiry,
      body: `<p>You have an enquiry for (${capitalizeFirstLetter(params.productDetails.name.name)}, ${params.productDetails.quantity}${capitalizeFirstLetter(params.productDetails.weight)}) from (${params._loc}) by (${capitalizeFirstLetter(params.name)}) on ${moment().format('Do MMM YYYY')}.</p>`,
      buttonName: 'VIEW BUYER DETAILS',
      buttonLink: `${params.url}/seller/seller-central/enquiry?sellerId=${params.sellerId}&skip=0&limit=10`,
      extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing OneBazaar</p>`,
      originOneFlag: true
    }
  }
  return message;
}
module.exports.RfpEnquirySend = (params) => {
  let message;
  if (!params.url.includes('onebazaar')) {
    // For EKB
    message = {
      title: 'Ekbazaar Trade- Requirement Sent',
      image: passwordUpdated,
      body: `<p>Thank you for submitting your requirements. The seller shall contact you on your shared contact details.</p>`,
      originOneFlag: false
    }
  } else {
    // FOR One
    message = {
      title: 'Onebazaar Trade- Requirement Sent',
      image: passwordUpdated,
      body: `<p>Thank you for submitting your requirements. The seller shall contact you on your shared contact details.</p>`,
      originOneFlag: true
    }
  }
  return message;
}
module.exports.planChangedEmail = (params) => {
  console.log("🚀 ~ file: emailTemplateContent.js ~ line 132 ~ params", params)
  let message;
  if (!params.url.includes('onebazaar')) {
    // FOR EKB
    message = {
      title: 'Ekbazaar Trade- Plan changed',
      image: planChange,
      body: `<p style="text-align: left">Your plan has been changed from ${params.oldPlanType} to ${params.newPlanType}.</p>
    <p style="text-align: left">Valid from : ${moment(params.from).format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>
    `,
      buttonName: 'VIEW YOUR PLAN',
      buttonLink: `${params.url}/seller/seller-central/seller-account?skip=0&limit=10&tab=3`,
      extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing EK Bazaar. Have a good day.</p>`,
      originOneFlag: false
    }
  } else {
    // FOR ONE
    message = {
      title: 'Onebazaar Trade- Plan changed',
      image: planChange,
      body: `<p style="text-align: left">Your plan has been changed from ${params.oldPlanType} to ${params.newPlanType}.</p>
    <p style="text-align: left">Valid from : ${moment(params.from).format("Do MMM YYYY")}</p>
    <p style="text-align: left">Valid till : ${moment(params.till).format("Do MMM YYYY")} </p>
    `,
      buttonName: 'VIEW YOUR PLAN',
      buttonLink: `${params.url}/seller/seller-central/seller-account?skip=0&limit=10&tab=3`,
      extracontent1: `<p style="text-align: center;margin-top:-13px;">Thank you for choosing OneBazaar. Have a good day.</p>`,
      originOneFlag: true
    }
  }
  return message;
}
module.exports.listingRemovalReq = (params) => {
  let message;
  if (!params.url.includes('onebazaar')) {
    message = {
      title: 'Ekbazaar Trade- Listing Removal Request',
      image: announcements,
      // body: `<p>Thank you.</p><p>We will contact you within 7 working days and remove your listing.</p>`,
      body: `<p>Your request for removing your product listing has been received. We shall contact you shortly in this regard and take necessary action.</p>`,
      originOneFlag: false
    }
  } else {
    // FOR ONE
    message = {
      title: 'Onebazaar Trade- Listing Removal Request',
      image: announcements,
      // body: `<p>Thank you.</p><p>We will contact you within 7 working days and remove your listing.</p>`,
      body: `<p>Your request for removing your product listing has been received. We shall contact you shortly in this regard and take necessary action.</p>`,
      originOneFlag: true
    }
  }
  return message;
}

module.exports.subscriptionPending = (params) => {
  let message = {
    title: ' Subscription payment failed',
    image: planExpired,
    body: `<p style="text-align: left">Hello ${params.userName},</p>
       <p style="text-align: left">Your payment for the upcoming month has been failed, below might be the possible reasons for the payment failure</p>
       <ul style="text-align: left">
       <li>The card has expired.</li>
       <li>The bank has blocked the card.<li>
       <li>The customer's account has insufficient balance.<li>
       </ul>
      <p style="text-align: left">We recommend you to check the issue with your card to continue using our services for the next month</p>`,
    originOneFlag: false
  }
  return message
}

module.exports.cancelSubscription = (params) => {
  let message = {
    title: 'Subscription cancellation',
    image: planExpired,
    body: `<p style="text-align: left">Hello User,</p>
       <p style="text-align: left">Something went wrong, and we are unable to process the charges from your card. Unfortunately, your subscription has been cancelled.</p>
       <p style="text-align: left">But don't worry, You can purchase the new subscription at any time from EkBazaar.</p>
       <p style="text-align: center">Hope to see you back soon</p>`,
    originOneFlag: false
  }
  return message
}

module.exports.paymentLinkGeneration = (params) => {
  let message = {
    title: 'Payment link',
    image: passwordUpdated,
    body: `<p style="text-align: left">Dear ${params.userName},</p>
       <p style="text-align: left">Here is your payment link:${params.payLink}</p>
       <p style="text-align: left">Please click on the link to make the payment & get benefits</p>`,
    originOneFlag: false
  }
  return message
}

module.exports.partialSellerRegistration = (params) => {
  let message;
  if (params.client === 'ekbazaar') {
    // FOR EKB
    message = {
      title: 'Ekbazaar Trade - Incomplete Registration',
      body: `<p>Please complete your registration in-order to receive business enquiries from buyers.</p>`,
      buttonName: 'Complete your registration',
      buttonLink: `${params.url}/seller/seller-central/bussiness-profile`,
      originOneFlag: false
    }
  }else {
    // FOR ONE
    message = {
      title: 'Onebazaar Trade - Incomplete Registration',
      body: `<p>Please complete your registration in-order to receive business enquiries from buyers.</p>`,
      buttonName: 'Complete your registration',
      buttonLink: `${params.url}/seller/seller-central/bussiness-profile`,
      originOneFlag: true
    }
  }
  return message;
}