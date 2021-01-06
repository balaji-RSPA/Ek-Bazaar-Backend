const camelcaseKeys = require("camelcase-keys");
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category, location } = require("../../modules");
const { addSellerBulkIndex, sellerSearch, searchFromElastic, getSuggestions } = elastic;
const {
  /* getPrimaryCategory, */ getRelatedPrimaryCategory,
  getCatId,
  getSecondaryCategory,
  getProductCategoryBySecCat,
  getAllSellerTypes,
  getAllPrimaryCategory,
  getAllSecondaryCategory,
  getAllProductsToSearch,
  getProductByName,
  getSecondaryCategoryByName,
  getPrimaryCategoryByName
} = category;
const { getAllCities, getAllStates, getCity } = location;
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
    console.log("🚀 ~ file: elasticSearchController.js ~ line 33 ~ module.exports.serachSeller= ~ req.query", reqQuery)
    if (reqQuery.secondaryId) {
      const secCat = await getSecondaryCategory(reqQuery.secondaryId);
      if (secCat) {
        const product = await getProductCategoryBySecCat({ name: secCat.name });
        reqQuery.secondaryId =
          (product && product.secondaryId) || reqQuery.secondaryId;
      }
    }

    if (reqQuery.keyword) {
      const { keyword, skip, limit } = reqQuery
      console.log("🚀 ~ file: elasticSearchController.js ~ line 38 ~ module.exports.serachSeller= ~ limit", limit)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 38 ~ module.exports.serachSeller= ~ skip", skip)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 38 ~ module.exports.serachSeller= ~ keyword", keyword)

      let newKeyword = keyword.toLowerCase().split(" ");

      newKeyword = newKeyword.map(word => {
        return word.replace(word[0], word[0].toUpperCase())
      })

      const range = {
        skip: parseInt(skip),
        limit: parseInt(limit),
      };

      let serviceTypes = []
      const obj = {}
      if (reqQuery.serviceType) {
        serviceTypes = []
        obj.serviceType = reqQuery.serviceType
        reqQuery.serviceType = undefined
      } else {
        serviceTypes = await getAllSellerTypes(0, 16, {});
        serviceTypes = serviceTypes.map((type) => ({
          name: type.name,
          id: type._id,
        }));
      }

      let serviceType = !serviceTypes.length && Array.isArray(obj.serviceType) ? obj.serviceType.map(type => ({ id: type })) : obj.serviceType ? { id: obj.serviceType } : "",
        city = "",
        state = ""
      console.log("module.exports.serachSeller -> serviceType", serviceType)

      let cities = await getAllCities({});
      cities = cities.map((city) => ({ name: city.name, id: city._id, state: city.state }));
      let states = await getAllStates();
      states = states.map((state) => ({ name: state.name, id: state._id }));
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 54 ~ serviceTypes=serviceTypes.map ~ serviceTypes", serviceTypes)
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 59 ~ module.exports.serachSeller= ~ cities", cities)
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 69 ~ module.exports.serachSeller= ~ states", states)


      for (let i = 0; i < newKeyword.length; i++) {
        let _keyword = newKeyword[i]
        console.log("🚀 ~ file: elasticSearchController.js ~ line 75 ~ module.exports.serachSeller= ~ _keyword", _keyword)

        /* matched service_type && state || city */
        let index = -1
        if (serviceTypes.length) {
          index = serviceTypes.findIndex(
            (service) => service.name == _keyword
          );
          if (index !== -1) serviceType = serviceTypes[index];
        }
        index = cities.findIndex((city) => city.name == _keyword);
        if (index !== -1 && city === "") city = cities[index];
        index = states.findIndex((state) => state.name.includes(_keyword));
        if (index !== -1 && state === "") state = states[index];
      }
      console.log("🚀 ~ file: elasticSearchController.js ~ line 68 ~ module.exports.serachSeller= ~ serviceType", serviceType)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 69 ~ module.exports.serachSeller= ~ city", city)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 70 ~ module.exports.serachSeller= ~ state", state)

      newKeyword = newKeyword.join(" ");
      console.log("🚀 ~ file: elasticSearchController.js ~ line 83 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)
      // let productSearchKeyword = newKeyword
      let productSearchKeyword = newKeyword.replace(city.name, "")
      productSearchKeyword = productSearchKeyword.replace(state.name, "")
      productSearchKeyword = !serviceType.length && serviceType.name ? productSearchKeyword.replace(serviceType.name, "") : productSearchKeyword
      productSearchKeyword = productSearchKeyword.replace(" In ", " ")
      // productSearchKeyword = productSearchKeyword.split(" ")
      console.log("🚀 ~ file: elasticSearchController.js ~ line 89 ~ module.exports.serachSeller= ~ productSearchKeyword", productSearchKeyword)

      reqQuery.searchProductsBy = {
        serviceType,
        city,
        state,
        product: productSearchKeyword
      }
      
      const result = await sellerSearch(reqQuery);
      const { query, catId } = result;
      const seller = await searchFromElastic(query, range);
      console.log("🚀 ~ file: elasticSearchController.js ~ line 99 ~ module.exports.serachSeller= ~ seller", seller)
      // const product = await getProductByName({ name: { $regex: reg, $options: "si" } })
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 101 ~ module.exports.serachSeller= ~ product", product)
      // let primaryCatId, relatedCat, secCat, primCat

      // if (product && product.length) {
      //   primaryCatId = await getCatId({ productId: product[0]._id }, "_id");
      //   relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      // } else if (product && !product.length) {
      //   secCat = await getSecondaryCategoryByName({ name: { $regex: reg, $options: "si" } })
      //   // console.log("🚀 ~ file: elasticSearchController.js ~ line 111 ~ module.exports.serachSeller= ~ secCat", secCat)
      //   if (secCat && secCat.length) {
      //     primaryCatId = secCat[0].primaryCatId
      //     relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      //   }
      // } else if (secCat && !secCat.length) {
      //   primCat = await getPrimaryCategoryByName({ name: { $regex: reg, $options: "si" } })
      //   // console.log("🚀 ~ file: elasticSearchController.js ~ line 118 ~ module.exports.serachSeller= ~ primCat", primCat)
      //   if (primCat) {
      //     primaryCatId = primCat._id
      //     relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      //   }
      // }
      const resp = {
        total: seller[1],
        data: seller[0],
        // relatedCat: relatedCat || [],
        serviceType,
        city,
        state,
        productSearchKeyword
      };
      return respSuccess(res, resp);
    }


    const range = {
      skip: parseInt(reqQuery.skip),
      limit: parseInt(reqQuery.limit),
    };
    // const que = {
    //     _id: reqQuery.productId
    // }
    // const primaryCatId = await getCatId(reqQuery, "_id");
    const city = {}
    if (reqQuery.cityId) {
      const _city = await getCity({ _id: reqQuery.cityId })
      console.log("🚀 ~ file: elasticSearchController.js ~ line 157 ~ module.exports.serachSeller= ~ _city", _city)
      city.id = _city._id
      city.name = _city.name
      city.state = _city.state
    }
    const result = await sellerSearch(reqQuery);
    const { query, catId } = result;
    const seller = await searchFromElastic(query, range);
    // const relatedCat = await getRelatedPrimaryCategory(primaryCatId);
    const resp = {
      total: seller[1],
      data: seller[0],
      city
      // relatedCat,
    };
    return respSuccess(res, resp);
  } catch (error) { }
};

module.exports.searchSuggestion = async (req, res) => {
  try {
    const reqQuery = camelcaseKeys(req.query)
    console.log("module.exports.searchSuggestion -> reqQuery", reqQuery)
    const { skip, limit, search } = reqQuery
    if (search !== 'undefined' && search) {
      const query = {
        "wildcard": {
          "name": {
            "value": search+"*",
            "boost": 1.0,
            "rewrite": "constant_score"
          }
        }
      }
      let suggestions = await getSuggestions(query, { skip, limit })
      return respSuccess(res, suggestions[0])
    } else {
      const query = {
        // "query": {
          "bool": {
            "must" :{
              "match_all": {}
            }
          }
        // }
      }
      let suggestions = await getSuggestions(query, { skip, limit })
      console.log("module.exports.searchSuggestion -> suggestions", suggestions)
      return respSuccess(res, suggestions[0])
    }

  } catch (error) {
    respError(res, error.message)
  }
}
