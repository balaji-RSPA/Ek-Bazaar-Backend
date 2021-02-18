const axios = require('axios');
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");
const {
  sendSingleMail
} = require('../../utils/mailgunService')
const {
  MailgunKeys
} = require('../../utils/globalConstants')
 const {
   contactus
 } = require('../../utils/templates/emailTemplate/emailTemplateContent');
 const { commonTemplate } = require('../../utils/templates/emailTemplate/emailTemplate');
/**
 * Insert contact us enquires
 */
module.exports.addContact = async (req, res) => {
  try {
  let result
  let url 
  if (process.env.NODE_ENV === 'development'){
    url = `http://localhost:8060/api/v1/`
   }
   else if(process.env.NODE_ENV === 'production'){
     url = `https://api.ekbazaar.com/api/v1/`
   }
   else if(process.env.NODE_ENV === 'staging'){
      url = `https://elastic.tech-active.com:8443/api/v1/`
   }
  let response = await axios.post(`${url}contact`, req.body)
  if(response.data.success === false){
    throw new Error(response.data.message)
  }else{
    result = response && response.data && response.data.data;
   if (result && result.workEmail) {
    const contactUsEmailMsg = contactus();
    const message = {
      from: result.workEmail,
      to: MailgunKeys.senderMail,
      subject: 'Contact Us Enquiry',
      html: commonTemplate(contactUsEmailMsg)
    }
    await sendSingleMail(message)
   } 
  }
   respSuccess(res, result, "Your request has been successfully submitted")
  } catch (error) {
    respError(res, error.message);
  }
};