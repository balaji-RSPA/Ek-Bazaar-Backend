const camelcaseKeys = require("camelcase-keys");
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category, location } = require("../../modules");
const { addSellerBulkIndex, sellerSearch, searchFromElastic, getSuggestions, getAllCitiesElastic, getAllStatesElastic } = elastic;
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
    console.log("module.exports.serachSeller -> reqQuery", reqQuery)
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

      let newKeyword = keyword.toLowerCase().trim()
      newKeyword = newKeyword.replace(" in ", " ");
      newKeyword = newKeyword.replace(",", "")
      newKeyword = newKeyword.split(" ");
      console.log("🚀 ~ file: elasticSearchController.js ~ line 48 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)

      const range = {
        skip: parseInt(skip),
        limit: parseInt(limit),
      };

      let city = "",
        state = "", cities = {}, states = {}

      const citiesQuery = await sellerSearch({ cityFromKeyWord: keyword })
      let { query } = citiesQuery
      console.log("module.exports.serachSeller -> query", query)
      const _cities = await getAllCitiesElastic(query)
      console.log("module.exports.serachSeller -> _cities", _cities)
      if (_cities[0].length && _cities[0][0]._source)
        cities = _cities[0][0]._source
      console.log("module.exports.serachSeller -> cities", cities)
      const statesQuery = await sellerSearch({ stateFromKeyWord: keyword })
      query = statesQuery.query
      const _states = await getAllStatesElastic(query)
      console.log("module.exports.serachSeller -> _states", _states[0][0])
      if (_states[0].length && _states[0][0]._source)
        states = _states[0][0]._source
      console.log("module.exports.serachSeller -> states", states)
      // let cities = await getAllCities({});
      // cities = cities.map((city) => ({ name: city.name, id: city._id, state: city.state }));
      // let states = await getAllStates();
      // states = states.map((state) => ({ name: state.name, id: state._id }));
      // for (let i = 0; i < newKeyword.length; i++) {
      //   let _keyword = newKeyword[i]

      //   /* matched service_type && state || city */
      //   let index = -1

      //   index = cities.findIndex((city) => city.name == _keyword);
      //   if (index !== -1 && city === "") city = cities[index];
      //   index = states.findIndex((state) => state.name.includes(_keyword));
      //   if (index !== -1 && state === "") state = states[index];
      // }

      newKeyword = newKeyword.join(" ");

      let productSearchKeyword = newKeyword.split(" ")

      reqQuery.searchProductsBy = {
        city,
        state,
        product: productSearchKeyword
      }

      const result = await sellerSearch(reqQuery);
      query = result.query
      console.log("module.exports.serachSeller -> query", query)
      let { aggs, catId } = result;
      console.log("module.exports.serachSeller -> aggs", aggs)
      const seller = await searchFromElastic(query, range, aggs);
      console.log("module.exports.serachSeller -> seller", seller)
      // const product = await getProductByName({ name: { $regex: reg, $options: "si" } })
      // let primaryCatId, relatedCat, secCat, primCat

      // if (product && product.length) {
      //   primaryCatId = await getCatId({ productId: product[0]._id }, "_id");
      //   relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      // } else if (product && !product.length) {
      //   secCat = await getSecondaryCategoryByName({ name: { $regex: reg, $options: "si" } })
      //   if (secCat && secCat.length) {
      //     primaryCatId = secCat[0].primaryCatId
      //     relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      //   }
      // } else if (secCat && !secCat.length) {
      //   primCat = await getPrimaryCategoryByName({ name: { $regex: reg, $options: "si" } })
      //   if (primCat) {
      //     primaryCatId = primCat._id
      //     relatedCat = await getRelatedPrimaryCategory(primaryCatId);
      //   }
      // }
      const resp = {
        total: seller[2]["products"]["value"], //seller[1],
        data: seller[0],
        // relatedCat: relatedCat || [],
        // serviceType,
        city: cities,
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
      city.id = _city._id
      city.name = _city.name
      city.state = _city.state
    }
    const result = await sellerSearch(reqQuery);
    const { query, catId, aggs } = result;
    const seller = await searchFromElastic(query, range, aggs);
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

    const { skip, limit, search } = reqQuery
    if (search !== 'undefined' && search) {
      const query = {
        "wildcard": {
          "name": {
            "value": search + "*",
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
          "must": {
            "match_all": {}
          }
        }
        // }
      }
      let suggestions = await getSuggestions(query, { skip, limit })

      return respSuccess(res, suggestions[0])
    }

  } catch (error) {
    respError(res, error.message)
  }
}
