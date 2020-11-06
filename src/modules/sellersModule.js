const mongoose = require("mongoose");
const _ = require('lodash')
const Sellers = require("../models/sellersSchema");
const SellersBusiness = require("../models/sellerBusinessSchema");
const SellersCompany = require("../models/sellerCompanySchema");
const SellersContact = require("../models/sellerContactsSchema");
const SellersEstablishment = require("../models/sellerEstablishmentSchema");
const SelleresProductList = require("../models/sellerProductListSchema");
const SellersStatutory = require("../models/sellerStatutorySchema");
const Users = require("../../config/tenderdb").userModel;
const {
  checkAndAddCity,
  getState,
  getCountry,
  getServiceCity
} = require("../modules/locationsModule");
const {
  getPrimaryCat,
  checkAndAddSellerType,
  getLevelOneCategoryList,
  getLevelTwoCategoryList,
  getLevelThreeCategoryList,
  getLevelFourCategoryList
} = require("../modules/categoryModule");
const { sellerProductsBulkInsert } = require('./sellerProductModule')
const { capitalizeFirstLetter } = require('../utils/helpers')

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
        resolve(doc);
      })
      .catch((error) => reject(error));
});

module.exports.checkSellerExistOrNot = (mobile) =>
  new Promise((resolve, reject) => {
    Users.find({ mobile: mobile })
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
});

module.exports.addSeller = (data) =>
  new Promise((resolve, reject) => {
    Sellers.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addSellerToTender = (data) =>
  new Promise((resolve, reject) => {
    Users.create(data)
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.sellerBulkInser = (data) =>
  new Promise((resolve, reject) => {
    Sellers.insertMany(data)
      .then((doc) => {
        console.log("doc", doc);
        resolve(doc);
      })
      .catch(reject);
  });

module.exports.getSeller = (id) =>
  new Promise((resolve, reject) => {
    Sellers.find({ userId: id })
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("contactId")
      .populate("comapanyId")
      .populate("establishmentId")
      .populate("sellerProductId")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

exports.getSellerProfile = (id) =>
  new Promise((resolve, reject) => {
    console.log(id, 'seacg is seller-----------')
      Sellers.find({_id: id})
      .populate("primaryCatId")
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("contactId")
      .populate("comapanyId")
      .populate("establishmentId")
      .populate("sellerProductId")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .then((doc) => {
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.getAllSellers = () =>
  new Promise((resolve, reject) => {
    Sellers.find({})
      .populate("sellerType")
      .populate("busenessId")
      .populate("statutoryId")
      .populate("contactId")
      .populate("comapanyId")
      .populate("establishmentId")
      .populate("sellerProductId")
      .populate("location.city", "name")
      .populate("location.state", "name")
      .populate("location.country", "name")
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateSeller = (id, data) =>
new Promise((resolve, reject) => {
  // console.log("id, data", id, data)
    Sellers.findOneAndUpdate({ _id: id }, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addbusinessDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersBusiness.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addCompanyDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersCompany.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addContactDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersContact.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addEstablishmentPhotos = (id, data) =>
  new Promise((resolve, reject) => {
    SellersEstablishment.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addProductDetails = (id, data) =>
  new Promise((resolve, reject) => {
    // SelleresProductList.findOneAndUpdate(
    //   { sellerId },
    //   { $set: data },
    //   { new: true, upsert: true }
    // )
    SelleresProductList.create(data)
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.addStatutoryDetails = (sellerId, data) =>
  new Promise((resolve, reject) => {
    SellersStatutory.findOneAndUpdate(
      { sellerId },
      { $set: data },
      { new: true, upsert: true }
    )
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

module.exports.updateSellerPassword = (mobile, data) =>
  new Promise((resolve, reject) => {
    Sellers.findOneAndUpdate({ mobile }, data, { new: true })
      .then((doc) => {
        console.log(doc);
        resolve(doc);
      })
      .catch((error) => reject(error));
  });

exports.inserSeller = async (seller) => {
  const { name, address, numbers, City, Category } = seller;

  let cityData = City ? await checkAndAddCity({ name: City }) : null;
  let stateData =
    cityData && cityData.state ? await getState(cityData.state) : null;
  let countryData =
    stateData && stateData.country ? await getCountry(stateData.country) : null;
  let categoryData =
    countryData && Category ? await getPrimaryCat({ name: Category }) : null;

  let mobile = numbers.replace(/[\[\]' ]+/g, "").split(",");
  mobile = mobile.map((m) => ({
    mobile: m,
  }));

  let addr = address.split(",");
  const pincodeSplit = addr.filter((data) => data.includes("-"));
  const pinData = pincodeSplit[pincodeSplit.length - 1];
  const pincode = pinData.substring(pinData.indexOf("-") + 1);
  addr.splice(addr.indexOf(pinData), 1);
  const completeAddress = addr.join(",");

  const location = {
    city: (cityData && cityData._id) || null,
    state: (stateData && stateData._id) || null,
    country: (countryData && countryData._id) || null,
    address: completeAddress,
    pincode: pincode.trim(),
  };
  const finalData = {
    name,
    mobile,
    location,
    primaryCatId: (categoryData && categoryData._id) || null,
  };
  return finalData;
};

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
  } = seller;

  name = name.trim()
  let serviceCity = Service_City.trim().split(",")
  serviceCity = await getServiceCity(_.uniq(serviceCity))

  Level_4 = Level_4.split(",");
  const levelFour = await getLevelFourCategoryList(Level_4)

  console.log(' working ------------------')

  let sellerType = await checkAndAddSellerType({name : capitalizeFirstLetter(Service_Type)})

  const sellerExist = await this.checkSellerExist({name})
  if(sellerExist){
    let productData=[]
    let proData=[]
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
    let _sellerType=[];
    const selType = {
          name: sellerType,
          cities:serviceCity.map((cat) => ({
            city: cat._id,
            state: cat.state._id || null
          }))
        }
    // console.log("selType -----------------", selType)
    if(sellerExist.sellerType.length){
      _sellerType = sellerExist.sellerType
      _sellerType.push(selType)
    }else{
      _sellerType.push(selType)
    }
    
    const finalData = {
      sellerType:_sellerType,
      sellerProductId: proData
    }
    // console.log("finalData", _sellerType[1].cities)

  const updateSeller = await this.updateSeller(sellerExist._id,finalData)
  // console.log("updateSeller +++++++++++++++++", updateSeller)
    
  }else{

      console.log("sellerExist", sellerExist)
      let addr = address.split(",");
      const pincodeSplit = addr.filter((data) => data.includes("-"));
      const pinData = pincodeSplit[pincodeSplit.length - 1];
      const pincode = pinData.substring(pinData.indexOf("-") + 1).trim();
      addr.splice(addr.indexOf(pinData), 1);
      const completeAddress = addr.join(",");
      
      Level_1 = Level_1.split(",");
      Level_2 = Level_2.split(",");
      Level_3 = Level_3.split(",");

      // Level_4 = Level_4.split(","); -----------

      // console.log("Level_2", Level_3)

      let cityData = City ? await checkAndAddCity({ name: City.trim() }) : null;
      let stateData =
        cityData && cityData.state ? await getState(cityData.state) : null;
      let countryData =
        stateData && stateData.country ? await getCountry(stateData.country) : null;
      // let categoryData =
      //   countryData && Category ? await getPrimaryCat({ name: Category }) : null;
      let mobile= []


      // let serviceCity = Service_City.trim().split(",") ------
      // serviceCity = await getServiceCity(_.uniq(serviceCity))-----


      // let sellerType = await checkAndAddSellerType({name : capitalizeFirstLetter(Service_Type)})-----


      // const levelOne = await getLevelOneCategoryList(Level_1)
      // const levelTwo = await getLevelTwoCategoryList(Level_2)
      // const levelThree = await getLevelThreeCategoryList(Level_3)

      // const levelFour = await getLevelFourCategoryList(Level_4) ------
      
      
      // console.log(levelFour, ' lllllllllllllllllllllllllll')
      // serviceCity = await checkAndAddSellerType()

      Mobile_1 &&  mobile.push({
        mobile: Mobile_1
      })
      Mobile_2 &&  mobile.push({
        mobile: Mobile_2
      })
      Mobile_3 &&  mobile.push({
        mobile: Mobile_3
      })
      Mobile_4 &&  mobile.push({
        mobile: Mobile_4
      })
      Mobile_5 &&  mobile.push({
        mobile: Mobile_5
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
        sellerType:[{
          name: sellerType,
          cities:serviceCity.map((cat) => ({
            city: cat._id,
            state: cat.state._id || null
          })),
        }]
      }
      const result = await this.addSeller(finalData)
      let productData=[]
      let proData=[]
      if(result){
        
          productData = levelFour.map((pro) => ({
            sellerId: result._id,
            serviceType: capitalizeFirstLetter(Service_Type),
            parentCategoryId: pro.parentCatId._id,
            primaryCategoryId: pro.primaryCatId._id,
            secondaryCategoryId: pro.secondaryId._id,
            poductId: pro._id,
          }))
          // console.log("productData========", productData)
          proData = await sellerProductsBulkInsert(productData)
          const upData = {
            sellerProductId: proData
          }
        const updateSeller = await this.updateSeller(result._id,upData)
        console.log("proData inseted data-------", updateSeller)

      }

  }
  

  return 'data updated successfully'
  // console.log("location", finalData)
};

