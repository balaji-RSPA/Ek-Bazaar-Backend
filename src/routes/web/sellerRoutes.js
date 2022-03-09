const express = require('express')
const { Router } = express
const router = Router()
// const csvToJson = require('convert-csv-to-json')
const fs = require('fs')
const path = require('path')
const seller = require('../../controllers/web/sellersController')
const {uploadToDOSpace} = require('../../utils/utils')
// const sellerProductUpdate = require('../../modules/sellersModule')
const { authenticate } = require('../../middleware/auth')
// const {addProductDetails} = sellerProductUpdate

router.post('/seller/bulkInsert', seller.sellerBulkInsert)
// router.put('/seller/update/status',authenticate, seller.filterSellerUpdateStatus)
router.get('/seller', /* sellerAuthenticate, */ seller.getSeller)
router.put('/seller', authenticate, seller.updateSeller)
router.get('/sellers', seller.getAllSellers)

router.post('/sellerproduct/delete', seller.deleteSellerProduct)//,authenticate
router.post('/sellerproduct/add', seller.addSellerProduct) //,authenticate,
router.put('/sellerproduct/update',seller.updateSellerProduct)
router.post('/getsellerproduct',seller.getSellerProduct)
router.post('/uploadimage',uploadToDOSpace)
router.post('/getfilteredcities',seller.getFilteredCities)

// router.get('/getSellersList', seller.getSellersList)

module.exports = router
