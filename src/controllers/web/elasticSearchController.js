const camelcaseKeys = require("camelcase-keys");
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category, location } = require("../../modules");
const { addSellerBulkIndex, sellerSearch, searchFromElastic } = elastic;
const {
  /* getPrimaryCategory, */ getRelatedPrimaryCategory,
  getCatId,
  getSecondaryCategory,
  getProductCategoryBySecCat,
  getAllSellerTypes,
  getAllPrimaryCategory,
  getAllSecondaryCategory,
  getAllProductsToSearch,
} = category;
const { getAllCities, getAllStates } = location;
module.exports.addSellerBulkIndex = async (req, res) => {
  try {
    const msg = await addSellerBulkIndex();
    return respSuccess(res, msg);
  } catch (err) {
    return respError(res, err.message);
  }
};

module.exports.serachSeller = async (req, res) => {
  try {
    const reqQuery = camelcaseKeys(req.query);
    console.log(reqQuery, "????????????????????????????????????/");
    const secCat = await getSecondaryCategory(reqQuery.secondaryId);
    console.log(secCat, "secCat.................");
    if (secCat) {
      const product = await getProductCategoryBySecCat({ name: secCat.name });
      console.log(product, "product.......");
      reqQuery.secondaryId =
        (product && product.secondaryId) || reqQuery.secondaryId;
    }

    if (reqQuery.keyword) {
      const range = {
        skip: parseInt(reqQuery.skip),
        limit: parseInt(reqQuery.limit),
      };
      let serviceTypes = await getAllSellerTypes();
      serviceTypes = serviceTypes.map((type) => ({
        name: type.name,
        id: type._id,
      }));
      let cities = await getAllCities({});
      cities = cities.map((city) => ({ name: city.name, id: city._id }));
      let states = await getAllStates();
      states = states.map((state) => ({ name: state.name, id: state._id }));
      let l2 = await getAllPrimaryCategory();
      l2 = l2.map((primecat) => ({ name: primecat.name, id: primecat._id }));
      let l3 = await getAllSecondaryCategory();
      l3 = l3.map((seccat) => ({ name: seccat.name, id: seccat._id }));
      let products = await getAllProductsToSearch();
      products = products.map((product) => ({
        name: product.name,
        id: product._id,
      }));
      let newKeyword = reqQuery.keyword.split(" ");
      console.log("newKeyword", products);
      let serviceType = "",
        city = "",
        state = "",
        product = "";
      for (let i = 0; i < newKeyword.length; i++) {
        let _keyword =
          newKeyword[i].charAt(0).toUpperCase() + newKeyword[i].slice(1);

        /* matched service_type && state || city */
        let index = serviceTypes.findIndex(
          (service) => service.name == _keyword
        );
        if (index !== -1) serviceType = serviceTypes[index];
        index = cities.findIndex((city) => city.name == _keyword);
        if (index !== -1) city = cities[index];
        index = states.findIndex((state) => state.name == _keyword);
        if (index !== -1) state = states[index];

        /* products */
        let productsArray = products.filter((product) =>
          product.name.includes(_keyword)
        );
        if (productsArray && productsArray.length) product = productsArray;
        if (!productsArray && !productsArray.length) {
          productsArray = l3.filter((seccat) => seccat.name.includes(_keyword));
          if (productsArray && productsArray.length) product = productsArray;
        }
        if (!productsArray && !productsArray.length) {
          productsArray = l2.filter((primcat) =>
            primcat.name.includes(_keyword)
          );
          if (productsArray && productsArray.length) product = productsArray;
        }
      }
      // console.log(serviceType, city, state, product, "fuck it all.......");
      reqQuery.searchProductsBy = {
        serviceType,
        city,
        state,
        product
      }
      console.log(product, ".......................")
      const result = await sellerSearch(reqQuery);
      console.log(result, ".............///////")
      const { query, catId } = result;
      const seller = await searchFromElastic(query, range);
      // console.log(seller, "seller.....................")
      const primaryCatId = await getCatId({ productId: product[0].id }, "_id");
      console.log(primaryCatId, ".............");
      const relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      const resp = {
        total: seller[1],
        data: seller[0],
        relatedCat,
        serviceType,
        city,
        state
      };
      console.log(resp, "//////////////////////")
      return respSuccess(res, resp);
    }

    console.log("module.exports.serachSeller -> reqQuery", reqQuery);

    const range = {
      skip: parseInt(reqQuery.skip),
      limit: parseInt(reqQuery.limit),
    };
    // const que = {
    //     _id: reqQuery.productId
    // }
    const primaryCatId = await getCatId(reqQuery, "_id");
    console.log("primaryCatId", primaryCatId);
    const result = await sellerSearch(reqQuery);
    console.log(result, "result..................");
    const { query, catId } = result;
    const seller = await searchFromElastic(query, range);
    console.log(seller, "............////////////")
    const relatedCat = await getRelatedPrimaryCategory(primaryCatId);
    // console.log(" qurty result------", relatedCat)
    const resp = {
      total: seller[1],
      data: seller[0],
      relatedCat,
    };
    return respSuccess(res, resp);
  } catch (error) { }
};
