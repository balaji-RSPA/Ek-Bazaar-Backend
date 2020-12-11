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
  getProductByName,
  getSecondaryCategoryByName,
  getPrimaryCategoryByName
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
    const secCat = await getSecondaryCategory(reqQuery.secondaryId);
    if (secCat) {
      const product = await getProductCategoryBySecCat({ name: secCat.name });
      reqQuery.secondaryId =
        (product && product.secondaryId) || reqQuery.secondaryId;
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
      let serviceTypes = await getAllSellerTypes();
      serviceTypes = serviceTypes.map((type) => ({
        name: type.name,
        id: type._id,
      }));
      let cities = await getAllCities({});
      cities = cities.map((city) => ({ name: city.name, id: city._id }));
      let states = await getAllStates();
      states = states.map((state) => ({ name: state.name, id: state._id }));
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 54 ~ serviceTypes=serviceTypes.map ~ serviceTypes", serviceTypes)
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 59 ~ module.exports.serachSeller= ~ cities", cities)
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 69 ~ module.exports.serachSeller= ~ states", states)

      let serviceType = "",
        city = "",
        state = ""

      for (let i = 0; i < newKeyword.length; i++) {
        let _keyword =
          newKeyword[i].charAt(0).toUpperCase() + newKeyword[i].slice(1);
        console.log("🚀 ~ file: elasticSearchController.js ~ line 75 ~ module.exports.serachSeller= ~ _keyword", _keyword)

        /* matched service_type && state || city */
        let index = serviceTypes.findIndex(
          (service) => service.name == _keyword
        );
        if (index !== -1) serviceType = serviceTypes[index];
        index = cities.findIndex((city) => city.name == _keyword);
        if (index !== -1) city = cities[index];
        index = states.findIndex((state) => state.name == _keyword);
        if (index !== -1) state = states[index];
      }
      console.log("🚀 ~ file: elasticSearchController.js ~ line 68 ~ module.exports.serachSeller= ~ serviceType", serviceType)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 69 ~ module.exports.serachSeller= ~ city", city)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 70 ~ module.exports.serachSeller= ~ state", state)

      newKeyword = newKeyword.join(" ");
      console.log("🚀 ~ file: elasticSearchController.js ~ line 83 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)
      let productSearchKeyword = newKeyword.replace(city.name, "")
      productSearchKeyword = productSearchKeyword.replace(state.name, "")
      productSearchKeyword = productSearchKeyword.replace(serviceType.name, "")
      console.log("🚀 ~ file: elasticSearchController.js ~ line 89 ~ module.exports.serachSeller= ~ productSearchKeyword", productSearchKeyword)

      reqQuery.searchProductsBy = {
        serviceType,
        city,
        state,
        product: productSearchKeyword.trim()
      }
      let reg = new RegExp(`${productSearchKeyword.trim()} `)
      const result = await sellerSearch(reqQuery);
      console.log("🚀 ~ file: elasticSearchController.js ~ line 96 ~ module.exports.serachSeller= ~ result", result.should)
      const { query, catId } = result;
      const seller = await searchFromElastic(query, range);
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 99 ~ module.exports.serachSeller= ~ seller", seller)
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
      console.log("🚀 ~ file: elasticSearchController.js ~ line 140 ~ module.exports.serachSeller= ~ seller[0]", seller[0])
      return respSuccess(res, resp);
    }


    const range = {
      skip: parseInt(reqQuery.skip),
      limit: parseInt(reqQuery.limit),
    };
    // const que = {
    //     _id: reqQuery.productId
    // }
    const primaryCatId = await getCatId(reqQuery, "_id");
    const result = await sellerSearch(reqQuery);
    const { query, catId } = result;
    const seller = await searchFromElastic(query, range);
    const relatedCat = await getRelatedPrimaryCategory(primaryCatId);
    const resp = {
      total: seller[1],
      data: seller[0],
      relatedCat,
    };
    return respSuccess(res, resp);
  } catch (error) { }
};
