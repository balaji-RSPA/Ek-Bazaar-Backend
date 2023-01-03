const { respSuccess, respError } = require("../../utils/respHadler");
const { Commodity } = require("../../modules");
const {
  createCommodity,
  getAllCommodity,
  getCommodity,
  updateCommodity,
  deleteCommodity,
  resetCommodity
} = Commodity;

/**create Commodity*/
module.exports.createCommodity = async (req, res) => {
  try {
    const { check, veriety, commodityName } = req.body
    console.log("🚀 ~ file: commodityController.js ~ line 15 ~ module.exports.createCommodity= ~ req.body", req.body)
    if (check) {
      const exist = await getCommodity({ veriety, commodityName })
      if (exist) {
        await deleteCommodity({ _id: { $in: [exist._id] } })
      }
    }
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
    let query = search ? {
      search: {
        $or: [
          { commodityName: { $regex: search, $options: "i" } },
          { priceUnit: { $regex: search, $options: "i" } }
        ]
      },
      skip: parseInt(skip),
      limit: parseInt(limit)
    } : {}
    const commodityData = await getAllCommodity(
      query
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
    const { commodityName, priceUnit, city } = req.body;

    // if (commodityName) {
    //   updatedCommodityData.commodityName = commodityName;
    // }
    // if (priceUnit) {
    //   updatedCommodityData.priceUnit = priceUnit;
    // }

    // if (city) {
    //   updatedCommodityData.city = city;
    // }

    const updatedCommodity = await updateCommodity(
      { _id: id },
      // updatedCommodityData
      req.body
    );
    respSuccess(res, updatedCommodity, "Record updated successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

/**delete Commodity*/
module.exports.deleteCommodity = async (req, res) => {
  try {
    // const _id = req.params.id;
    const { _ids } = req.body
    const deleteStatus = await deleteCommodity({ _id: { $in: _ids } });
    respSuccess(res, deleteStatus, "Record deleted successfully");
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.resetCommodity = async (req, res) => {
  try {
    const { _ids, value } = req.body;
    let query
    if(_ids){
      query = {
        _id: { $in: _ids }
      }
    }else {
      query = { active: true }
    }
    const resetStatus = await resetCommodity(query, value);
    respSuccess(res, resetStatus, "Commodity Reset Sucessfully");
  } catch (error) {
    respError(res, error.message);
  }
}
