// const admin = require('./admin')
const router = require('express').Router()
const web = require('./web')
// const admin = require('./admin')

router.use('/api', web)
// router.use('/api', admin)

module.exports = router