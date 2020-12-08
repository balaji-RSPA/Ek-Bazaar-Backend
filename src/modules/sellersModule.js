const mongoose = require('mongoose')
const _ = require('lodash')
const Sellers = require('../models/sellersSchema')
const SellersBusiness = require('../models/sellerBusinessSchema')
const SellersCompany = require('../models/sellerCompanySchema')
const SellersContact = require('../models/sellerContactsSchema')
const SellersEstablishment = require('../models/sellerEstablishmentSchema')
const SelleresProductList = require('../models/sellerProductListSchema')
const SellersStatutory = require('../models/sellerStatutorySchema')
const Users = require('../../config/tenderdb').userModel
const Sessions = require('../../config/tenderdb').sessionModel
const SessionsLogs = require('../../config/tenderdb').sessionLogModel
const SellerProducts = require('../models/sellerProductListSchema')
const Cities = require('../models/citiesSchema')
const States = require('../models/statesSchema')
const {
  checkAndAddCity,
  getState,
  getCountry,
  getServiceCity,
} = require('../modules/locationsModule')
const {
  getPrimaryCat,
  checkAndAddSellerType,
  getLevelOneCategoryList,
  getLevelTwoCategoryList,
  getLevelThreeCategoryList,
  getLevelFourCategoryList,
} = require('../modules/categoryModule')
const { sellerProductsBulkInsert } = require('./sellerProductModule')
const { capitalizeFirstLetter } = require('../utils/helpers')
const { PrimaryCategory, SecondaryCategory, ParentCategory } = require('../models')
const { updateESDoc } = require('./elasticSearchModule')

// module.exports.checkSellerExistOrNot = (mobile) =>
//   new Promise((resolve, reject) => {
//     Sellers.find({ "mobile.mobile": mobile })
//       .then((doc) => {
//         console.log(doc);
//         resolve(doc);
//       })
//       .catch((error) => reject(error));
//   });

module.exports.checkSellerExist = (query) =>
  new Promise((resolve, reject) => {
    Sellers.findOne(query)
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

/**
 * user functions
 */
module.exports.getAccessToken = (ipAddress) =>
  new Promise((resolve, reject) => {
    Sessions.find({ ipAddress })
      .sort({ _id: -1 })
      .limit(1)
      .then((doc) => {
        // console.log(doc, 'doc.........')
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.getSessionLog = (ipAddress) =>
  new Promise((resolve, reject) => {
    SessionsLogs.find({ ipAddress })
      .sort({ _id: -1 })
      .limit(1)
      .then((doc) => {
        // console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

exports.handleUserSession = (userId, data) =>
  new Promise((resolve, reject) => {
    Sessions.create(data)
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })

exports.getSessionCount = (userId) =>
  new Promise((resolve, reject) => {
    Sessions.countDocuments({ userId })
      .then((doc) => {
        if (doc >= 3) {
          Sessions.findOne(
            { userId },
            ['-_id -token '],
            { sort: { createdAt: 1 } },
            async (err, result) => {
              if (err) {
                reject()
              }
              const data = {
                userId: result.userId,
                userAgent: result.userAgent,
                // token: result.token,
                deviceId: result.deviceId,
                signIn: result.createdAt,
                ipAddress: result.ipAddress,
              }
              const swap = new SessionsLogs(data)
              swap.save((saveErr) => {
                if (!saveErr) {
                  result.remove()
                  resolve(swap)
                }
                reject(saveErr)
              })
            },
          )
        }

        resolve(doc)
      })
      .catch(reject)
  })

exports.handleUserLogoutSession = (query) =>
  new Promise((resolve, reject) => {
    Sessions.findOne(query, async (err, result) => {
      if (err) {
        reject(err)
      }

      const data = {
        userId: result.userId,
        userAgent: result.userAgent,
        // token: result.token,
        deviceId: result.deviceId,
        signIn: result.createdAt,
        ipAddress: result.ipAddress,
      }
      const swap = new SessionsLogs(data)
      swap.save((saveErr) => {
        if (!saveErr) {
          result.remove()
          resolve(swap)
        }
        reject(saveErr)
      })
    })
  })

exports.getUserAllSessionDataUpdate = (userId) =>
  new Promise((resolve, reject) => {
    Sessions.find({ userId }, async (err, doc) => {
      if (err) {
        reject(err)
      }

      SessionsLogs.insertMany(doc)
        .then((d) => {
          Sessions.deleteMany({ userId }, (error) => {
            if (!error) {
              console.log(error)
            } else {
              console.log('ok')
            }
          })
          resolve(d)
        })
        .catch(reject)
    }).catch(reject)
  })

exports.deleteAllSession = (userId) =>
  new Promise((resolve, reject) => {
    Sessions.deleteMany({ userId })
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })

exports.deleteAllSessionLog = (userId) =>
  new Promise((resolve, reject) => {
    SessionsLogs.deleteMany({ userId })
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })

module.exports.checkUserExistOrNot = (query) =>
  new Promise((resolve, reject) => {
    Users.find(query)
      .select({
        name: 1,
        email: 1,
        mobile: 1,
        isPhoneVerified: 1,
        isMobileVerified: 1,
        password: 1,
        // _id: -1,
      })
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.addUser = (data) =>
  new Promise((resolve, reject) => {
    Users.create(data)
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.getUserProfile = (id) =>
  new Promise((resolve, reject) => {
    Users.findOne({ _id: id })
      .select({
        name: 1,
        email: 1,
        mobile: 1,
        isPhoneVerified: 1,
        isMobileVerified: 1,
        // _id: -1,
      })
      .then((doc) => {
        // console.log(doc);
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.updateUser = (query, data) =>
  new Promise((resolve, reject) => {
    Users.findOneAndUpdate(query, data, { new: true })
      .then((doc) => {
        // console.log(doc);
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.forgetPassword = (mobile, data) =>
  new Promise((resolve, reject) => {
    Users.findOneAndUpdate({ mobile }, data, { new: true })
      .then((doc) => {
        // console.log(doc);
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

/**
 * seller functions
 */

module.exports.addSeller = (data) =>
  new Promise((resolve, reject) => {
    Sellers.create(data)
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.sellerBulkInser = (data) =>
  new Promise((resolve, reject) => {
    Sellers.insertMany(data)
      .then((doc) => {
        // console.log("doc", doc);
        resolve(doc)
      })
      .catch(reject)
  })
// populate : {path: ("primaryCategoryId")},
// populate : {path: ("secondaryCategoryId")},
module.exports.getSeller = (id,chkStock) =>
  new Promise((resolve, reject) => {
    let matchVal = null
    if(chkStock === true || chkStock === false){
      matchVal = {
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: 'productDetails.regionOfOrigin',
        },
        match: {
          'productDetails.inStock': {
              $eq: chkStock
          }
      }
      }
    }else{
      matchVal = {
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: 'productDetails.regionOfOrigin',
        }
      }
    }
    Sellers.findOne({ userId: id })
      .populate('sellerProductId.')
      .populate('sellerType.name', 'name')
      .populate('sellerType.cities.city', 'name')
      .populate('sellerType.cities.state', 'name region')
      .populate('busenessId')
      .populate('statutoryId')
      .populate({
        path: 'sellerContactId',
        model: SellersContact,
        populate: {
          path: "city",
          model: Cities
        },
        populate: {
          path: "state",
          model: States
        },
      })
      .populate('sellerCompanyId')
      .populate('establishmentId')

      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "parentCategoryId",
          model: ParentCategory.collection.name
        },
      })
      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "primaryCategoryId",
          model: PrimaryCategory.collection.name
        },
      })
      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "secondaryCategoryId",
          model: SecondaryCategory.collection.name
        },
      })
      .populate(matchVal)
      .populate('location.city', 'name')
      .populate('location.state', 'name region')
      .populate('location.country', 'name')
      .lean()
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

exports.getSellerProfile = (id) =>
  new Promise((resolve, reject) => {
    Sellers.find({ _id: id })
      .populate("primaryCatId")
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("sellerContactId")
      .populate("sellerCompanyId")
      .populate("establishmentId")
      .populate({
        path: "sellerProductId",
        model: "sellerproducts",
        populate: {
          path: "primaryCategoryId",
          model: "primarycategories"
        }
      })
      // .populate("sellerProductId")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error))
  })

module.exports.getAllSellers = () =>
  new Promise((resolve, reject) => {
    Sellers.find({})
      .populate('sellerType')
      .populate('busenessId')
      .populate('statutoryId')
      .populate('sellerContactId')
      .populate('sellerCompanyId')
      .populate('establishmentId')
      .populate('sellerProductId')
      .populate('location.city', 'name')
      .populate('location.state', 'name')
      .populate('location.country', 'name')
      .then((doc) => {
        console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.updateSeller = (query, data, elastic) =>
  new Promise((resolve, reject) => {
    console.log(query, data, ' uodate seller-----')
    Sellers.findOneAndUpdate(query, data, { new: true, upsert: true })
      .populate('sellerProductId.')
      .populate('sellerType.name', 'name')
      .populate('sellerType.cities.city', 'name')
      .populate('sellerType.cities.state', 'name region')
      .populate('busenessId')
      .populate('statutoryId')
      .populate('sellerContactId')
      .populate('sellerCompanyId')
      .populate('establishmentId')

      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "parentCategoryId",
          model: ParentCategory.collection.name
        },
      })
      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "primaryCategoryId",
          model: PrimaryCategory.collection.name
        },
      })
      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: "secondaryCategoryId",
          model: SecondaryCategory.collection.name
        },
      })
      .populate({
        path: 'sellerProductId',
        model: 'sellerproducts',
        populate: {
          path: 'productDetails.regionOfOrigin',
        },
      })
      .populate('location.city', 'name')
      .populate('location.state', 'name region')
      .populate('location.country', 'name')
      .lean()
      .then(async (doc) => {

        if (doc && elastic) {
          // const tenderDoc = JSON.parse(JSON.stringify(doc));
          const esData = JSON.parse(JSON.stringify(doc));
          delete esData._id; // ES will not support _id in the doc. so, deleted
          console.log("🚀 ~ file: sellersModule.js ~ line 453 ~ .then ~ esData", esData)
          // console.log(esData, ' elastic')
          await updateESDoc(doc._id, esData); // and updated to ES
        }

        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.addbusinessDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersBusiness.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true },
    )
      .then((doc) => {
        // console.log(doc);
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.addCompanyDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersCompany.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true },
    )
      .then((doc) => {
        console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.addContactDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
console.log("🚀 ~ file: sellersModule.js ~ line 494 ~ sellerId, data", sellerId, data)
    SellersContact.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true },
    )
      .then((doc) => {
        console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.addEstablishmentPhotos = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersEstablishment.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true },
    )
      .then((doc) => {
        console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })
// module.exports.addProductDetails = (id, data) =>
module.exports.addProductDetails = (id, data) =>
  new Promise((resolve, reject) => {
    if (id) {
      SelleresProductList.findOneAndUpdate({ _id: id }, { $set: data })
        .then((doc) => {
          resolve(doc)
        })
        .catch((error) => reject(error))
    } else {
      delete data._id
      SelleresProductList.create(data)
        .then((doc) => {
          resolve(doc)
        })
        .catch((error) => reject(error))
    }
  })
module.exports.addStatutoryDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersStatutory.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true },
    )
      .then((doc) => {
        console.log(doc)
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

exports.inserSeller = async (seller) => {
  const { name, address, numbers, City, Category } = seller

  let cityData = City ? await checkAndAddCity({ name: City }) : null
  let stateData =
    cityData && cityData.state ? await getState(cityData.state) : null
  let countryData =
    stateData && stateData.country ? await getCountry(stateData.country) : null
  let categoryData =
    countryData && Category ? await getPrimaryCat({ name: Category }) : null

  let mobile = numbers.replace(/[\[\]' ]+/g, '').split(',')
  mobile = mobile.map((m) => ({
    mobile: m,
  }))

  let addr = address.split(',')
  const pincodeSplit = addr.filter((data) => data.includes('-'))
  const pinData = pincodeSplit[pincodeSplit.length - 1]
  const pincode = pinData.substring(pinData.indexOf('-') + 1)
  addr.splice(addr.indexOf(pinData), 1)
  const completeAddress = addr.join(',')

  const location = {
    city: (cityData && cityData._id) || null,
    state: (stateData && stateData._id) || null,
    country: (countryData && countryData._id) || null,
    address: completeAddress,
    pincode: pincode.trim(),
  }
  const finalData = {
    name,
    mobile,
    location,
    primaryCatId: (categoryData && categoryData._id) || null,
  }
  return finalData
}

exports.structureSellerData = async (seller) => {
  let {
    name,
    address,
    City,
    Mobile_1,
    Mobile_2,
    Mobile_3,
    Mobile_4,
    Mobile_5,
    Service_City,
    Service_Type,
    Level_1,
    Level_2,
    Level_3,
    Level_4,
  } = seller

  name = name.trim()
  let serviceCity = Service_City.trim().split(',')
  serviceCity = await getServiceCity(_.uniq(serviceCity))
  if (typeof Level_4 === 'number') Level_4 = `${Level_4}`
  Level_4 = Level_4.split(',')
  const levelFour = await getLevelFourCategoryList(Level_4)

  console.log(' working ------------------')

  let sellerType = await checkAndAddSellerType({
    name: capitalizeFirstLetter(Service_Type),
  })

  const sellerExist = await this.checkSellerExist({ name })
  if (sellerExist) {
    console.log(' Existing Seller --------------')
    let productData = []
    let proData = []
    productData = levelFour.map((pro) => ({
      sellerId: sellerExist._id,
      serviceType: sellerType,
      parentCategoryId: pro.parentCatId._id,
      primaryCategoryId: pro.primaryCatId._id,
      secondaryCategoryId: pro.secondaryId._id,
      poductId: pro._id,
    }))
    proData = await sellerProductsBulkInsert(productData)
    // console.log(serviceCity, ' seller type -----')
    let _sellerType = []
    const selType = {
      name: sellerType,
      cities: serviceCity.map((cat) => ({
        city: cat._id,
        state: cat.state._id || null,
      })),
    }
    // console.log("selType -----------------", selType)
    if (sellerExist.sellerType.length) {
      _sellerType = sellerExist.sellerType
      _sellerType.push(selType)
    } else {
      _sellerType.push(selType)
    }

    const finalData = {
      sellerType: _sellerType,
      sellerProductId: proData,
    }
    // console.log("finalData", _sellerType[1].cities)

    const updateSeller = await this.updateSeller(
      { _id: sellerExist._id },
      finalData,
    )
    // console.log("updateSeller +++++++++++++++++", updateSeller)
  } else {
    console.log('New Seller -----------------------------')
    console.log(address, '>>>>>>')
    let addr = address.split(',')
    console.log(addr, '??????')
    const pincodeSplit = addr.filter((data) => data.includes('-'))
    console.log(pincodeSplit, '========')
    const pinData = pincodeSplit[pincodeSplit.length - 1]
    console.log(pinData, '+++++++')
    const pincode = pinData
      ? pinData.substring(pinData.indexOf('-') + 1).trim()
      : 0
    addr.splice(addr.indexOf(pinData), 1)
    const completeAddress = addr.join(',')

    Level_1 = Level_1.toString().split(',')
    Level_2 = Level_2.toString().split(',')
    Level_3 = Level_3.toString().split(',')

    // Level_4 = Level_4.split(","); -----------

    let cityData = City ? await checkAndAddCity({ name: City.trim() }) : null
    let stateData =
      cityData && cityData.state ? await getState(cityData.state) : null
    let countryData =
      stateData && stateData.country
        ? await getCountry(stateData.country)
        : null
    // let categoryData =
    //   countryData && Category ? await getPrimaryCat({ name: Category }) : null;
    let mobile = []

    // let serviceCity = Service_City.trim().split(",") ------
    // serviceCity = await getServiceCity(_.uniq(serviceCity))-----

    // let sellerType = await checkAndAddSellerType({name : capitalizeFirstLetter(Service_Type)})-----

    // const levelOne = await getLevelOneCategoryList(Level_1)
    // const levelTwo = await getLevelTwoCategoryList(Level_2)
    // const levelThree = await getLevelThreeCategoryList(Level_3)

    // const levelFour = await getLevelFourCategoryList(Level_4) ------

    // serviceCity = await checkAndAddSellerType()

    Mobile_1 &&
      mobile.push({
        mobile: Mobile_1,
      })
    Mobile_2 &&
      mobile.push({
        mobile: Mobile_2,
      })
    Mobile_3 &&
      mobile.push({
        mobile: Mobile_3,
      })
    Mobile_4 &&
      mobile.push({
        mobile: Mobile_4,
      })
    Mobile_5 &&
      mobile.push({
        mobile: Mobile_5,
      })

    const finalData = {
      name,
      mobile,
      location: {
        address: completeAddress,
        pincode,
        city: (cityData && cityData._id) || null,
        state: (stateData && stateData._id) || null,
        country: (countryData && countryData._id) || null,
      },
      sellerType: [
        {
          name: sellerType,
          cities: serviceCity.map((cat) => ({
            city: cat._id,
            state: cat.state._id || null,
          })),
        },
      ],
      source: 'vendor',
    }
    const result = await this.addSeller(finalData)
    let productData = []
    let proData = []

    if (result) {
      productData = levelFour.map((pro) => ({
        sellerId: result._id,
        serviceType: sellerType,
        parentCategoryId: pro.parentCatId._id,
        primaryCategoryId: pro.primaryCatId._id,
        secondaryCategoryId: pro.secondaryId._id,
        poductId: pro._id,
      }))
      proData = await sellerProductsBulkInsert(productData)
      const upData = {
        sellerProductId: proData,
      }
      const updateSeller = await this.updateSeller({ _id: result._id }, upData)
    }
  }

  return 'data updated successfully'
  // console.log("location", finalData)
}

module.exports.getSellerVal = (id) =>
  new Promise((resolve, reject) => {
    Sellers.findOne({ _id: id })
      .lean()
      .then((doc) => {
        resolve(doc)
      })
      .catch((error) => reject(error))
  })

module.exports.deleteSellerProduct = (data) =>
  new Promise((resolve, reject) => {
    SellerProducts.findByIdAndDelete({ _id: data })
      .then((doc) => {
        resolve(doc)
      })
      .catch(reject)
  })
/**
 * 
 * Multiple insert seller Product
 * */
module.exports.addSellerProduct = (data) =>
  new Promise((resolve, reject) => {
    SelleresProductList.insertMany(data, function (err, doc) {
      if (err) reject(err)
      else {
        const idArray = doc && doc.length && doc.map(d => d._id)
        resolve(idArray)
      }
    })
  })

