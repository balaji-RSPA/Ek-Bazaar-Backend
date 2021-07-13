const {
    getSpecificCategories,
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
    deleteSellers,
    deletel3,
    deletel4,
    getAllSecondaryCategories,
    getProducts,
    getPrimaryCategories,
    addProductSubCategory,
    getProductCat,
    updateProductCategory,
    getProductSubcategory,
    createSuggestions
} = require('../../modules/categoryModule')
const camelcaseKeys = require('camelcase-keys');
const {
    respSuccess,
    respError
} = require('../../utils/respHadler');
const {
    query,
    createLogger
} = require('winston');

module.exports.addSellerType = async (req, res) => {
    try {
        const reqData = req.body
        const result = await addSellerType(reqData)
        respSuccess(res, result)
    } catch (error) {
        respError(error)
    }
}

module.exports.getAllSellerTypes = async (req, res) => {
    try {
        const reqQuery = camelcaseKeys(req.query)
        const { search } = reqQuery
        // console.log("module.exports.getAllSellerTypes -> reqQuery", reqQuery)
        let result = await getAllSellerTypes(0, 16, { status: true })
        // console.log("module.exports.getAllSellerTypes -> result", result)
        if (search) {
            let types = []
            let combine = result && result.length && result.filter((type) => {
                if (type.name.toLowerCase() === "importer" || type.name.toLowerCase() === "exporter" || type.name.toLowerCase() === "dealer" || type.name.toLowerCase() === "distributor") {
                    return true;
                } else {
                    types.push(type);
                    return false;
                }
            })
            const obj = [{
                _id: `${combine[0]._id}|${combine[1]._id}`,
                name: `${combine[0].name} / ${combine[1].name}`,
                status: combine[0].status,
                sequence: 4,
                group: combine[0].group
            }, {
                _id: `${combine[2]._id}|${combine[3]._id}`,
                name: `${combine[2].name} / ${combine[3].name}`,
                status: combine[2].status,
                sequence: 7,
                group: combine[2].group
            }]
            let rest = [...types, ...obj]
            respSuccess(res, rest)
        } else {
            respSuccess(res, result)
        }
    } catch (error) {
        respError(error)
    }
}

module.exports.getSpecificCategories = async (req, res) => {
    try {
        const idsArray = [
            "5fddf6051a15802b9764520d",
            "5fddf6051a15802b97645214",
            "5fddf6051a15802b9764520e",
            "5fddf6051a15802b9764520f",
            "5fddf6051a15802b9764521a"
        ]
        const query = {
            _id: {
                $in: idsArray
            }
        }
        const result = await getSpecificCategories(query)
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
        if (reqQuery.status) {
            qery = {
                status: reqQuery.status
            }
        }
        // query = {
        //     ...query,
        //     _id: {
        //         $in: ["5f9a60b98420b75666d810d6", "5f9a60b98420b75666d810d8", "5f9a60b98420b75666d810e2", "5f9a60b98420b75666d810e8"]
        //     }
        // }
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
        const suggestion = {
            _id: result[0]._id,
            id: result[0]._id,
            name: result[0].name,
            search: "level1",
            l1: result[0].vendorId,
            vendorId: result[0].vendorId
        }
        const sugge = await createSuggestions(suggestion)
        respSuccess(res, result)

    } catch (error) {
        console.log(error)
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
        const query = {
            id,
            search: reqQuery.search
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
        let bulkData = []
        for (let index = 0; index < reqData.length; index++) {
            const element = reqData[index];
            const primaryCategory = await getPrimaryCat({ vendorId: element.vendorId })
            if (!primaryCategory) {
                // console.log("unque level2 record")
                const query = {
                    vendorId: element.parentId.toString()
                }
                // const parentCatId = await checkParentCategory(query)
                const parentCat = await getParentCat(query)
                const primaryData = {
                    ...element,
                    l1: parentCat.vendorId,
                    parentCatId: parentCat._id
                }
                const result = await addPrimaryCategory(primaryData)
                const suggestion = {
                    _id: result._id,
                    id: result._id,
                    name: result.name,
                    search: "level2",
                    l1: result.l1,
                    vendorId: result.vendorId
                }
                const sugge = await createSuggestions(suggestion)
                const updateData = {
                    primaryCategotyId: parentCat.primaryCategotyId.concat(result._id)
                }
                await updateParentCategory(parentCat._id, updateData)
            } else {
                console.log("duplicate level2 record")
            }
            // bulkData.push(primaryData)

        }
        respSuccess(res, 'Uploaded Successfully')

    } catch (error) {
        console.log(error)
        respError(error)

    }

}

module.exports.addPrimaryCategory = async (req, res) => {

    try {

        const reqData = req.body
        const parentCatId = req.body.parentCatId
        const parentData = await getParentCategory(parentCatId)
        const result = await addPrimaryCategory(reqData)
        const primarydata = {
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
            const secondaryCategory = await getSecondaryCat({ vendorId: element.vendorId })
            if (!secondaryCategory) {
                // console.log("unique level2 record")
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

                const suggestion = {
                    _id: result._id,
                    id: result._id,
                    name: result.name,
                    search: "level3",
                    l1: result.l1,
                    vendorId: result.vendorId
                }
                const sugge = await createSuggestions(suggestion)

                const updateData = {
                    secondaryCategotyId: parentCat.secondaryCategotyId.concat(result._id)
                }
                // console.log(index, '------', element.primaryCatId, '---', element.l1, 'Count-----')
                await updatePrimaryCategory(parentCat._id, updateData)
            } else {
                console.log("duplicate level2 record")
            }

        }
        // console.log('COmpleted +++++++++++++')
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
        const formData = {
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
            const _product = await getProductCat({ vendorId: element.vendorId })
            // console.log("🚀 ~ file: categoryController.js ~ line 323 ~ module.exports.addBulkProducts= ~ _product", _product)
            if (!_product) {
                // console.log("unique level4 record")
                const query = {
                    vendorId: element.secondaryId.toString()
                }
                const parentCat = await getSecondaryCat(query)
                if (parentCat) {
                    const productData = {
                        ...element,
                        secondaryId: parentCat._id
                    }
                    const result = await addProductCategory(productData)
                    const suggestion = {
                        _id: result._id,
                        id: result._id,
                        name: result.name,
                        search: "level4",
                        l1: result.l1,
                        vendorId: result.vendorId
                    }
                    const sugge = await createSuggestions(suggestion)

                    const updateData = {
                        productId: parentCat.productId.concat(result._id)
                    }
                    // console.log(index, "COunt----", element.l1, element.vendorId)
                    await updateSecondaryCategory(parentCat._id, updateData)
                }
            } else {
                console.log("duplicate level4 record", element.vendorId)
            }

        }
        // console.log('Completed +++++++++++++++')
        respSuccess(res, 'Uploaded Successfully')

    } catch (error) {

        respError(error)

    }

}

module.exports.addBulkProductSubCategories = async (req, res) => {
    try {
        const reqData = req.body
        for (let index = 0; index < reqData.length; index++) {
            const element = reqData[index];
            const productSubCategories = await getProductSubcategory({ vendorId: element.vendorId })
            if (!productSubCategories) {
                // console.log("unique level5 record")
                const query = {
                    vendorId: element.productId.toString()
                }
                const parentCat = await getProductCat(query)
                // console.log("🚀 ~ file: categoryController.js ~ line 346 ~ module.exports.addBulkProductSubCategories= ~ parentCat", parentCat)
                if (parentCat) {
                    const productData = {
                        ...element,
                        secondaryId: parentCat.secondaryId,
                        productId: parentCat._id
                    }
                    const result = await addProductSubCategory(productData)
                    const suggestion = {
                        _id: result._id,
                        id: result._id,
                        name: result.name,
                        search: "level5",
                        l1: result.l1,
                        vendorId: result.vendorId
                    }
                    const sugge = await createSuggestions(suggestion)

                    // console.log("🚀 ~ file: categoryController.js ~ line 354 ~ module.exports.addBulkProductSubCategories= ~ result", result)
                    const updateData = {
                        subCategoryId: parentCat.subCategoryId.concat(result._id)
                    }
                    // console.log(index, "COunt----", element.l1, element.vendorId)
                    await updateProductCategory(parentCat._id, updateData)
                }
            } else {
                console.log("duplicate level5 record")
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
        const formData = {
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

module.exports.getPrimaryCat = async (req, res) => {
    try {
        const reqQuery = camelcaseKeys(req.query);
        let {
            skip,
            limit
        } = reqQuery
        skip = skip && parseInt(skip) || 0
        limit = limit && parseInt(limit) || 10

        const query = {
            _id: reqQuery.primaryId,
            skip,
            limit
        }
        const primaryCatyegory = await getPrimaryCategories(query)
        respSuccess(res, primaryCatyegory)

    } catch (error) {
        respError(error)
    }
}

module.exports.getAllProducts = async (req, res) => {

    try {
        const reqQuery = req.query
        // console.log("reqQuery Product ---------", reqQuery)
        const result = await getAllProducts(reqQuery)
        respSuccess(res, result)

    } catch (error) {

        respError(error)

    }

}

module.exports.getRelatedCategories = async (req, res) => {

    try {
        const id = req.params.id
        // console.log("module.exports.getRelatedCategories -> id", id)
        const result = await getPrimaryCategory(id)
        respSuccess(res, result)

    } catch (error) {

        respError(error)

    }

}

module.exports.deleteSellers = async (req, res) => {
    try {
        const data = req.body
        const query = {
            name: {
                $in: data.map(d => d.name)
            }
        }
        // console.log(query, "query......................")
        const sellers = await deleteSellers(query)
        console.log(sellers, "user deleted")
        respSuccess(res, sellers, `sellers deleted successfully`)
    } catch (error) {
        respError(error)
    }
}

module.exports.deletel4 = async (req, res) => {
    try {
        const data = req.body
        const query = {
            vendorId: {
                $in: data.map(d => d.vendorId)
            }
        }
        // console.log(query, "query......................")
        const l4 = await deletel4(query)
        console.log(l4, "products deleted")
        respSuccess(res, l4, `l4 deleted successfully`)
    } catch (error) {
        respError(error)
    }
}

module.exports.deletel3 = async (req, res) => {
    try {
        const data = req.body
        const query = {
            vendorId: {
                $in: data.map(d => d.vendorId)
            }
        }
        const l3 = await deletel3(query)
        console.log(l3, "secondary category deleted")
        respSuccess(res, l3, ` l3 deleted successfully`)
    } catch (error) {
        respError(error)
    }
}

module.exports.getAllSecondaryCategories = async (req, res) => {
    try {
        const idsArray = [
            // "5fdf6cd9be4f6810f1010491",
            // "5fdf6cdcbe4f6810f10104e2",
            // "5fdf6cedbe4f6810f10106bc",
            '5fdf6cc9be4f6810f10102d0',
            '5fdf6cc9be4f6810f10102d4',
            '5fdf6cdcbe4f6810f10104e2',
            
            "5fdf6cc8be4f6810f10102ca"
        ]
        const query = {
            _id: {
                $in: idsArray
            }
        }
        let secondaryCategories = await getAllSecondaryCategories(query)
        
        let _query = {
            vendorId: {
                $in: [
                    "L3PM129",
                    "L3PM130",
                    "L3PM131",
                    "L3PM132",
                    "L3PM133",
                    "L3PM134",
                    "L3PM135",
                    "L3PM136",
                    "L3PM137",
                    "L3PM138",
                    "L3PM139"
                ]
            }
        }
        let primaryCategory = await getPrimaryCategories({vendorId: "PM10"})
        console.log("🚀 ~ file: categoryController.js ~ line 677 ~ module.exports.getAllSecondaryCategories= ~ primaryCategory", primaryCategory.vendorId)
        let _secondaryCategories = await getAllSecondaryCategories(_query)
        secondaryCategories[3] = primaryCategory
        // primaryCategory.productId = _secondaryCategories
        // console.log("🚀 ~ file: categoryController.js ~ line 677 ~ module.exports.getAllSecondaryCategories= ~ _secondaryCategories", _secondaryCategories)
        // console.log("🚀 ~ file: categoryController.js ~ line 670 ~ module.exports.getAllSecondaryCategories= ~ getAllSecondaryCategories", secondaryCategories)
        // console.log("🚀 ~ file: categoryController.js ~ line 658 ~ module.exports.getAllSecondaryCategories= ~ secondaryCategories", secondaryCategories[3]["productId"])
        // console.log("🚀 ~ file: categoryController.js ~ line 683 ~ module.exports.getAllSecondaryCategories= ~ secondaryCategories", secondaryCategories)
        // secondaryCategories[3]["productId"] = _secondaryCategories
        respSuccess(res, {secondaryCategories, _secondaryCategories})
    } catch (error) {
        respError(error)
    }
}

module.exports.getProducts = async (req, res) => {
    try {
        const {
            limit,
            search
        } = req.query
        let query = ""
        if (limit || search) {
            query = {
                search: search,
                limit: parseInt(limit)
            }
        } else {
            query = {
                $match: {
                    _id: {
                        $in: ["5fbd291f834cab3f38524105", "5fbd291f834cab3f38524106", "5fbd291f834cab3f38524107", "5fbd291f834cab3f38524108",
                            "5fbd291f834cab3f38524109", "5fbd291f834cab3f3852410a", "5fbd291f834cab3f3852410b", "5fbd291f834cab3f3852410c", "5fbd291f834cab3f3852410d",
                            "5fbd2920834cab3f3852410e"
                        ]
                    }
                }
            }
        }
        const products = await getProducts(query)
        respSuccess(res, products)
    } catch (error) {
        respError(error)
    }
}

module.exports.getLevelFive = async (req, res) => {
    try {
        const { id } = req.params
        const products = await getProductCategory(id)
        respSuccess(res, products)
    } catch (error) {
        respError(error)
    }
}