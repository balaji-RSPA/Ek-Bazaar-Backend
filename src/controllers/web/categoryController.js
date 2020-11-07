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
    updateSecondaryCategory,
    getAllSellerTypes,
    addSellerType,
    // checkParentCategory,
    getParentCat,
    getSecondaryCat,
    getPrimaryCat,
    getAllProducts,
} = require('../../modules/categoryModule')
const camelcaseKeys = require('camelcase-keys');
const { respSuccess, respError } = require('../../utils/respHadler');

module.exports.addSellerType = async(req, res) => {
    try {
        const reqData = req.body
        const result = await addSellerType(reqData)
        respSuccess(res, result)
    } catch (error) {
        respError(error)
    }
}

module.exports.getAllSellerTypes = async(req, res) => {
    try {
        const result = await getAllSellerTypes()
        respSuccess(res, result)
    } catch (error) {
        respError(error)
    }
}

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
            search:reqQuery.search
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
        let bulkData =[]
        for (let index = 0; index < reqData.length; index++) {
            const element = reqData[index];
            const query = {
                vendorId: element.parentId.toString()
            }
            // const parentCatId = await checkParentCategory(query)
            const parentCat = await getParentCat(query)
            const primaryData = {
                ...element,
                parentCatId: parentCat._id
            }
            const result = await addPrimaryCategory(primaryData)
            const updateData= {
                primaryCategotyId: parentCat.primaryCategotyId.concat(result._id)
            }
            await updateParentCategory(parentCat._id, updateData)
            // bulkData.push(primaryData)
            
        }
        respSuccess(res, 'Uploaded Successfully')
        
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
        const result = await getPrimaryCategory(id)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

// Secondary Categories

module.exports.addSecondaryCategories = async (req, res) => {

    try {

        const reqData = req.body
        for (let index = 0; index < reqData.length; index++) {
            const element = reqData[index];
            const query = {
                vendorId: element.primaryCatId.toString()
            }
            const parentCat = await getPrimaryCat(query)
            // console.log("module.exports.addSecondaryCategories -> parentCat", parentCat)
            const secData = {
                ...element,
                primaryCatId: parentCat._id
            }
            const result = await addSecondaryCategory(secData)
            const updateData= {
                secondaryCategotyId: parentCat.secondaryCategotyId.concat(result._id)
            }
            console.log(index, '------', element.primaryCatId, '---',element.l1, 'Count-----')
            await updatePrimaryCategory(parentCat._id, updateData)
            
        }
        console.log('COmpleted +++++++++++++')
        respSuccess(res, 'Uploaded Successfully')
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.addSecondaryCategory = async (req, res) => {

    try {

        const reqData = req.body
        const primaryCatId = req.body.primaryCatId
        const primaryData = await getPrimaryCategory(primaryCatId)

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


module.exports.addBulkProducts = async (req, res) => {

    try {

        const reqData = req.body
        for (let index = 0; index < reqData.length; index++) {
            const element = reqData[index];
            const query = {
                vendorId: element.secondaryId.toString()
            }
            const parentCat = await getSecondaryCat(query)
            if(parentCat){
                const productData = {
                    ...element,
                    secondaryId: parentCat._id
                }
                const result = await addProductCategory(productData)
                const updateData= {
                    productId: parentCat.productId.concat(result._id)
                }
                console.log(index, "COunt----", element.l1, element.vendorId)
                await updateSecondaryCategory(parentCat._id, updateData)
            }
            
        }
        console.log('Completed +++++++++++++++')
        respSuccess(res, 'Uploaded Successfully')
        
    } catch (error) {

        respError(error)
        
    }

}

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

module.exports.getAllProducts = async (req, res) => {

    try {
        const reqQuery = req.query
        console.log("reqQuery Product ---------", reqQuery)
        const result = await getAllProducts(reqQuery)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

module.exports.getRelatedCategories = async (req, res) => {

    try {
        const id = req.params.id
        console.log("module.exports.getRelatedCategories -> id", id)
        const result = await getPrimaryCategory(id)
        respSuccess(res, result)
        
    } catch (error) {

        respError(error)
        
    }

}

