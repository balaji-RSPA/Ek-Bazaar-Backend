const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const moment = require('moment')
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
    getLevelFive,

    getAllMasterProducts
} = require('../../modules/sellerDataMoveModule')
const { location, category } = require('../../modules')
const { getCountry, getState, getCity, checkState, getSelectedCountries, getSelectedStates, getFilteredCities } = location
const { /* getParentCat, getSpecificCategories, getPrimaryCat, */ getSellerType } = category

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

const mapPriority = (plan) => new Promise((resolve, reject) => {
    let priority = 4
    if (plan && plan.sellerId) {
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

    }
    resolve(priority)

})

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
    let { parentCategoryId, primaryCategoryId, secondaryCategoryId, poductId, productSubcategoryId, productDetails, serviceCity, offers, serviceType } = product

    const _sList = []
    let details = {
        ...product
    }
    if (serviceType) {
        details = {
            ...details,
            serviceType: serviceType && serviceType._id || null
        }
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
        if (offers) {
            let { location } = offers
            city = location && location.city && location.city.label ? await getCity({ name: location.city.label.toLowerCase() }) : null

            offers = {
                ...offers,
                location: {
                    city: city && city.name ? {
                        label: city.name || null,
                        value: city._id || null
                    } : null,
                    state: location && location.state || null
                }
            }
            details = {
                ...details,
                offers: offers
            }
        }
    }
    return details
}

const masterMap = async (seller, product, offers, priority, planExpire) => {
    const sType = seller && seller.sellerType && seller.sellerType.length && seller.sellerType[0] ? await getSellerType({ _id: seller.sellerType[0] }) : null
    let _offers = null
    if (product && product.offers) {
        let { location } = product.offers
        city = location && location.city && location.city.label ? await getCity({ name: location.city.label.toLowerCase() }) : null

        _offers = {
            ...product.offers,
            location: {
                city: city && city.name ? {
                    label: city.name || null,
                    value: city._id || null
                } : null,
                state: location && location.state || null
            }
        }
    }
    const data = {
        ...product,
        serviceType: product && product.serviceType && product.serviceType._id && [product.serviceType] || null,
        priority: priority || 1,
        sellerId: seller && {
            location: seller && seller.location && {
                city: seller && seller.location && seller.location.city &&
                    { name: seller.location.city.name || null, _id: seller.location.city._id } || null,
                state: seller && seller.location && seller.location.state &&
                    { name: seller.location.state.name || null, _id: seller.location.state._id } || null,
                country: seller && seller.location && seller.location.country &&
                    { name: seller.location.country.name || null, _id: seller.location.country._id } || null,
                address: null,
                pincode: null
            } || null,
            name: seller && seller.name || null,
            email: seller && seller.email || null,

            sellerType: sType && sType._id && [{
                _id: sType._id,
                name: sType.name
            }] || null,

            _id: seller && seller._id || null,
            mobile: seller && seller.mobile || null,
            website: seller && seller.website || null,
            isEmailVerified: seller && seller.isEmailVerified || false,
            isPhoneVerified: seller && seller.isPhoneVerified || false,
            sellerVerified: seller && seller.sellerVerified || false,
            paidSeller: seller && seller.paidSeller || false,
            international: seller && seller.international || false,
            status: seller && seller.status || true,
            deactivateAccount: seller && seller.deactivateAccount && seller.deactivateAccount.status || false,
            businessName: seller.busenessId && seller.busenessId.name || null,
            planExpired: planExpire || false,

            contactDetails: seller && seller.sellerContactId && {
                location: seller && seller.sellerContactId && seller.sellerContactId.location && {
                    city: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.city &&
                    {
                        name: seller.sellerContactId.location.city.name || null,
                        _id: seller.sellerContactId.location.city._id || null
                    } || null,

                    state: seller && seller.sellerContactId.location && seller.sellerContactId.location.state &&
                    {
                        name: seller.sellerContactId.location.state.name || null,
                        _id: seller.sellerContactId.location.state._id || null
                    }
                        || null,

                    country: seller && seller.sellerContactId.location && seller.sellerContactId.location.country &&
                    {
                        name: seller.sellerContactId.location.country.name || null,
                        _id: seller.sellerContactId.location.country._id || null
                    } || null,
                    address: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.address || null,
                    pincode: seller && seller.sellerContactId && seller.sellerContactId.location && seller.sellerContactId.location.pincode || null
                } || null,
                alternativNumber: seller && seller.sellerContactId && seller.sellerContactId.alternativNumber || null,
                email: seller && seller.sellerContactId && seller.sellerContactId.email || null,
                website: seller && seller.sellerContactId && seller.sellerContactId.website || null
            } || null,

        } || null,
        userId: seller && seller.userId && {
            name: seller.name || null,
            _id: seller.userId
        } || null,
        offers: _offers || null
        // productDetails: product && product.productDetails && product.productDetails || null,

    }
    return data

}
module.exports.getSellerMasterProducts = async (req, res) => {
    try {
        console.log('get seller master products --------------')
        const filePath = `public/sellerUploadedbleData.json`
        const rowData = await fs.readFile(filePath)
        const data = JSON.parse(rowData)
        const prod = []
        if (data && data.length) {
            for (let index = 0; index < data.length; index++) {
                const sell = data[index];
                const { sellerProductId } = sell
                let newSeller = {
                    ...sell
                }
                const ids = sellerProductId && sellerProductId.length && sellerProductId.map((v) => v._id) || []
                const masterProducts = ids && ids.length ? await getAllMasterProducts({ _id: { $in: ids } }) : []
                newSeller = {
                    ...newSeller,
                    masterProducts: masterProducts
                }
                prod.push(newSeller)

            }
            console.log(JSON.stringify(prod), 'master --------------------')
            respSuccess(res, prod)
        }

    } catch (error) {

        console.log(error)
        respError(error)

    }
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
                const _planDetails = planId
                const planExpire = _planDetails && _planDetails.expireStatus || false
                console.log("🚀 ~ file: sellerDataMove.js ~ line 408 ~ module.exports.moveSellerToNewDB= ~ _planDetails", _planDetails)
                const priority = await mapPriority(_planDetails || "")
                // console.log(priority, '  ------ Search Priority -------')
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
                    let masterProducts = []
                    for (let i = 0; i < sellerProductId.length; i++) {
                        const product = sellerProductId[i];
                        const fff = sellerProductId[i]

                        let masterData = await masterMap(sell, fff, null, priority, planExpire)
                        // console.log(JSON.stringify(masterData), ' ********************************')
                        masterProducts.push(masterData)

                    }
                    console.log(JSON.stringify(masterProducts), "--master products ------------------")

                    for (let i = 0; i < sellerProductId.length; i++) {
                        const product = sellerProductId[i];
                        const proStructure = await productStructure(product, sell, priority)
                        // console.log(JSON.stringify(proStructure), ' %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
                        allProd.push(proStructure)

                    }
                    // console.log(JSON.stringify(allProd), " --------- Seller Products ------------")
                    seller = {
                        ...seller,
                        sellerProductId: allProd && allProd.length && allProd.map((v) => v._id) || []
                    }

                }
                _sel = seller
                // console.log("🚀 ~ file: sellerDataMove.js ~ line 470 ~ module.exports.moveSellerToNewDB= ~ _sel", _sel)
            }
        }
        respSuccess(res, _sel)
    } catch (error) {

        console.log(error)
        respError(error)

    }
}