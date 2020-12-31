const express = require("express");
const { Router } = express;
const router = Router();
const category = require("../../controllers/admin/categoryController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Get level one category
*/
router.get("/category/l1/:id",authenticate,category.GetLevel1Category)
/** 
 * Get level two category
*/
router.get("/category/l2/:id",authenticate,category.GetLevel2Category)
/** 
 * Get level three category
*/
router.get("/category/l3/:id",authenticate,category.GetLevel3Category)
/** 
 * Get level four category
*/
router.get("/category/l4/:id",authenticate,category.GetLevel4Category)
/** 
 * Get level five category
*/
router.get("/category/l5/:id",authenticate,category.GetLevel5Category)
/** 
 * List all level one categories
*/
router.get("/categories/l1",authenticate,category.listAllLevel1Categories)
/** 
 * List all level two category
*/
router.get("/categories/l2",authenticate,category.listAllLevel2Categories)
/** 
 * List all level three category
*/
router.get("/categories/l3",authenticate,category.listAllLevel3Categories)
/** 
 * List all level four category
*/
router.get("/categories/l4",authenticate,category.listAllLevel4Categories)
/** 
 * List all level five category
*/
router.get("/categories/l5",authenticate,category.listAllLevel5Categories)


module.exports = router;