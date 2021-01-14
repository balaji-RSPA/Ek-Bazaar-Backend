const _ = require('lodash');

const { sellers } = require('../modules')
const { getAllSellers } = sellers

exports.updateSelleProfileChangesToProducts = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log(' updates eller------')
        const result = await getAllSellers('', { profileUpdate: true }, '', 0, 5)
        console.log("🚀 ~ file: cron.js ~ line 12 ~ exports.updateSelleProfileChangesToProducts= ~ result", result.length)

    } catch (error) {
        console.log(error, ' error')

    }

})