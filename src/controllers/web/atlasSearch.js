const camelcaseKeys = require("camelcase-keys")
const { searchSellers } = require("../../modules/atlasSearch")
const { respSuccess, respError } = require("../../utils/respHadler")

const searchSeller = async function(req, res) {
    try {
        const {skip, limit, keyword} = camelcaseKeys(req.query)
        
        console.log("🚀 ~ file: atlasSearch.js ~ line 7 ~ searchSeller ~ reqQuery", req.query)
        const result = await searchSellers({skip, limit, keyword})
        console.log("🚀 ~ file: atlasSearch.js ~ line 11 ~ searchSeller ~ result", result)
        respSuccess(res, result)
    } catch (error) {
        respError(res, error.message)
    }
}

module.exports = Object.assign({}, {searchSeller})
