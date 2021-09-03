const moment = require('moment')
const {
    getAllPrimaryCategory,
    updatePrimaryCategory,
    getSecondaryCategoryByName,
    updateSecondaryCategory
} = require('../../modules/categoryModule')
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');

const { getMasterRecords, updateMasterBulkProducts, updateMaster, getMaster, bulkDeleteMasterProducts } = require('../../modules/masterModule')

const { getSellerPlan, deleteSellerPlans } = require('../../modules/sellerPlanModule')
const { getUserList, deleteBuyer, deleteUser } = require('../../modules/buyersModule')
const { searchProducts, deleteSellerProducts } = require('../../modules/sellerProductModule')
const { getAllSellerData, deleteSellerRecord } = require('../../modules/sellersModule');
const { getCountryData, addCity, getCity } = require('../../modules/locationsModule')

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

module.exports.deleteTestData = async (req, res) => new Promise(async (resolve, reject) => {
    try {

        console.log('tyest data delete-----------------')
        const result = await getUserList({ /* _id: "60696bce36878670aa4863eb"  *//* name: "test" */  $where: "/^1.*/.test(this.mobile)" }, 1000)
        console.log("🚀 ~ file: testController.js ~ line 135 ~ module.exports.deleteTestData ~ result", result)
        const userIds = []
        const sellerIds = []
        // if (result && result.length) {
        //     for (let index = 0; index < result.length; index++) {
        //         const user = result[index];
        //         const userId = user._id
        //         userIds.push(user._id)
        //         const sellers = await getAllSellerData({userId},{ skip:0, limit: 1000})
        //         if(sellers && sellers.length){
        //             for (let index = 0; index < sellers.length; index++) {
        //                 const _seller = sellers[index];
        //                 const sellerId= _seller._id
        //                 sellerIds.push(sellerId)
        //                 const productids = _seller.sellerProductId
        //                 console.log("-- Product ids ", productids)
        //                 const m_dele = await bulkDeleteMasterProducts({_id: {$in: productids }})
        //                 console.log('-------- delete master---------')
        //                 const p_dele = await deleteSellerProducts({_id: {$in: productids }})
        //                 console.log('-------- delete  Seller Products---------')

        //                 const delMaster1 = await deleteSellerPlans({ sellerId: sellerId });
        //                 console.log('-------- delete  Seller Plan---------')
        //                 const _sellerDel = await deleteSellerRecord(sellerId);
        //                 console.log('-------- delete  Seller Data---------')
        //                 const _buyer = await deleteBuyer({ userId:userId })
        //                 console.log('-------- delete  Buyer Data---------')
        //             }
        //         }

        //     }
        //     const del = await deleteUser({_id: {$in : userIds}})
        //     console.log('------- User Ids Deleted -----------')
        //     console.log(sellerIds, userIds, ' -------- deletion comnpletes-------')
        respSuccess(res, result)
        // }else{
        //     respError(res, "No user list")
        // }
    } catch (error) {
        console.log(error, ' jjjjjjjjjjjjjjjjjjjjj')
    }
})

module.exports.uploadInternationalCity = async (req, res) => new Promise(async (resolve, reject) => {

    try {
        const data = req.body

        if (data && data.length) {

            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                const country = await getCountryData({ serialNo: element.countryCode.toString() })
                console.log("🚀 country------ ", country && country.name)
                const name = element.city.toLowerCase()
                console.log(name, element, ' --------------')
                const cData = {
                    name,
                    state: null,
                    country: country && country._id,
                    iso2: element && element.iso2 || null,
                    iso3: element && element.iso3 || null,
                    alias: [name]
                }
                const city = await getCity({
                    name: {
                        $regex: name, $options: 'i'
                    }
                })
                console.log(city, ' ---------------')
                if (!city) {
                    const _city = await addCity(cData)
                } else {
                    console.log(name, ' ---- Exist city ----')
                }
                console.log(index, name, '--------------- Index')
            }

        }
        console.log('----- Uploade All Data Succesfully---------')
        respSuccess(res, 'uploaded---')

    } catch (error) {

        respError(res, error)

    }
})

module.exports.gujaratSellerData = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log('gujarat seller date -----')
        const data = await getAllSellerData({"location.city": ObjectId("6058831286dcf826a46bf4ad")})
        console.log("🚀 ~ file: testController.js ~ line 229 ~ module.exports.gujaratSellerData= ~ data", data)
    } catch (error) {

    }
})