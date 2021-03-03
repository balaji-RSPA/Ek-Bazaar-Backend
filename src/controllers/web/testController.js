const moment = require('moment')
const { getAllPrimaryCategory,
    updatePrimaryCategory,
    getSecondaryCategoryByName,
    updateSecondaryCategory
} = require('../../modules/categoryModule')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');

const { getMasterRecords, updateMasterBulkProducts, updateMaster } = require('../../modules/masterModule')

const { getSellerPlan } = require('../../modules/sellerPlanModule')

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
        const result = await getSecondaryCategoryByName({ l1: "true" })
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

module.exports.updatePriority = async (req, res) => new Promise(async (resolve, reject) => {

    try {


        const result = await getMasterRecords({ flag: 1 }, { skip: 0, limit: 1000 })
        // console.log(JSON.stringify(result[0].sellerId._id), 'update preiority')
        let updateIds = []
        if (result.length) {
            for (let index = 0; index < result.length; index++) {
                let priority = 0
                const element = result[index];
                if (!element.userId) {
                    // console.log('4-------------')
                    priority = 4
                } else if (element.sellerId._id && element.sellerId._id.planId) {
                    // console.log('3-------------')
                    const plan = await getSellerPlan({ _id: element.sellerId._id.planId })
                    if (plan) {
                        const currentDate = moment().format('YYYY-MM-DD')
                        const expireDate = moment(plan.exprireDate).format('YYYY-MM-DD')
                        // console.log(moment(currentDate).isSameOrAfter(expireDate), ' ggggggggggggggg')

                        if (plan.isTrial) {
                            priority = 2
                        } else if (moment(currentDate).isSameOrAfter(expireDate)) {
                            priority = 3
                        } else if (!moment(currentDate).isSameOrAfter(expireDate)) {
                            priority = 1
                        }
                    } else {
                        priority = 4
                    }

                } else {
                    priority = 4
                }
                const updateData = {
                    priority
                }
                updateIds.push(element._id)
                await updateMaster({ _id: element._id }, updateData)
            }
            console.log(updateIds, ' Updated ids result-----------')
            await updateMasterBulkProducts({ _id: { $in: updateIds } }, { flag: 2 })
            console.log(' -------- Proprity Mapping COmpletes --------------')
        } else {
            console.log('----------------- NO master records -------------')
        }
        resolve()
    } catch (error) {
        console.log(error)

        reject(error)
    }

})