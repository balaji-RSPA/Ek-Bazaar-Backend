const {
 RemoveListing
} = require('../../modules')
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");
const { sendSMS } = require('../../utils/utils');
const { removeListingMsg } = require('../../utils/templates/smsTemplate/smsTemplate');
const { listingRemovalReq } = require('../../utils/templates/emailTemplate/emailTemplateContent');
const { commonTemplate } = require('../../utils/templates/emailTemplate/emailTemplate');
const { MailgunKeys } = require('../../utils/globalConstants');
const { sendSingleMail } = require('../../utils/mailgunService');
const {
create,
listAll
} = RemoveListing;

module.exports.createRemoveListing = async (req, res) => {
  try {
    const removeListing = await create(req.body);
    if(removeListing && removeListing.mobile && removeListing.mobile.mobile){
      const {message, templateId} = removeListingMsg()
      let countryCode = removeListing.mobile && removeListing.mobile.countryCode ? removeListing.mobile.countryCode : '+91'
      const response = sendSMS(`${countryCode}${removeListing.mobile.mobile}`, message, templateId);
      console.log("remove my listing ---------- response",response.data);
    }else{
      console.log("=============Invalid mobile================");
    }
    if (removeListing && removeListing.email) {
      let removeMessage = listingRemovalReq();
      const message = {
        from: MailgunKeys.senderMail,
        to:removeListing.email,
        subject: 'Remove my listing',
        html: commonTemplate(removeMessage)
      }
      await sendSingleMail(message)
    }else{
      console.log("==============Email Not send==============");
    }
    respSuccess(res,"We will contact you within 7 working days and remove your listing");
  } catch (error) {
    respError(res, error.message);
  }
};
module.exports.listAll = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const Obj = {skip,limit}
    const removeListing = await listAll(Obj);
    respSuccess(res, removeListing);
  } catch (error) {
    respError(res, error.message);
  }
};