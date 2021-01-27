const { reject } = require('lodash');
const _ = require('lodash');

const { sellers, mastercollections, sellerProducts, SMSQue } = require('../modules')
const { getAllSellers, getUpdatedSellerDetails, getSellerProductDetails, addProductDetails } = sellers
const { updateMaster } = mastercollections
const { getSellerProducts, updateSellerProducts } = sellerProducts
const { getQueSMS, updateQueSMS } = SMSQue
const { sendSMS } = require('../utils/utils')

exports.sendQueSms = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log(' cron testingf')
        const updateIds = []
        const result = await getQueSMS({ status: true }, { skip: 0, limit: 10 })
        // console.log("🚀 ~ file: cron.js ~ line 16 ~ exports.sendQueSms= ~ result", result)
        if (result && result.length) {

            for (let index = 0; index < result.length; index++) {
                const seller = result[index];

                const data = await sendSMS(seller.mobile.mobile, seller.message)
                updateIds.push(seller._id)
                console.log(index, ' index')

            }

            if (updateIds && updateIds.length) {
                await updateQueSMS({ _id: { $in: updateIds } }, { status: false })
                console.log('-----------  SMS QUE Ids UPDATED ----------------')
            }
        } else {
            console.log(' --------------- NO SMS IN QUEUE ----------------------')
        }
        resolve()

    } catch (error) {
        console.log(error)
        reject()

    }

})

const masterMapData = (val, type) => new Promise((resolve, reject) => {
    console.log("🚀 ~ file: sellersController.js ~ line 395 ~ masterMapData ~ val", JSON.stringify(val.sellerId))
    const _Scity = [];
    let serviceProductData;
    if (val.serviceCity && val.serviceCity.length) {
        // delete val.serviceCity._id
        serviceProductData = _.map(val.serviceCity, function (c) {
            return _.omit(c, ['region', '_id']);
        });
    }
    val.serviceCity && val.serviceCity.length && val.serviceCity.map((v) => {
        _Scity.push(v.city && v.city.name.toLowerCase())
        _Scity.push(v.state && v.state.name.toLowerCase())
        _Scity.push(v.country && v.country.name.toLowerCase())
        _Scity.push(v.region && v.region.toLowerCase())
    })
    if (val.sellerId && val.sellerId.location) {
        delete val.sellerId.location.city
        console.log(val.sellerId.location.city, 'location deletttttttttttttttttttt')
    }

    let keywords = []
    keywords.push(val.sellerId.name.toLowerCase())
    keywords.push(val.serviceType && val.serviceType.name.toLowerCase())
    keywords.push(val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId[0].name.toLowerCase())
    keywords.push(val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId[0].name.toLowerCase())
    keywords.push(val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId[0].name.toLowerCase())
    keywords.push(val.poductId && val.poductId.length && val.poductId[0].name.toLowerCase())
    keywords.push(val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId[0].name.toLowerCase())
    keywords.push(val.productDetails && val.productDetails.name.toLowerCase())
    keywords.push(val.productDetails && val.productDetails.productDescription && val.productDetails.productDescription.toLowerCase())
    keywords.push(..._Scity)

    keywords = _.without(_.uniq(keywords), '', null, undefined, 0)
    let data;
    if (type === "update") {
        data = {
            productDetails: val.productDetails && val.productDetails || null,
            status: val.status || true,
            batch: 1,
            keywords,
            serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
        }

    } else {
        data = {
            sellerId: val.sellerId && {
                location: val.sellerId && val.sellerId.location || null,
                name: val.sellerId && val.sellerId.name || null,
                email: val.sellerId && val.sellerId.email || null,

                sellerType: val.sellerId && val.sellerId.sellerType && val.sellerId.sellerType.length && {
                    _id: val.sellerId.sellerType[0]._id,
                    name: val.sellerId.sellerType[0].name
                } || null,

                _id: val.sellerId && val.sellerId._id || null,
                mobile: val.sellerId && val.sellerId.mobile || null,
                website: val.sellerId.website || null,
                isEmailVerified: val.sellerId.isEmailVerified || false,
                isPhoneVerified: val.sellerId.isPhoneVerified || false,
                sellerVerified: val.sellerId.sellerVerified || false,
                paidSeller: val.sellerId.paidSeller || false,
                international: val.sellerId.international || false,
                deactivateAccount: val.sellerId.deactivateAccount && val.sellerId.deactivateAccount.status || false,
                businessName: val.sellerId.busenessId && val.sellerId.busenessId.name || null
            } || null,
            userId: val.sellerId && val.sellerId.userId && {
                name: val.sellerId.name || null,
                _id: val.sellerId.userId
            } || null,
            productDetails: val.productDetails && val.productDetails || null,
            status: val.status || true,
            batch: 1,
            keywords,
            serviceType: val.serviceType && {
                _id: val.serviceType._id,
                name: val.serviceType.name
            } || null,
            parentCategoryId: val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId || null,
            primaryCategoryId: val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId || null,
            secondaryCategoryId: val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId || null,
            poductId: val.poductId && val.poductId.length && val.poductId || null,
            productSubcategoryId: val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId || null,
            // serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
            serviceCity: val.serviceCity && val.serviceCity.length && serviceProductData || null
        }

    }

    // if (type === 'insert') {
    //     data = {
    //         ...data,
    //         _id: val._id
    //     }
    // }
    resolve(data)

})

exports.updateSelleProfileChangesToProducts = async (req, res) => new Promise(async (resolve, reject) => {

    try {

        console.log(' updates eller------')
        const result = await getUpdatedSellerDetails({ profileUpdate: true }, 0, 1)
        console.log("🚀 ~ file: cron.js ~ line 153 ~ exports.updateSelleProfileChangesToProducts= ~ result", result)
        for (let index = 0; index < result.length; index++) {
            const seller = result[index];
            // const products = seller.sellerProductId
            const products = await getSellerProductDetails({ _id: { $in: seller.sellerProductId } })

            console.log("🚀 ~ file: cron.js ~ line 12 ~ exports.updateSelleProfileChangesToProducts= ~ result", JSON.stringify(products))
            for (let i = 0; i < products.length; i++) {
                const pro = products[index];

                const formateData = await masterMapData(pro, 'insert')
                // const updateResult = await addProductDetails({ _id: pro._id }, { keywords: formateData.keywords })
                // const masResult = await updateMaster({ _id: pro._id }, { sellerId: formateData.sellerId })
                console.log("🚀 ~ file: cron.js ~ line 115 ~ exports.updateSelleProfileChangesToProducts= ~ formateData", JSON.stringify(formateData))
            }


        }

    } catch (error) {
        console.log(error, ' error')

    }

})

exports.updateKeywords = async (req, res) => new Promise(async (resolve, reject) => {

    // try {
    //     const date1 = new Date(1610409601000).toISOString()
    //     console.log('keywords-------------', new Date(1610409601000).toISOString())
    //     const data = await getSellerProducts({ flag: 0, createdAt: { $lt: date1 } }, 0, 1000)
    //     console.log(data.length, ' ---- Prodoct count')
    //     // console.log("🚀 ~ file: cron.js ~ line 145 ~ exports.updateKeywords= ~ data", JSON.stringify(data))
    //     const updateIds = []
    //     if (data.length) {

    //         for (let index = 0; index < data.length; index++) {
    //             const product = data[index];
    //             let keywords = product.keywords
    //             let _Scity = product.keywords
    //             if (product.serviceCity && product.serviceCity.length) {
    //                 // console.log(product.serviceCity, ' tttttttttt')
    //                 product.serviceCity.map((v) => {
    //                     const alea = v.city && v.city.alias && v.city.alias.length && v.city.alias.map((al) => al.toLowerCase()) || null
    //                     if (alea && alea.length) {
    //                         // console.log(product._id)
    //                         _Scity.push(...alea)
    //                     }
    //                     // console.log(alea, ' -------------')
    //                     _Scity.push(v.city && v.city.name.toLowerCase())
    //                     _Scity.push(v.state && v.state.name.toLowerCase())
    //                     _Scity.push(v.country && v.country.name.toLowerCase())
    //                     _Scity.push(v.state && v.state.region && v.state.region.toLowerCase())
    //                 })
    //                 _Scity = _.without(_.uniq(_Scity), '', null, undefined, 0)
    //                 console.log(_Scity, ' Keywords----------------')


    //                 const updateResult = await addProductDetails({ _id: product._id }, { keywords: _Scity })
    //                 const masResult = await updateMaster({ _id: product._id }, { keywords: _Scity })

    //             }
    //             updateIds.push(product._id)
    //             console.log(' running count ---- ', index)
    //         }

    //         if (updateIds.length) {

    //             const updateResult = await updateSellerProducts({ _id: { $in: updateIds } }, { flag: 2 })
    //             console.log(updateIds, ' -------update query------')
    //         }
    //     } else {

    //         console.log('----- No Products to update keywords ----------')

    //     }
    //     console.log('---------Completed mapping--------------')
    //     resolve()

    // } catch (error) {
    //     console.log(error)
    // }

})