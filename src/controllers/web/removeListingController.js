const {
 RemoveListing
} = require('../../modules')
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");
const {
create,
listAll
} = RemoveListing;

module.exports.createRemoveListing = async (req, res) => {
  try {
    const removeListing = await create(req.body);
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