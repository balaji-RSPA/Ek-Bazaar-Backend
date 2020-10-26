const { buyers } = require('../../modules')
const { addBuyer, getBuyer, updateBuyer, getAllBuyers } = buyers

module.exports.addBuyer = async(res, req) => {
    try {
        res.send('Buyer Added')
    } catch (error) {
        res.send(error.message)
    }
}

module.exports.getBuyer = async(res, req) => {
    try {
        res.send('Buyer Added')
    } catch (error) {
        res.send(error.message)
    }
}

module.exports.updateBuyer = async(res, req) => {
    try {
        res.send('Buyer Added')
    } catch (error) {
        res.send(error.message)
    }
}

module.exports.getAllBuyers = async(res, req) => {
    try {
        res.send('Buyer Added')
    } catch (error) {
        res.send(error.message)
    }
}