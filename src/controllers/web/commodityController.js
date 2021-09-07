const { respSuccess, respError } = require("../../utils/respHadler");
const { Commodity } = require("../../modules");
const { getAllCommodity } = Commodity;

/**get all commodity*/
module.exports.getAllCommodity = async (req, res) => {
  try {
    const { search, skip, limit } = req.query;
    const commodityData = await getAllCommodity(
      search,
      parseInt(skip),
      parseInt(limit)
    );
    respSuccess(res, commodityData);
  } catch (error) {
    respError(res, error.message);
  }
};
