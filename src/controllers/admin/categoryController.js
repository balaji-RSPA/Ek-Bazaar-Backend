const { respSuccess, respError } = require("../../utils/respHadler");
const { category } = require("../../modules");
const{
  getAllCategories,
  getAllPrimaryCategory,
  getAllSecondaryCategory,
  getAllProducts,
  getAllLabel5Categories
} = category;

/**
 * Get all label 1 category
*/
module.exports.getLabel1Categories = async (req, res) => {
  try {
    const { skip,limit } = req.body
    const categories = await getAllCategories(skip,limit);
    respSuccess(res, categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get all label two category
*/
module.exports.getLabel2Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const label2Categories = await getAllPrimaryCategory(skip,limit);
    respSuccess(res, label2Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get all label three category
*/
module.exports.getLabel3Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const label3Categories = await getAllSecondaryCategory(skip,limit);
    respSuccess(res, label3Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get all label four category
*/
module.exports.getLabel4Categories = async (req, res) => {
  try {
    const label4Categories = await getAllProducts(req.body);
    respSuccess(res, label4Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
/**
 * Get all label five category
*/
module.exports.getLabel5Categories = async (req, res) => {
  try {
    const {skip,limit} = req.body;
    const label5Categories = await getAllLabel5Categories(skip,limit);
    respSuccess(res, label5Categories);
  } catch (error) {
    respError(res, error.message);
  }
};
