const { respSuccess, respError } = require("../../utils/respHadler");
const { Commodity } = require("../../modules");
const { getAllCommodity } = Commodity;
const moment = require("moment");

/**get all commodity*/
module.exports.getAllCommodity = async (req, res) => {
  try {
    // const { search, skip, limit } = req.query;
    let todayDate = moment().format('YYYY-MM-DD');
    const query  = { '$where': 'this.updatedAt.toJSON().slice(0, 10) == "' + todayDate + '"' }
    let commodityData = await getAllCommodity(
      query
    );
    respSuccess(res, commodityData);
  } catch (error) {
    respError(res, error.message);
  }
};
