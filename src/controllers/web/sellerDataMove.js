const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const moment = require('moment')
const fs = require('fs').promises
const Logger = require('../../utils/logger')
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

    getAllMasterProducts,
    getAllBuyers
} = require('../../modules/sellerDataMoveModule')
const { location, category, sellers, mastercollections } = require('../../modules')
const { getCountry, getState, getCity, checkState, getSelectedCountries, getSelectedStates, getFilteredCities } = location
const { addSeller, addSellerProduct, getSellerVal } = sellers
const { insertManyMaster } = mastercollections
const { /* getParentCat, getSpecificCategories, getPrimaryCat, */ getSellerType } = category

module.exports.uploadOnBoardSeller = async (req, res) => {

    try {
        console.log(' upload seller data ......')
        const result = await getAllSellerDetails({ userId: { $ne: null } /* "mobile.mobile": "9916905753"  */ })
        console.log(result.length, ' count')
        const filePath = `public/sellerUploadedbleData.json`
        const err = await fs.writeFile(filePath, JSON.stringify(result))
        if (err) throw err;
        console.log(' completed -----------------')
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

const locationMap = async (location, seller = {}, type = '', status) => {
    let { city, state, country } = location
    // console.log(" @@@@ location list ------ ", location)
    let existingCity = city

    city = city && city.name ? await getCity({ name: city.name }) : null
    state = state && state.name ? await checkState({ name: state.name.toString() }) : null
    country = country ? await getCountry({ _id: country._id }) : null
    if (existingCity && existingCity._id && !city) {
        console.log(seller && seller.name, `${type} city ot exist -----------`)
    }
    if (status) {
        return {
            city: city && { name: city.name || null, _id: city._id } || null,
            state: state && { name: state.name || null, _id: state._id } || null,
            country: country && { name: country.name || null, _id: country._id } || null,
            region: state && state.region || null
        }
    } else {

        return {
            city: city && city._id || null,
            state: state && state._id || null,
            country: country && country._id || null,
            region: state && state.region || null
        }
    }
}

const productStructure = async (product, sell = {}) => {
    let { parentCategoryId, primaryCategoryId, secondaryCategoryId, poductId, productSubcategoryId, productDetails, serviceCity, offers, serviceType } = product

    const _sList = []
    let details = {
        ...product
    }
    let masterData = {
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
        const masterServiceCity = []
        console.log('--------- Product Service City mapping --------------')
        for (let index = 0; index < serviceCity.length; index++) {
            const _serviceCity = serviceCity[index];

            const service_City = await locationMap(_serviceCity, sell, "Products", false)
            const master_service_City = await locationMap(_serviceCity, sell, "Products", true)
            _sList.push(service_City)
            masterServiceCity.push(master_service_City)
        }
        details = {
            ...details,
            serviceCity: _sList
        }
        masterData = {
            ...masterData,
            serviceCity: masterServiceCity
        }
    }

    // Level 1 category mapping 
    if (parentCategoryId && parentCategoryId.length) {
        console.log('----- Product parent cat mapping ------')
        const l1List = parentCategoryId.map((v) => v.name)
        const list = await getLevelOne({ name: { $in: l1List } })

        if (!list.length) {
            console.log('------ Parent Category Not exist ----------', sell && sell.name, product && product._id)
            Logger.info({
                sellerId: sell && sell._id || null,
                sellerName: sell && sell.name || null,
                productId: product && product._id || null,
                error: "level1",
                catid: l1List || null,
                msg: 'Parent Category Not exist'
            })
        } else {
            parentCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                parentCategoryId
            }
            masterData = {
                ...masterData,
                parentCategoryId: list || null
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

            Logger.info({
                sellerId: sell && sell._id || null,
                sellerName: sell && sell.name || null,
                productId: product && product._id || null,
                error: "level2",
                catid: l2List || null,
                msg: 'Primary Category Not exist'
            })

        } else {
            primaryCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                primaryCategoryId
            }
            masterData = {
                ...masterData,
                primaryCategoryId: list || null
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

            Logger.info({
                sellerId: sell && sell._id || null,
                sellerName: sell && sell.name || null,
                productId: product && product._id || null,
                error: "level3",
                catid: l3List || null,
                msg: 'Secondary Category Not exist'
            })

        } else {
            secondaryCategoryId = list.map((v) => v._id)
            details = {
                ...details,
                secondaryCategoryId
            }
            masterData = {
                ...masterData,
                secondaryCategoryId: list || null
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

            Logger.info({
                sellerId: sell && sell._id || null,
                sellerName: sell && sell.name || null,
                productId: product && product._id || null,
                error: "level4",
                catid: l4List || null,
                msg: 'Product Category Not exist'
            })

        } else {
            poductId = list.map((v) => v._id)
            details = {
                ...details,
                poductId
            }
            masterData = {
                ...masterData,
                poductId: list || null
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

            Logger.info({
                sellerId: sell && sell._id || null,
                sellerName: sell && sell.name || null,
                productId: product && product._id || null,
                error: "level5",
                catid: l5List || null,
                msg: ' product productsub Category Not exist'
            })

        } else {
            productSubcategoryId = list.map((v) => v._id)
            details = {
                ...details,
                productSubcategoryId
            }
            masterData = {
                ...masterData,
                productSubcategoryId: list || null
            }
        }
    }

    if (details.productDetails) { // Product details map
        let { countryOfOrigin, regionOfOrigin, cityOfOrigin, sellingCountries, sellingStates, sellingCities } = details.productDetails
        if (countryOfOrigin) {
            /* details.productDetails["countryOfOrigin"] */ const coo = countryOfOrigin._id || null
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    countryOfOrigin: coo
                }
            }
        }
        if (regionOfOrigin) {
            /* details.productDetails["regionOfOrigin"] */ const roo = regionOfOrigin._id || null
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    regionOfOrigin: roo
                }
            }
        }
        if (cityOfOrigin) {
            const cofo = cityOfOrigin && cityOfOrigin.name ? await getCity({ name: cityOfOrigin.name }) : null
            /* details.productDetails["cityOfOrigin"] */ const rood = cofo && cofo._id || null
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    cityOfOrigin: rood
                }
            }
        }

        if (sellingCountries && sellingCountries.length) {
            /* details.productDetails["sellingCountries"] */ const rest = sellingCountries.map((c) => c._id) || []
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    sellingCountries: rest
                }
            }
        }

        if (sellingStates && sellingStates.length) {
            /* details.productDetails["sellingStates"] */const rest1 = sellingStates.map((c) => c._id) || []
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    sellingStates: rest1
                }
            }
        }

        if (sellingCities && sellingCities.length) {
            const li = sellingCities.map((c) => c.name)
            const sc = await getFilteredCities({ name: { $in: li } })

            /* details.productDetails["sellingCities"] */const setmax = sc && sc.length && sc.map((v) => v._id) || []
            details = {
                ...details,
                productDetails: {
                    ...details.productDetails,
                    sellingCities: setmax
                }
            }
        }
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
    return { details, masterData, product }
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
                console.log(sell && sell.name, sell && sell.mobile && sell.mobile.length && sell.mobile[0].mobile, ' [---# Seller Name #---]')
                let sellerBusiness = null
                let sellerStatutoryDetails = null
                let sellerCompanyDetails = null
                let sellercontactDetails = null
                let sellerEstablisment = null
                let planDetails = null
                let { busenessId, statutoryId, establishmentId, sellerCompanyId, sellerContactId, planId, location, sellerProductId } = sell
                const _planDetails = planId
                const planExpire = _planDetails && _planDetails.expireStatus || false
                const priority = await mapPriority(_planDetails || "")
                // console.log(priority, '  ------ Search Priority -------')
                let allProd = []
                let masterProducts = []
                let _masterData = []
                let seller = {
                    ...sell,
                    manual: true
                }

                if (busenessId) {
                    console.log('-- Business details create --')
                    sellerBusiness = busenessId
                    // await addSellerBusiness(busenessId)
                    seller = {
                        ...seller,
                        busenessId: busenessId._id || null
                    }
                }
                if (statutoryId) {
                    console.log('--- Statutory details create --')
                    sellerStatutoryDetails = statutoryId
                    // await addSellerStatutory(statutoryId)
                    seller = {
                        ...seller,
                        statutoryId: statutoryId._id || null
                    }
                }
                if (sellerCompanyId) {
                    console.log('---- Company details create --')
                    sellerCompanyDetails = sellerCompanyId
                    // await addSellerCompany(sellerCompanyId)
                    seller = {
                        ...seller,
                        sellerCompanyId: sellerCompanyId._id || null
                    }
                }
                if (sellerContactId) {
                    console.log('--- Contact details create --')
                    sellercontactDetails = sellerContactId
                    // await addSellerContact(sellerContactId)
                    seller = {
                        ...seller,
                        sellerContactId: sellerContactId._id || null
                    }
                }
                if (establishmentId) {
                    console.log('-- Establishment details create --')
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
                if (sell && sell.location) { // Seller location map
                    console.log(sell.name, ' -------Seller Location mapping -------------')
                    location = await locationMap(location, sell)
                    seller = {
                        ...seller,
                        location: location || null
                    }
                }
                if (sellerProductId && sellerProductId.length) { // seller products map

                    for (let i = 0; i < sellerProductId.length; i++) {
                        const product = sellerProductId[i];
                        const { details, masterData } = await productStructure(product, sell, priority)
                        allProd.push(details)
                        _masterData.push(masterData)

                    }
                    for (let i = 0; i < _masterData.length; i++) {
                        const product = _masterData[i];
                        const fff = _masterData[i]

                        let masterData = await masterMap(sell, fff, null, priority, planExpire)
                        masterProducts.push(masterData)

                    }
                    seller = {
                        ...seller,
                        sellerProductId: allProd && allProd.length && allProd.map((v) => v._id) || []
                    }

                }
                // console.log(JSON.stringify(seller), 'seller details ------------')
                // console.log(JSON.stringify(allProd), 'Products details ------------')
                // console.log(JSON.stringify(masterProducts), 'Master details ------------')
                if (seller) {
                    const checkSeller = await getSellerVal({ _id: seller._id })
                    if (!checkSeller) {
                        const _seller_add = await addSeller(seller)
                        console.log('-- Seller Added --')
                        if (allProd && allProd.length !== 0) {
                            const selPro = await addSellerProduct(allProd)
                            console.log('-------->> Seller Procucts added ---------')
                        }
                        if (masterProducts && masterProducts.length !== 0) {
                            const mss = await insertManyMaster(masterProducts)
                            console.log(' ---------- $$ Master products addedd ---------')
                        }
                    } else {
                        console.log(' $$$$$ Seller Exist -----')
                    }
                    // if (sellerBusiness) {
                    //     const busi = await addSellerBusiness(sellerBusiness)
                    //     console.log('--- Business addedd ---')
                    // }
                    // const sta = sellerStatutoryDetails ? await addSellerStatutory(sellerStatutoryDetails) : false
                    // console.log('---- Statutory addedd ---')
                    // const comp = sellerCompanyDetails ? await addSellerCompany(sellerCompanyDetails) : false
                    // console.log('----- Company addedd -----')
                    // const cont = sellercontactDetails ? await addSellerContact(sellercontactDetails) : false
                    // console.log('------ Seller contact addedd ------')
                    // const esss = sellerEstablisment ? await addSellerEstablishment(sellerEstablisment) : false
                    // console.log('------- Establisment addedd ------')

                }
                console.log(index, seller && seller._id, seller && seller.name,/*  seller && seller.mobile.length && seller.mobile[0].mobile, */ ' #########-----------------Seller addedd successfully --------------------------### ')
            }
        }
        console.log('-------------- all seller data uploades successfully -----------------')
        respSuccess(res, 'Uploaded all seller data successfully--------')
    } catch (error) {

        console.log(error)
        respError(error)

    }
}

module.exports.getSellerMasterProducts = async (req, res) => {
    // try {
    //     console.log('get seller master products --------------')
    //     const filePath = `public/sellerUploadedbleData.json`
    //     const rowData = await fs.readFile(filePath)
    //     const data = JSON.parse(rowData)
    //     const prod = []
    //     if (data && data.length) {
    //         for (let index = 0; index < data.length; index++) {
    //             const sell = data[index];
    //             const { sellerProductId } = sell
    //             let newSeller = {
    //                 ...sell
    //             }
    //             const ids = sellerProductId && sellerProductId.length && sellerProductId.map((v) => v._id) || []
    //             const masterProducts = ids && ids.length ? await getAllMasterProducts({ _id: { $in: ids } }) : []
    //             newSeller = {
    //                 ...newSeller,
    //                 masterProducts: masterProducts
    //             }
    //             prod.push(newSeller)

    //         }
    //         console.log(JSON.stringify(prod), 'master --------------------')
    //         respSuccess(res, prod)
    //     }

    // } catch (error) {

    //     console.log(error)
    //     respError(error)

    // }
}

// Buyers
module.exports.uploadOnBoardBuyers = async (req, res) => {

    // try {
    //     console.log(' upload buyers data ......')
    //     const result = await getAllBuyers({ "mobile": "9916905753" })
    //     const filePath = `public/buyerUploadedbleData.json`
    //     const err = await fs.writeFile(filePath, JSON.stringify(result))
    //     if (err) throw err;
    //     respSuccess(res, { count: result.length, result/* : result[0].sellerProductId */ })

    // } catch (error) {

    //     console.log(error)
    //     respError(error)

    // }
}