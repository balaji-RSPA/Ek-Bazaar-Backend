const express = require('express')
const {
  Router
} = express
const {
  authenticate
} = require("../../middleware/auth");
const router = Router()
const removeListing = require("../../controllers/web/removeListingController")

router.post('/removelisting', removeListing.createRemoveListing)
router.get('/removelisting',authenticate,removeListing.listAll)

module.exports = router
