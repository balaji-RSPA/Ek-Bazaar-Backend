
  module.exports.successfulRegistration = (params) => {
    const successfulMessage = params.userType === 'buyer' ?
      `Dear Customer,\n\nYour registration is successful.Thank you for choosing Ekbazaar.com.` :
      `Dear Customer,\n\nYou have successfully registered and your account has been activated with a 30 - day free trial.Thank you for choosing Ekbazaar.com`
    return {
      successfulMessage
    };
  }
  module.exports.sendOtp = (params) => {
    
    const otpMessage = params.reset ?
    `Dear Customer,\n\nYour one-time password for change of password on Ekbazaar.com is ${params.otp}.`
     : 
    `Dear Customer,\n\nYour one-time password for registration on Ekbazaar.com is ${params.otp}.`
    return {
      otpMessage
    }
  }

  module.exports.RFQOneToOne = (params) =>`You have an enquiry from EkBazaar.com for ${capitalizeFirstLetter(params.productDetails.name.name)},${params.productDetails.quantity} ${capitalizeFirstLetter(params.productDetails.weight)} from ${params._loc}.
    Details below: ${capitalizeFirstLetter(params.name)}-
    To view buyer contact details please register or login to trade.ekbazaar.com/signup
    Ekbazaar-Trade https://www.trade.ekbazaar.com`;


  module.exports.RFQOneToOneBuyer = () => `Dear Customer,\n\nThank you for submitting your requirement. We will get back to you soon.`;

  module.exports.removeListingMsg = () => `Dear Customer,\n\n We have received your request. We will contact you within 7 working days and remove your listing.\nThank you.`

  module.exports.businessProfileIncomplete = () => `Dear Customer,\n\nPlease complete your business profile to receive enquiries from buyers. https://www.trade.ekbazaar.com/seller/seller-central`;

  module.exports.businessProfileComplete = () => `Dear Customer,\n\n Thank you for completing your business profile. You are now eligible to receive enquiries from buyers.`;