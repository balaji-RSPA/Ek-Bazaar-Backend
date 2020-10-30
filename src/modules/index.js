const location = require('./locationsModule')
const buyers = require('./buyersModule')
const category = require('./categoryModule')
const sellers = require('./sellersModule')
const elastic = require('./elasticSearchModule')

module.exports = {
    location,
    buyers,
    category,
    sellers,
    elastic
}