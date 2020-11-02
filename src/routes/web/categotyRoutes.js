const express = require("express");
const { Router } = express;
const router = Router();

const category = require('../../controllers/web/categoryController')

// Get All Categories
router.get("/getAllCategories", category.getAllCategories);
router.get("/getAllProducts", category.getAllProducts)
router.get("/getRelatedCategories/:id", category.getRelatedCategories)

// Parent Categories
router.post("/addParentCategories", category.addParentCategories);
router.post("/addParentCategory", category.addParentCategory);
router.get("/getParentCategory/:id", category.getParentCategory);

// Primary Categories
router.post("/addPrimaryCategories", category.addPrimaryCategories);
router.post("/addPrimaryCategory", category.addPrimaryCategory);
router.get("/getPrimaryCategory/:id", category.getPrimaryCategory);

// Secondary Categories
router.post("/addSecondaryCategories", category.addSecondaryCategories);
router.post("/addSecondaryCategory", category.addSecondaryCategory);
router.get("/getSecondaryCategory/:id", category.getSecondaryCategory);


// Secondary Categories
router.post("/addBulkProduct", category.addBulkProducts);
router.post("/addProductCategory", category.addProduct);
router.get("/getProductCategory/:id", category.getProduct);

// Seller Types
router.post("/sellerType", category.addSellerType);
router.get("/sellerTypes", category.getAllSellerTypes);

module.exports = router;