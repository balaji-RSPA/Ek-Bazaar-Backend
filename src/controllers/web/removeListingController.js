const {
 RemoveListing
} = require('../../modules')
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");
const { sendSMS } = require('../../utils/utils');
const { removeListingMsg } = require('../../utils/templates/smsTemplate/smsTemplate');
const {
create,
listAll
} = RemoveListing;

module.exports.createRemoveListing = async (req, res) => {
  try {
    const removeListing = await create(req.body);
    if(removeListing && removeListing.mobile && removeListing.mobile.mobile){
       await sendSMS(removeListing.mobile.mobile, removeListingMsg());
    }else{
      console.log("=============Invalid mobile================");
    }
    if (removeListing && removeListing.email) {
      const message = {
        from: removeListing.email,
        to: MailgunKeys.senderMail,
        subject: 'Remove my listing',
        html: `<p>${removeListing.reason}</p>`
      }
      await sendSingleMail(message)
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