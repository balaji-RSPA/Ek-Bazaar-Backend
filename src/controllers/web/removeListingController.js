const {
 RemoveListing
} = require('../../modules')
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");
const {
create
} = RemoveListing;

module.exports.createRemoveListing = async (req, res) => {
  try {
    const removeListing = await create(req.body);
    respSuccess(res,"We will contact you within 7 working days and remove your listing");
  } catch (error) {
    respError(res, error.message);
  }
};