const express = require('express')
const { Router } = express
const router = Router()
const seller = require('../../controllers/admin/sellerController')
const { authenticate } = require('../../middleware/auth')

router.put('/seller/deleteProduct/:id',/* authenticate, */seller.deleteSellerProduct)
router.get('/seller/product/:id',/* authenticate, */seller.getSellerProductDtl)
router.put('/seller/product',/* authenticate, */seller.updateSellerProduct)
router.get('/seller/product',/* authenticate, */seller.listAllSellerProduct)
router.get('/seller/:id',/*  authenticate, */ seller.getSeller)
router.put('/seller/:id',/* authenticate, */seller.updateSeller)
router.get('/sellers',/* authenticate, */seller.getAllSellers)
router.get('/sellertypes',/* authenticate, */seller.getAllSellerTypes)
router.get('/seller/getRfq/:id',/* authenticate, */seller.getRfqRequest)


module.exports = router