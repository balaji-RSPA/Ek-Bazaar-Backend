const { respSuccess, respError } = require("../../utils/respHadler");
const { Commodity } = require("../../modules");
const {
  createCommodity,
  getAllCommodity,
  getCommodity,
  updateCommodity,
  deleteCommodity
} = Commodity;

/**create Commodity*/
module.exports.createCommodity = async (req, res) => {
  try {
    const commodity = await createCommodity(req.body);
    respSuccess(res, commodity, "Record created successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

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

/**get specific Commodity*/
module.exports.getCommodity = async (req, res) => {
  try {
    const id = req.params.id;
    const commodityData = await getCommodity({ _id: id });
    respSuccess(res, commodityData);
  } catch (error) {
    respError(res, error.message);
  }
};

/**update Commodity*/
module.exports.updateCommodity = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCommodityData = {};
    const { commodityName, priceUnit, cities } = req.body;

    if (commodityName) {
      updatedCommodityData.commodityName = commodityName;
    }
    if (priceUnit) {
      updatedCommodityData.priceUnit = priceUnit;
    }

    if (cities) {
      updatedCommodityData.cities = cities;
    }

    const updatedCommodity = await updateCommodity(
      { _id: id },
      updatedCommodityData
    );
    respSuccess(res, updatedCommodity, "Record updated successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

/**delete Commodity*/
module.exports.deleteCommodity = async (req, res) => {
  try {
    const _id = req.params.id;
    const deleteStatus = await deleteCommodity({ _id });
    respSuccess(res, deleteStatus, "Record deleted successfully");
  } catch (error) {
    respError(res, error.message);
  }
};
