const { getAllPrimaryCategory,
    updatePrimaryCategory,
    getSecondaryCategoryByName,
    updateSecondaryCategory
} = require('../../modules/categoryModule')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
module.exports.updateLevel2l1Data = async (req, res) => {

    try {
        const result = await getAllPrimaryCategory('', 0, 1000)
        console.log(result, result.length, 'testing')
        for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const updateData = {
                l1: element.parentCatId.vendorId
            }
            const updateResult = await updatePrimaryCategory(element._id, updateData)
            console.log(index, "  updateData", updateResult)
            
        }
        console.log('Completed++++++++++++')
        respSuccess(res, 'updated successfully')
        
    } catch (error) {

        console.log(error)
        respError(error)
        
    }

}

module.exports.updateLevel3l1Data = async (req, res) => {

    try {
        const result = await getSecondaryCategoryByName({l1: "true"})
        console.log(result, result.length, 'testing')
        for (let index = 0; index < result.length; index++) {
            const element = result[index];
            const updateData = {
                l1: element.primaryCatId.l1
            }
            console.log(element._id, ' ---- id')
            const updateResult = await updateSecondaryCategory(element._id, updateData)
            console.log(index, "  updateData", updateResult)

        }
        console.log('Completed++++++++++++')
        // respSuccess(res, 'updated successfully')

    } catch (error) {

        console.log(error)
        respError(error)

    }

}