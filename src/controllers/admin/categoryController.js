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
    const { search,skip,limit } = req.body
    const categories = await getAllCategories(null,search,skip,limit);
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
    const {search,skip,limit} = req.body
    const level2Categories = await getAllPrimaryCategory(search,skip,limit);
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
    const {search,skip,limit} = req.body
    const level3Categories = await getAllSecondaryCategory(search,skip,limit);
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
    const {search,skip,limit} = req.body;
    const level5Categories = await getAllLevel5Categories(search,skip,limit);
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
/**
 * List all product based on search
*/
module.exports.listAllproducts = async (req, res) => {
  try {
    const { search,skip,limit } = req.body
    const categories = await getAllCategories(null,search,skip,limit);
    if(categories && categories.length){
      respSuccess(res, categories);
    }else{
      const level2Categories = await getAllPrimaryCategory(search,skip,limit);
      if(level2Categories && level2Categories.length){
        respSuccess(res, level2Categories);
      }else{
        const level3Categories = await getAllSecondaryCategory(search,skip,limit);
        if(level3Categories && level3Categories.length){
          respSuccess(res, level3Categories);
        }else{
          const level4Categories = await getAllProducts(req.body);
          if(level4Categories && level4Categories.length){
            respSuccess(res, level4Categories);
          }else{
            const level5Categories = await getAllLevel5Categories(search,skip,limit);
            if(level5Categories && level5Categories.length){
              respSuccess(res, level5Categories);
            }else{
              respSuccess(res, "No Product found!");
            }
          }
        } 
      }
    }
  } catch (error) {
    respError(res, error.message);
  }
};