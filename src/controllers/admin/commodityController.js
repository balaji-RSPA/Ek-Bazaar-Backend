const { respSuccess, respError } = require("../../utils/respHadler");
const { Commodity } = require("../../modules");
const {
  createCommodity,
  getAllCommodity,
  getCommodity,
  updateCommodity,
  deleteCommodity
} = Commodity;

module.exports.createCommodity = async (req, res) => {
  try {
    console.log(req.body, ' rames h-------------------')
    const commodity = await createCommodity(req.body);
    respSuccess(res, commodity, "Record created successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllCommodity = async (req, res) => {
  try {
    const commodityData = await getAllCommodity();
    respSuccess(res, commodityData);
  } catch (error) {
    console.log(error, ' rrrrrrrrrrrrr')
    respError(res, error.message);
  }
};

module.exports.getCommodity = async (req, res) => {
  try {
    const id = req.params.id;
    const commodityData = await getCommodity({ _id: id });
    respSuccess(res, commodityData);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.updateCommodity = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCommodityData = {};
    const { commodityName, priceUnit } = req.body;

    if (commodityName) {
      updatedCommodityData.commodityName = commodityName;
    }
    if (priceUnit) {
      updatedCommodityData.priceUnit = priceUnit;
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

module.exports.deleteCommodity = async (req, res) => {
  try {
    const _id = req.params.id;
    const deleteStatus = await deleteCommodity({ _id });
    respSuccess(res, deleteStatus, "Record deleted successfully");
  } catch (error) {
    respError(res, error.message);
  }
};
