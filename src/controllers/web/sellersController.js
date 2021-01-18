const camelcaseKeys = require('camelcase-keys')
const {
  machineIdSync
} = require('node-machine-id')
const {
  respSuccess,
  respError
} = require('../../utils/respHadler')
const {
  uploadToDOSpace
} = require("../../utils/utils")
const mongoose = require('mongoose');

const {
  sellers,
  location,
  category,
  mastercollections,
  elastic,
  sellerProducts
} = require('../../modules')
const { sellerSearch, searchFromElastic } = elastic;
const _ = require('lodash')

const {
  updateSeller,
  getSeller,
  getAllSellers,
  addbusinessDetails,
  addCompanyDetails,
  addContactDetails,
  addEstablishmentPhotos,
  addProductDetails,
  addStatutoryDetails,
  inserSeller,
  sellerBulkInser,
  getSellerProfile,
  structureSellerData,
  deleteSellerProduct,
  getSellerVal,
  addSellerProduct,
  findEstablishment,
  getSellerProduct,
  getSellerProductDetails
} = sellers
const {
  getParentCat,
  getPrimaryCat,
  getSecondaryCat,
  getProductCat,
  getProductSubcategory
} = category

const { getFilteredCities, getSellerSelectedCities } = location;
const { addMaster, updateMaster, insertManyMaster, deleteMasterProduct } = mastercollections
const { updateSellerProducts } = sellerProducts

module.exports.getSeller = async (req, res) => {
  try {
    const {
      userID
    } = req
    const reqQuery = camelcaseKeys(req.query)
    const { id, elastic } = reqQuery
    console.log("module.exports.getSeller -> req.query", reqQuery)
    if (elastic === 'true') {

      const result = await sellerSearch(reqQuery)
      const { query } = result
      const seller = await searchFromElastic(query, { limit: 1, skip: 0 })
      console.log("module.exports.getSeller -> seller", seller)
      respSuccess(res, {
        total: seller[1],
        data: seller[0]
      })

    } else {

      const seller = userID ? await getSeller(userID) : await getSellerProfile(id)
      respSuccess(res, seller)

    }
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.updateSeller = async (req, res) => {
  try {
    let {
      businessDetails,
      statutoryDetails,
      contactDetails,
      establishmentPhotos,
      companyProfile,
      productDetails,
      notifications,
      deactivateAccount,
      company,
      CinNumber,
      GstNumber,
      IeCode,
    } = req.body
    console.log("🚀 ~ file: sellersController.js ~ line 84 ~ module.exports.updateSeller= ~ req.body", req.body)
    const {
      userID
    } = req
    const user = await getSeller(userID)
    const sellerID = user._id
    let newData = {}
    let seller
    // addProductDetails;
    if (businessDetails) {
      const bsnsDtls = await addbusinessDetails(sellerID, businessDetails)
      newData.busenessId = bsnsDtls._id
      seller = await updateSeller({
        _id: sellerID
      }, newData)
    }
    //statutoryDetails
    if (company || CinNumber || GstNumber || IeCode || (req.files && (req.files.multidoc || req.files.gst))) {
      let statutoryDetails = {
        company: JSON.parse(company),
        CinNumber: JSON.parse(CinNumber),
        GstNumber: JSON.parse(GstNumber),
        IeCode: JSON.parse(IeCode),
      }
      if (req.files && req.files.multidoc) {
        let data = {
          Key: `${sellerID}/${req.files.multidoc.name}`,
          body: req.files.multidoc.data
        }
        const multidoc = await uploadToDOSpace(data)
        statutoryDetails.company.name = req.files.multidoc.name;
        statutoryDetails.company.code = multidoc.Location;
      }
      if (req.files && req.files.gst) {
        let data = {
          Key: `${sellerID}/${req.files.gst.name}`,
          body: req.files.gst.data
        }
        const gst = await uploadToDOSpace(data)
        statutoryDetails.GstNumber.name = req.files.gst.name;
        statutoryDetails.GstNumber.code = gst.Location;
      }
      const statutoryDtls = await addStatutoryDetails(
        sellerID,
        statutoryDetails,
      )
      newData.statutoryId = statutoryDtls._id
      seller = await updateSeller({
        _id: sellerID
      }, newData)
    }
    if (contactDetails) {
      contactDetails = {
        ...contactDetails,
        sellerId: sellerID
      }
      const cntctDtls = await addContactDetails(sellerID, contactDetails)
      seller = await updateSeller({
        _id: sellerID
      }, {
        sellerContactId: cntctDtls._id
      })
      // newData.busenessId = cntctDtls._id;
    }
    if (!productDetails && req.files && (req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4 || req.files.image5 || req.files.image6)) {
      let photos = [];
      let values = Object.values(req.files)
      for (let i = 0; i < values.length; i++) {
        const name = values[i].name
        const _data = values[i].data
        const data = {
          Key: `${sellerID}/${name}`,
          body: _data
        }
        const ImageVal = await uploadToDOSpace(data)
        await photos.push({
          name: name,
          code: ImageVal.Location
        })
      }
      let estblsmntPhts
      if (user.establishmentId) {
        let getEstablishmentPht = await findEstablishment(user.establishmentId)
        if (req.files.image1) {
          getEstablishmentPht.photos[0] = null;
        }
        if (req.files.image2) {
          getEstablishmentPht.photos[1] = null;
        }
        if (req.files.image3) {
          getEstablishmentPht.photos[2] = null;
        }
        if (req.files.image4) {
          getEstablishmentPht.photos[3] = null;
        }
        if (req.files.image5) {
          getEstablishmentPht.photos[4] = null;
        }
        if (req.files.image6) {
          getEstablishmentPht.photos[5] = null;
        }
        getEstablishmentPht.photos = getEstablishmentPht.photos.filter((Boolean));
        photos = getEstablishmentPht.photos.length ? [...getEstablishmentPht.photos, ...photos] : photos
        estblsmntPhts = await addEstablishmentPhotos(
          sellerID,
          photos
        )
      } else {
        estblsmntPhts = await addEstablishmentPhotos(
          sellerID,
          photos
        )
        newData.establishmentId = estblsmntPhts._id
        seller = await updateSeller({
          _id: sellerID
        }, newData)
      }
    }
    if (companyProfile) {
      companyProfile = {
        ...companyProfile,
        sellerId: sellerID
      }
      const cmpnyPrfl = await addCompanyDetails(sellerID, companyProfile)
      newData.sellerCompanyId = cmpnyPrfl._id
      seller = await updateSeller({
        _id: sellerID
      }, {
        sellerCompanyId: cmpnyPrfl._id
      })
    }
    if (notifications) {
      seller = await updateSeller({
        _id: sellerID
      }, {
        notifications: notifications
      })
    }
    if (deactivateAccount) {
      seller = await updateSeller({
        _id: sellerID
      }, {
        deactivateAccount
      })
    }
    respSuccess(res, seller, 'Profile updated successfully')
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await getAllSellers()
    respSuccess(res, sellers)
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.sellerBulkInsert = async (req, res) => {
  try {
    const reqData = req.body
    let bulkData = []
    let result
    for (let index = 0; index < reqData.length; index++) {
      const seller = reqData[index]
      // const result = await inserSeller(seller)
      result = await structureSellerData(seller)
      // bulkData.push(result)
    }
    console.log('data upload completed')
    // await sellerBulkInser(bulkData);
    console.log('upload completed')
    respSuccess(res, result)
  } catch (error) {
    respError(res, error.message)
  }
}


module.exports.sellerBulkInsertWithBatch = async (req, res) => new Promise(async (resolve, reject) => {
  try {
    const reqData = req.body
    let bulkData = []
    let result
    for (let index = 0; index < reqData.length; index++) {
      const seller = reqData[index]
      // const result = await inserSeller(seller)
      result = await structureSellerData(seller)
      // bulkData.push(result)
    }
    console.log('data upload completed')
    // await sellerBulkInser(bulkData);
    console.log('upload completed')
    resolve(res, result)
  } catch (error) {
    reject(res, error.message)
  }
})


module.exports.deleteSellerProduct = async (req, res) => {
  console.log("delete product--------")
  try {
    let result
    let sellerProduct = await deleteSellerProduct(req.body.id)
    const masterDelete = await deleteMasterProduct(req.body.id)
    let findSeller = await getSellerVal(sellerProduct.sellerId)
    if (findSeller) {
      let objVal = mongoose.Types.ObjectId(req.body.id);
      let arrVal = _.findIndex(findSeller.sellerProductId, objVal);
      if (arrVal > -1) {
        findSeller.sellerProductId.splice(arrVal, 1)
        result = await updateSeller({
          _id: sellerProduct.sellerId
        }, findSeller)

      }
    }
    respSuccess(res, result, "Product successfully deleted")
  } catch (error) {
    respError(res, error.message)
  }
}

// function masterMapData(val, keywords) {
const masterMapData = (val, type) => new Promise((resolve, reject) => {
  // console.log("🚀 ~ file: sellersController.js ~ line 395 ~ masterMapData ~ val", val)
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
  val.sellerId && val.sellerId.location && delete val.sellerId.location._id

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
    }

  }

  if (type === 'insert') {
    data = {
      ...data,
      _id: val._id
    }
  }
  resolve(data)

})

module.exports.addSellerProduct = async (req, res) => {
  try {
    let result
    let sellerId = req.body && req.body[0] && req.body[0].sellerId
    // console.log("🚀 ~ file: sellersController.js ~ line 390 ~ module.exports.addSellerProduct= ~ sellerId", req.body)
    if (sellerId) {
      const findSeller = await getSellerProfile(sellerId);
      // console.log("🚀 ~ file: sellersController.js ~ line 497 ~ module.exports.addSellerProduct= ~ findSeller", findSeller)
      const userId = findSeller && findSeller.length && findSeller[0].userId || null
      const serviceType = findSeller && findSeller.length && findSeller[0].sellerType.length && findSeller[0].sellerType[0]._id || null
      let resultVal = []
      for (let i = 0; i < req.body.length; i++) {
        if (req.body[i].productType === 'level5') {
          let findLevel4 = await getlevelFiveCategories(req.body[i], userId, serviceType)
          resultVal.push(findLevel4)
        }
        if (req.body[i].productType === 'level4') {
          let findLevel3 = await getlevelFourCategories(req.body[i], userId, serviceType)
          await resultVal.push(findLevel3)
        }
        if (req.body[i].productType === 'level3') {
          let findLevel2 = await getlevelThreeCategories(req.body[i], userId, serviceType)
          await resultVal.push(findLevel2);
        }
        if (req.body[i].productType === 'level2') {
          let findLevel1 = await getlevelTwoCategories(req.body[i], userId, serviceType)
          await resultVal.push(findLevel1);
        }
        if (req.body[i].productType === 'level1') {
          req.body[i].parentCategoryId = req.body[i].id,
            req.body[i].primaryCategoryId = null,
            req.body[i].secondaryCategoryId = null,
            req.body[i].poductId = null,
            req.body[i].productSubcategoryId = null
          delete req.body[i].id,
            delete req.body[i].productType
          await resultVal.push(req.body[i]);
        }
      }
      // const findSeller = await getSellerProfile(sellerId);
      result = await addSellerProduct(resultVal)
      const que = {
        _id: { $in: result }
      }
      const proDetails = await getSellerProductDetails(que)
      // console.log("_______________________________proDetails", proDetails)

      let masterData = [];
      if (proDetails.length) {

        // masterData = proDetails.map((val) => {
        for (let index = 0; index < proDetails.length; index++) {
          const val = proDetails[index];


          const formateData = await masterMapData(val, 'insert')
          const updatePro = await updateSellerProducts({ _id: val._id }, { keywords: formateData.keywords })
          masterData.push(formateData)
          // return ({
          //   sellerId: val.sellerId && {
          //     location: val.sellerId && val.sellerId.location || null,
          //     name: val.sellerId && val.sellerId.name || null,
          //     email: val.sellerId && val.sellerId.email || null,

          //     sellerType: val.sellerId && val.sellerId.sellerType && val.sellerId.sellerType.length && {
          //       _id: val.sellerId.sellerType[0]._id,
          //       name: val.sellerId.sellerType[0].name
          //     } || null,

          //     _id: val.sellerId && val.sellerId._id || null,
          //     mobile: val.sellerId && val.sellerId.mobile || null,
          //     website: val.sellerId.website || null,
          //     isEmailVerified: val.sellerId.isEmailVerified || false,
          //     isPhoneVerified: val.sellerId.isPhoneVerified || false,
          //     sellerVerified: val.sellerId.sellerVerified || false,
          //     paidSeller: val.sellerId.paidSeller || false,
          //     international: val.sellerId.international || false,
          //     deactivateAccount: val.sellerId.deactivateAccount && val.sellerId.deactivateAccount.status || false,
          //     businessName: val.sellerId.busenessId && val.sellerId.busenessId.name || null
          //   } || null,
          //   userId: val.sellerId && val.sellerId.userId && {
          //     name: val.sellerId.name || null,
          //     _id: val.sellerId.userId
          //   } || null,
          //   productDetails: null,
          //   status: true,
          //   batch: 1,
          //   keywords,
          //   serviceType: val.serviceType && {
          //     _id: val.serviceType._id,
          //     name: val.serviceType.name
          //   } || null,
          //   parentCategoryId: val.parentCategoryId && val.parentCategoryId.length && val.parentCategoryId || null,
          //   primaryCategoryId: val.primaryCategoryId && val.primaryCategoryId.length && val.primaryCategoryId || null,
          //   secondaryCategoryId: val.secondaryCategoryId && val.secondaryCategoryId.length && val.secondaryCategoryId || null,
          //   poductId: val.poductId && val.poductId.length && val.poductId || null,
          //   productSubcategoryId: val.productSubcategoryId && val.productSubcategoryId.length && val.productSubcategoryId || null,

          // })
        }
        // )
        const mosterResult = await insertManyMaster(masterData)

      }

      if (findSeller && findSeller.length) {
        findSeller[0].sellerProductId = findSeller[0].sellerProductId && findSeller[0].sellerProductId.length !== 0 ? [...result, ...findSeller[0].sellerProductId] : result;
        // findSeller[0].sellerProductId.concat(result)
      }
      seller = await updateSeller({
        _id: sellerId
      }, findSeller[0])

      respSuccess(res, seller, "Successfully added product")
    }
  } catch (error) {
    console.log(error, ' error')
    respError(res, "Seller not found or something went wrong")
  }
}

module.exports.updateSellerProduct = async (req, res) => {
  // const {id,inStock} = req.body

  try {
    const {
      body,
      files
    } = req
    // console.log('update poroduct---', req.body)
    let updateDetail
    if (body.productDetails || files && (files.document || files.image1 || files.image2 || files.image3 || files.image4)) {
      productDetails = JSON.parse(body.productDetails)
      let findCities = await getSellerSelectedCities(productDetails.serviceCity);
      if (findCities && findCities.length) {
        productDetails.serviceCity = findCities.map((val) => ({
          city: val._id,
          state: val.state._id,
          country: val.country,
          region: val.state && val.state.region
        }))
      }
      // /* need to optimize the below code*/
      if (files && files.document) {
        let data = {
          Key: `${productDetails.sellerId}/${files.document.name}`,
          body: files.document.data
        }
        const _document = await uploadToDOSpace(data)
        productDetails.productDetails.document = {
          name: files.document.name,
          code: _document.Location
        }

      }

      if (files && files.image1) {
        let data = {
          Key: `${productDetails.sellerId}/${files.image1.name}`,
          body: files.image1.data
        }
        const _image1 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image1 = {
          name: files.image1.name,
          code: _image1.Location
        }
        // productDetails.productDetails.image.image1.name = files.image1.name;
        // productDetails.productDetails.image.image1.code = _image1.Location;
      }

      if (files && files.image2) {
        let data = {
          Key: `${productDetails.sellerId}/${files.image2.name}`,
          body: files.image2.data
        }
        const _image2 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image2 = {
          name: files.image2.name,
          code: _image2.Location
        }
        // productDetails.productDetails.image.image2.name = files.image2.name;
        // productDetails.productDetails.image.image2.code = _image2.Location;
      }

      if (files && files.image3) {
        let data = {
          Key: `${productDetails.sellerId}/${files.image3.name}`,
          body: files.image3.data
        }
        const _image3 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image3 = {
          name: files.image3.name,
          code: _image3.Location
        }
        // productDetails.productDetails.image.image3.name = files.image3.name;
        // productDetails.productDetails.image.image3.code = _image3.Location;
      }

      if (files && files.image4) {
        let data = {
          Key: `${productDetails.sellerId}/${files.image4.name}`,
          body: files.image4.data
        }
        const _image4 = await uploadToDOSpace(data)
        productDetails.productDetails.image.image4 = {
          name: files.image4.name,
          code: _image4.Location
        }
        // productDetails.productDetails.image.image4.name = files.image4.name;
        // productDetails.productDetails.image.image4.code = _image4.Location;
      }
      /* till here*/
      updateDetail = await addProductDetails(productDetails._id, productDetails);
    }
    if (body.id && body.imageType) {
      const data = {
        Key: `${body.sellerId}/${body.fileName}`,
        body: files.file.data
      }
      let ImageVal = await uploadToDOSpace(data)

      let image = body.imageType;
      let imageVal = `productDetails.image.${image}`
      let imageNameLoc = {
        name: body.fileName,
        code: ImageVal.Location
      }
      let imageDtl = {};
      imageDtl[imageVal] = imageNameLoc;
      updateDetail = await addProductDetails(body.id, imageDtl)
    }
    if (body.id && (body.status === false || body.status)) {
      updateDetail = await addProductDetails(body.id, {
        "status": body.status
      })
    }
    if (updateDetail) {
      const updatedProduct = await getSellerProductDetails({ _id: updateDetail._id })
      const masterData = await masterMapData(updatedProduct[0], 'update')
      const updatePro = await updateSellerProducts({ _id: updateDetail._id }, { keywords: masterData.keywords })
      const masResult = await updateMaster({ _id: updateDetail._id }, masterData)
    }
    // if(body.id && body.inStock){
    //   
    // }else
    let seller = await getSellerProfile(updateDetail.sellerId)
    respSuccess(res, seller, "Successfully updated")
  } catch (error) {
    console.log(error, ' ipdate data----------------')
    respError(res, error.message)
  }
}

module.exports.getSellerProduct = async (req, res) => {
  try {
    const { sellerProductId } = req.body
    let sellerProduct = await getSellerProduct({ _id: sellerProductId })
    respSuccess(res, sellerProduct)
  } catch (error) {
    respError(res, error.message)
  }
}

module.exports.getFilteredCities = async (req, res) => {
  try {
    const { stateId } = req.body
    let filteredCities = await getFilteredCities({ state: stateId })
    filteredCities = filteredCities.map((val) => ({
      label: val.name,
      value: val._id
    }))
    respSuccess(res, filteredCities)
  } catch (error) {
    respError(res, error.message)
  }
}

getlevelTwoCategories = async (element, userId, serviceType) => {

  let findLevel1 = await getPrimaryCat({
    _id: element.id
  })
  element.parentCategoryId = findLevel1.parentCatId,
    element.primaryCategoryId = element.id,
    element.secondaryCategoryId = null,
    element.poductId = null,
    element.productSubcategoryId = null
  delete element.id,
    delete element.productType
  return element;
}

getlevelThreeCategories = async (element, userId, serviceType) => {

  let findLevel2 = await getSecondaryCat({
    _id: element.id
  })

  let findLevel1 = await getlevelTwoCategories({ id: findLevel2.primaryCatId })
  element.parentCategoryId = findLevel1.parentCategoryId,
    element.primaryCategoryId = findLevel2.primaryCatId,
    element.secondaryCategoryId = element.id,
    element.poductId = null,
    element.productSubcategoryId = null
  delete element.id,
    delete element.productType
  return element;

}

getlevelFourCategories = async (element, userId, serviceType) => {
  // getlevelFourCategories = async (element) => {

  let findLevel3 = await getProductCat({
    _id: element.id
  })

  let findLevel2 = await getlevelThreeCategories({ id: findLevel3.secondaryId })

  element.parentCategoryId = findLevel2.parentCategoryId,
    element.primaryCategoryId = findLevel2.primaryCategoryId,
    element.secondaryCategoryId = findLevel3.secondaryId,
    element.poductId = element.id,
    element.productSubcategoryId = null
  delete element.id,
    delete element.productType
  return element;

}

getlevelFiveCategories = async (element, userId, serviceType) => {
  // getlevelFiveCategories = async (element) => {

  let findLevel4 = await getProductSubcategory({
    _id: element.id
  })
  let findLevel3 = await getlevelFourCategories({
    id: findLevel4.productId
  })
  element.parentCategoryId = findLevel3.parentCategoryId,
    element.primaryCategoryId = findLevel3.primaryCategoryId,
    element.secondaryCategoryId = findLevel3.secondaryCategoryId,
    element.poductId = findLevel4.productId,
    element.productSubcategoryId = element.id
  delete element.id,
    delete element.productType
  return element;

}

//unused code
// if (productDetails || (req.files && (req.files.document || req.files.image1 || req.files.image2 || req.files.image3 || req.files.image4))) {

//   productDetails = JSON.parse(productDetails)

//   /* need to optimize the below code*/
//   if (req.files && req.files.document) {
//     let data = {
//       Key: `${sellerID}/${req.files.document.name}`,
//       body: req.files.document.data
//     }
//     const _document = await uploadToDOSpace(data)
//     productDetails.productDetails.document.name = req.files.document.name;
//     productDetails.productDetails.document.code = _document.Location;
//   }

//   if (req.files && req.files.image1) {
//     let data = {
//       Key: `${sellerID}/${req.files.image1.name}`,
//       body: req.files.image1.data
//     }
//     const _image1 = await uploadToDOSpace(data)
//     productDetails.productDetails.image.image1.name = req.files.image1.name;
//     productDetails.productDetails.image.image1.code = _image1.Location;
//   }
//   if (req.files && req.files.image2) {
//     let data = {
//       Key: `${sellerID}/${req.files.image2.name}`,
//       body: req.files.image2.data
//     }
//     const _image2 = await uploadToDOSpace(data)
//     productDetails.productDetails.image.image2.name = req.files.image2.name;
//     productDetails.productDetails.image.image2.code = _image2.Location;
//   }
//   if (req.files && req.files.image3) {
//     let data = {
//       Key: `${sellerID}/${req.files.image3.name}`,
//       body: req.files.image3.data
//     }
//     const _image3 = await uploadToDOSpace(data)
//     productDetails.productDetails.image.image3.name = req.files.image3.name;
//     productDetails.productDetails.image.image3.code = _image3.Location;
//   }
//   if (req.files && req.files.image4) {
//     let data = {
//       Key: `${sellerID}/${req.files.image4.name}`,
//       body: req.files.image4.data
//     }
//     const _image4 = await uploadToDOSpace(data)
//     productDetails.productDetails.image.image4.name = req.files.image4.name;
//     productDetails.productDetails.image.image4.code = _image4.Location;
//   }
//   /* till here*/

//   let productsId = []
//   let prdctDtls

//   if (productDetails._id !== null) {
//     prdctDtls = await addProductDetails(productDetails._id, productDetails)
//   } else {
//     prdctDtls = await addProductDetails(null, productDetails)
//   }
//   productsId = user.sellerProductId

//   if (
//     (productsId &&
//       productsId.length &&
//       productDetails &&
//       productDetails._id === null) ||
//     productDetails._id === undefined
//   ) {
//     productsId.push(prdctDtls._id)
//   } else if (
//     (prdctDtls._id &&
//       productsId.length === 0 &&
//       productDetails._id === null) ||
//     productDetails._id === undefined
//   ) {
//     productsId = []
//     productsId.push(prdctDtls._id)
//   }
//   newData.sellerProductId = productsId
//   seller = await updateSeller({
//     _id: sellerID
//   }, newData)
// }