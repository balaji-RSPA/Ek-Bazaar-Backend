const express = require("express");
const { Router } = express;
const router = Router();
const category = require("../../controllers/admin/categoryController");
const { authenticate } = require("../../middleware/auth");

/** 
 * Get all label one categories
*/
router.get("/categories/l1",authenticate,category.getLabel1Categories)
/** 
 * Get all label two category
*/
router.get("/categories/l2",authenticate,category.getLabel2Categories)
/** 
 * Get all label three category
*/
router.get("/categories/l3",authenticate,category.getLabel3Categories)
/** 
 * Get all label four category
*/
router.get("/categories/l4",authenticate,category.getLabel4Categories)
/** 
 * Get all label five category
*/
router.get("/categories/l5",authenticate,category.getLabel5Categories)


module.exports = router;