const { respSuccess, respError } = require("../../utils/respHadler");
const { category } = require("../../modules");
const{
  getAllCategories,
  getAllPrimaryCategory,
  getAllSecondaryCategory,
  getAllProducts,
  getAllLevel5Categories,
  getParentCat,
  getPrimaryCat,
  getSecondaryCat,
  getProductCat,
  getProductSubcategory
} = category;

/**
 * List all level 1 category
*/
module.exports.listAllLevel1Categories = async (req, res) => {
  try {
    const { skip,limit } = req.body
    const categories = await getAllCategories(null,skip,limit);
    respSuccess(res, categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * List all level two category
*/
module.exports.listAllLevel2Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const level2Categories = await getAllPrimaryCategory(skip,limit);
    respSuccess(res, level2Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * List all level three category
*/
module.exports.listAllLevel3Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const level3Categories = await getAllSecondaryCategory(skip,limit);
    respSuccess(res, level3Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * List all level four category
*/
module.exports.listAllLevel4Categories = async (req, res) => {
  try {
    const level4Categories = await getAllProducts(req.body);
    respSuccess(res, level4Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * List all level five category
*/
module.exports.listAllLevel5Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body;
    const level5Categories = await getAllLevel5Categories(skip,limit);
    respSuccess(res, level5Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get level 1 category
*/
module.exports.GetLevel1Category = async (req, res) => {
  try {
    const { id } = req.params
    const level1category = await getParentCat({_id : id});
    respSuccess(res, level1category);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get level 2 category
*/
module.exports.GetLevel2Category = async (req, res) => {
  try {
    const { id } = req.params
    const level2category = await getPrimaryCat({_id : id});
    respSuccess(res, level2category);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get level 3 category
*/
module.exports.GetLevel3Category = async (req, res) => {
  try {
    const { id } = req.params
    const level3category = await getSecondaryCat({_id : id});
    respSuccess(res, level3category);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get level 4 category
*/
module.exports.GetLevel4Category = async (req, res) => {
  try {
    const { id } = req.params
    const level4category = await getProductCat({_id : id});
    respSuccess(res, level4category);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get level 5 category
*/
module.exports.GetLevel5Category = async (req, res) => {
  try {
    const { id } = req.params
    const level5category = await getProductSubcategory({_id : id});
    respSuccess(res, level5category);
  } catch (error) {
    respError(res, error.message);
  }
};