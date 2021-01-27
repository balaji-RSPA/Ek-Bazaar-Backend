const express = require('express')
const {
  Router
} = express
const router = Router()
const removeListing = require("../../controllers/web/removeListingController")

router.post('/removelisting', removeListing.createRemoveListing)

module.exports = router
