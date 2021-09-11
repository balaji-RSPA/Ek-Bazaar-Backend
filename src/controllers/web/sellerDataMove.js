const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const fs = require('fs').promises
const { getAllSellerDetails,
    addSellerStatutory,
    addSellerBusiness,
    addSellerCompany,
    addSellerContact,
    addSellerEstablishment,

    getLevelOne,
    getLevelTwo,
    getLevelThree,
    getLevelFour,
    getLevelFive
} = require('../../modules/sellerDataMoveModule')
const { location, category } = require('../../modules')
const { getCountry, getState, getCity, checkState, getSelectedCountries, getSelectedStates, getFilteredCities } = location
// const { getParentCat, getSpecificCategories, getPrimaryCat } = category

module.exports.uploadOnBoardSeller = async (req, res) => {

    try {
        console.log(' upload seller data ......')
        const result = await getAllSellerDetails({ /* userId: { $ne: null } */ "mobile.mobile": "9916905753" })
        const filePath = `public/sellerUploadedbleData.json`
        const err = await fs.writeFile(filePath, JSON.stringify(result))
        if (err) throw err;

        // if (result && result.length) {
        //     for (let index = 0; index < result.length; index++) {
        //         const seller = result[index];

        //         let sellerBusiness = null
        //         let sellercontactDetails = null
        //         let sellerStatutoryDetails = null
        //         let sellerEstablisment = null
        //         let sellerCompanyDetails = null

        //         // if (seller && seller.busenessId) {
        //         //     sellerBusiness = await getSellerBusinessDetails({ _id: seller.busenessId })
        //         // }
        //         // console.log(sellerBusiness, ' rrrrrrrrr')





        //     }
        // }
        respSuccess(res, { count: result.length, result/* : result[0].sellerProductId */ })

    } catch (error) {

        console.log(error)
        respError(error)

    }
}

const locationMap = async (location, seller = {}, type = '') => {
    let { city, state, country } = location
    let existingCity = city

    city = city && city.name ? await getCity({ name: city.name }) : null
    state = state && state.name ? await checkState({ name: state.name.toString() }) : null
    country = country ? await getCountry({ _id: country._id }) : null
    if (existingCity && existingCity._id && !city) {
        console.log(seller && seller.name, `${type} city ot exist -----------`)
    }
    return {
        city: city && city._id || null,
        state: state && state._id || null,
        country: country && country._id || null,
        region: state && state.region || null
    }
}

const productStructure = async (product, sell = {}) => {
    let { parentCategoryId, primaryCategoryId, secondaryCategoryId, poductId, productSubcategoryId, productDetails, serviceCity } = product

    const _sList = []
    let details = {
        ...product
    }
    // Product Service City Mapping
    if (serviceCity && serviceCity.length) {
        console.log('--------- Product Service City mapping --------------')
        for (let index = 0; index < serviceCity.length; index++) {
            const _serviceCity = serviceCity[index];

            const service_City = await locationMap(_serviceCity, sell, "Products")
            _sList.push(service_City)
        }
        details = {
            ...details,
            serviceCity: _sList
        }
    }

    // Level 1 category mapping 
    if (parentCategoryId && parentCategoryId.length) {
        console.log('----- Product parent cat mapping ------')
        const l1List = parentCategoryId.map((v) => v.name)
        const list = await getLevelOne({ name: { $in: l1List } })
        if (!list.length) {
            console.log('------ Parent Category Not exist ----------', sell && sell.name, product && product._id)
        } else {
            parentCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                parentCategoryId
            }
        }
    }

    // Level 2 category mapping 
    if (primaryCategoryId && primaryCategoryId.length) {
        console.log('------- Product primary cat mapping ------')
        const l2List = primaryCategoryId.map((v) => v.name)
        const list = await getLevelTwo({ name: { $in: l2List } })
        if (!list.length) {
            console.log('-------- Primary Category Not exist ----------', sell && sell.name, product && product._id)
        } else {
            primaryCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                primaryCategoryId
            }
        }
    }
    // Level 3 category mapping 
    if (secondaryCategoryId && secondaryCategoryId.length) {
        console.log('--------- Product secondary cat mapping ------')
        const l3List = secondaryCategoryId.map((v) => v.name)
        const list = await getLevelThree({ name: { $in: l3List } })
        if (!list.length) {
            console.log('-------- Secondary Category Not exist ----------', sell && sell.name, product && product._id)
        } else {
            secondaryCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                secondaryCategoryId
            }
        }
    }
    // Level 4 category mapping 
    if (poductId && poductId.length) {
        console.log('----------- Product products cat mapping ------')
        const l4List = poductId.map((v) => v.name)
        const list = await getLevelFour({ name: { $in: l4List } })

        if (!list.length) {
            console.log('-------- Product Category Not exist ----------', sell && sell.name, product && product._id)
        } else {
            poductId = list.map((v) => v._id)
            details = {
                ...details,
                poductId
            }
        }
    }
    // Level 5 category mapping 
    if (productSubcategoryId && productSubcategoryId.length) {
        console.log('----------- Product products cat mapping ------')
        const l5List = productSubcategoryId.map((v) => v.name)
        const list = await getLevelFive({ name: { $in: l5List } })

        if (!list.length) {
            console.log('-------- product productsub Category Not exist ----------', sell && sell.name, product && product._id)
        } else {
            productSubcategoryId = list.map((v) => v._id)
            details = {
                ...details,
                productSubcategoryId
            }
        }
    }

    if (productDetails) { // Product details map
        let { countryOfOrigin, regionOfOrigin, cityOfOrigin, sellingCountries, sellingStates, sellingCities } = productDetails
        if (countryOfOrigin) {
            productDetails["countryOfOrigin"] = countryOfOrigin._id || null
        }
        if (regionOfOrigin) {
            productDetails["regionOfOrigin"] = regionOfOrigin._id || null
        }
        if (cityOfOrigin) {
            const cofo = cityOfOrigin && cityOfOrigin.name ? await getCity({ name: cityOfOrigin.name }) : null
            productDetails["cityOfOrigin"] = cofo && cofo._id || null
        }

        if (sellingCountries && sellingCountries.length) {
            productDetails["sellingCountries"] = sellingCountries.map((c) => c._id) || []
        }

        if (sellingStates && sellingStates.length) {
            productDetails["sellingStates"] = sellingStates.map((c) => c._id) || []
        }

        if (sellingCities && sellingCities.length) {
            const li = sellingCities.map((c) => c.name)
            const sc = await getFilteredCities({ name: { $in: li } })

            productDetails["sellingCities"] = sc && sc.length && sc.map((v) => v._id) || []
        }
    }
    return details
}

const masterMap = async (seller, product) => {
    console.log("🚀 ~ file: sellerDataMove.js ~ line 214 ~ masterMap ~ seller, product", seller, product)
    // const data = {
    //     sellerId: val.sellerId && {
    //         location: val.sellerId && val.sellerId.location || null,
    //         name: val.sellerId && val.sellerId.name || null,
    //         email: val.sellerId && val.sellerId.email || null,

    //         sellerType: val.sellerId && val.sellerId.sellerType && val.sellerId.sellerType.length && {
    //             _id: val.sellerId.sellerType[0]._id,
    //             name: val.sellerId.sellerType[0].name
    //         } || null,

    //         _id: val.sellerId && val.sellerId._id || null,
    //         mobile: val.sellerId && val.sellerId.mobile || null,
    //         website: val.sellerId.website || null,
    //         isEmailVerified: val.sellerId.isEmailVerified || false,
    //         isPhoneVerified: val.sellerId.isPhoneVerified || false,
    //         sellerVerified: val.sellerId.sellerVerified || false,
    //         paidSeller: val.sellerId.paidSeller || false,
    //         international: val.sellerId.international || false,
    //         deactivateAccount: val.sellerId.deactivateAccount && val.sellerId.deactivateAccount.status || false,
    //         businessName: val.sellerId.busenessId && val.sellerId.busenessId.name || null,
    //         contactDetails: contactDetails,
    //     } || null,
    //     userId: val.sellerId && val.sellerId.userId && {
    //         name: val.sellerId.name || null,
    //         _id: val.sellerId.userId
    //     } || null,
    //     productDetails: val.productDetails && val.productDetails || null,
    //     status: val.status !== null && val.status !== undefined ? val.status : true,
    //     batch: 1,
    //     keywords,
    //     serviceType: val.serviceType && {
    //         _id: val.serviceType._id,
    //         name: val.serviceType.name
    //     } || null,
    //     parentCategoryId: val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId || null,
    //     primaryCategoryId: val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId || null,
    //     secondaryCategoryId: val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId || null,
    //     poductId: val.poductId && val.poductId.length && val.poductId || null,
    //     productSubcategoryId: val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId || null,
    // }

}


module.exports.moveSellerToNewDB = async (req, res) => {
    try {
        console.log(' move sellers -----------')
        let _sel;
        const filePath = `public/sellerUploadedbleData.json`
        const rowData = await fs.readFile(filePath)
        const data = JSON.parse(rowData)
        if (data && data.length) {
            for (let index = 0; index < data.length; index++) {
                const sell = data[index];
                let sellerBusiness = null
                let sellerStatutoryDetails = null
                let sellerCompanyDetails = null
                let sellercontactDetails = null
                let sellerEstablisment = null
                let planDetails = null
                let { busenessId, statutoryId, establishmentId, sellerCompanyId, sellerContactId, planId, location, sellerProductId } = sell
                let seller = {
                    ...sell
                }

                if (busenessId) {
                    sellerBusiness = busenessId
                    seller = {
                        ...seller,
                        busenessId: busenessId._id || null
                    }
                }
                if (statutoryId) {
                    sellerStatutoryDetails = statutoryId
                    // await addSellerStatutory(statutoryId)
                    seller = {
                        ...seller,
                        statutoryId: statutoryId._id || null
                    }
                }
                if (sellerCompanyId) {
                    sellerCompanyDetails = sellerCompanyId
                    // await addSellerCompany(sellerCompanyId)
                    seller = {
                        ...seller,
                        sellerCompanyId: sellerCompanyId._id || null
                    }
                }
                if (sellerContactId) {
                    sellercontactDetails = sellerContactId
                    // await addSellerContact(sellerContactId)
                    seller = {
                        ...seller,
                        sellerContactId: sellerContactId._id || null
                    }
                }
                if (establishmentId) {
                    sellerEstablisment = establishmentId
                    // await addSellerEstablishment(establishmentId)
                    seller = {
                        ...seller,
                        establishmentId: establishmentId._id || null
                    }
                }
                if (planId) {
                    seller = {
                        ...seller,
                        planId: planId._id || null
                    }
                    planDetails = planId
                }
                if (sell.location, sell) { // Seller location map
                    console.log(sell.name, ' -------Seller Locatio mapping -------------')
                    location = await locationMap(location, sell)
                    seller = {
                        ...seller,
                        location: location || null
                    }
                }
                if (sellerProductId && sellerProductId.length) { // seller products map
                    let allProd = []
                    for (let i = 0; i < sellerProductId.length; i++) {
                        const product = sellerProductId[i];
                        const proStructure = await productStructure(product, sell)
                        allProd.push(proStructure)

                    }
                    const masterData = await masterMap(sell, allProd)
                    seller = {
                        ...seller,
                        sellerProductId: allProd /* && allProd.length && allProd.map((v) => v._id) */ || []
                    }

                }
                _sel = seller



            }
        }
        respSuccess(res, _sel)
    } catch (error) {

        console.log(error)
        respError(error)

    }
}