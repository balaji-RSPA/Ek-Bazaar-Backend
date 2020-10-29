const { 
    getAllCategories,
    addParentCategory,
    addParentCategories,
    getParentCategory,
    updateParentCategory,
    addPrimaryCategories,
    addPrimaryCategory,
    getPrimaryCategory,
    updatePrimaryCategory,
    addSecondaryCategories,
    addSecondaryCategory,
    getSecondaryCategory,
    addProductCategories,
    addProductCategory,
    getProductCategory,
    updateSecondaryCategory
} = require('../../modules/categoryModule')
const camelcaseKeys = require('camelcase-keys');
const { respSuccess, respError } = require('../../utils/respHadler');


module.exports.getAllCategories = async (req, res) => {

    try {
        const reqQuery = camelcaseKeys(req.query)
        let qery = {
            status: true
        }
        if(reqQuery.status){
            qery = {
                status: reqQuery.status
            }
        }
        const result = await getAllCategories(qery)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

// Parent Categories
module.exports.addParentCategories = async (req, res) => {

    try {

        const reqData = req.body
        const result = await addParentCategories(reqData)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.addParentCategory = async (req, res) => {

    try {

        const reqData = req.body
        const result = await addParentCategory(reqData)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.getParentCategory = async (req, res) => {

    try {

        const id = req.params.id;
        const reqQuery = camelcaseKeys(req.query)
        const query ={
            id,
            reqQuery
        }
        const result = await getParentCategory(query)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

// Primary Categories
module.exports.addPrimaryCategories = async (req, res) => {

    try {

        const reqData = req.body
        const result = await addPrimaryCategories(reqData)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.addPrimaryCategory = async (req, res) => {

    try {

        const reqData = req.body
        const parentCatId = req.body.parentCatId
        const parentData = await getParentCategory(parentCatId)
        const result = await addPrimaryCategory(reqData)
        const primarydata= {
            primaryCategotyId: parentData.primaryCategotyId.concat(result._id)
        }
        await updateParentCategory(parentCatId, primarydata)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.getPrimaryCategory = async (req, res) => {

    try {

        const id = req.params.id;
        const { skip, limit} = req.query
        const query = {
            id,
            skip,
            limit
        }
        const result = await getPrimaryCategory(query)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

// Secondary Categories

module.exports.addSecondaryCategory = async (req, res) => {

    try {

        const reqData = req.body
        const primaryCatId = req.body.primaryCatId
        const primaryData = await getPrimaryCategory(primaryCatId)
        console.log("module.exports.addSecondaryCategory -> primaryData", primaryData)

        const result = await addSecondaryCategory(reqData)
        const formData= {
            secondaryCategotyId: primaryData.secondaryCategotyId.concat(result._id)
        }
        await updatePrimaryCategory(primaryCatId, formData)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.getSecondaryCategory = async (req, res) => {

    try {

        const id = req.params.id;
        const result = await getSecondaryCategory(id)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

// Products categories
module.exports.addProduct = async (req, res) => {

    try {

        const reqData = req.body
        const secCatId = req.body.secondaryId
        const secData = await getSecondaryCategory(secCatId)

        const result = await addProductCategory(reqData)
        const formData= {
            productId: secData.productId.concat(result._id)
        }
        await updateSecondaryCategory(secCatId, formData)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.getProduct = async (req, res) => {

    try {

        const id = req.params.id;
        const result = await getProductCategory(id)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}
