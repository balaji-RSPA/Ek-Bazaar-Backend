const location = require('./locationsModule')
const buyers = require('./buyersModule')
const category = require('./categoryModule')
const sellers = require('./sellersModule')
const elastic = require('./elasticSearchModule')
const rfp = require('./rfpModule')
const subscriptionPlan = require('./subscriptionPlanModule')

module.exports = {
    location,
    buyers,
    category,
    sellers,
    elastic,
    rfp,
    subscriptionPlan
}