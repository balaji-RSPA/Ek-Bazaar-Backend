const camelcaseKeys = require("camelcase-keys");
const { parse } = require("querystring")
const { respSuccess, respError } = require("../../utils/respHadler");
const { elastic, category, location } = require("../../modules");
const { addSellerBulkIndex, sellerSearch, searchFromElastic, getCountByCountry, getSuggestions, getAllCitiesElastic, getAllStatesElastic, getAllCountriesElastic } = elastic;
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

const { searchKeywords } = require("../../utils/searchKeywords");

module.exports.serachSeller = async (req, res) => {
  try {
    const reqQuery = camelcaseKeys(req.query);
    // console.log("module.exports.serachSeller -> reqQuery", reqQuery)
    // if (reqQuery.secondaryId) {
    //   const secCat = await getSecondaryCategory(reqQuery.secondaryId);
    //   if (secCat) {
    //     const product = await getProductCategoryBySecCat({ name: secCat.name });
    //     reqQuery.secondaryId =
    //       (product && product.secondaryId) || reqQuery.secondaryId;
    //   }
    // }


    let { productId, primaryId, level5Id, secondaryId, parentId, skip, limit, country } = reqQuery
    if (country) {
      reqQuery._country = reqQuery.country
      reqQuery.country = undefined
    }
    console.log("🚀 ~ file: elasticSearchController.js ~ line 43 ~ module.exports.serachSeller= ~ secondaryId", secondaryId, typeof primaryId)
    secondaryId = typeof secondaryId === "object" ? `${secondaryId}` : secondaryId
    console.log("🚀 ~ file: elasticSearchController.js ~ line 43 ~ module.exports.serachSeller= ~ level5Id", reqQuery)
    let level5, level4, level3, level2, level1;
    if (level5Id && level5Id.includes("value")) {
      level5 = parse(level5Id)
      reqQuery.keyword = level5.label.split("_").map(elem => `${elem.charAt(0).toUpperCase()}${elem.slice(1)}`).join(" ")
      delete reqQuery.level5Id
    }
    if (productId && productId.includes("value")) {
      level4 = parse(productId)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 54 ~ module.exports.serachSeller= ~ level4", level4)
      reqQuery.keyword = level4.label.split("_").map(elem => `${elem.charAt(0).toUpperCase()}${elem.slice(1)}`).join(" ")
      console.log("🚀 ~ file: elasticSearchController.js ~ line 56 ~ module.exports.serachSeller= ~ reqQuery.keyword", reqQuery.keyword)
      delete reqQuery.productId
    }
    if (secondaryId && secondaryId.includes("value")) {
      level3 = parse(secondaryId)
      reqQuery.keyword = level3.label.split("_").map(elem => `${elem.charAt(0).toUpperCase()}${elem.slice(1)}`).join(" ")
      delete reqQuery.secondaryId
    }
    if (primaryId && primaryId.includes("value")) {
      level2 = parse(primaryId)
      reqQuery.keyword = level2.label.split("_").map(elem => `${elem.charAt(0).toUpperCase()}${elem.slice(1)}`).join(" ")
      delete reqQuery.primaryId
    }
    if (parentId && parentId.includes("value")) {
      level1 = parse(parentId)
      reqQuery.keyword = level1.label.split("_").map(elem => `${elem.charAt(0).toUpperCase()}${elem.slice(1)}`).join(" ")
      delete reqQuery.parentId
    }

    if (reqQuery.keyword) {
      const { keyword, skip, limit } = reqQuery

      let newKeyword = keyword.toLowerCase().trim()
      console.log("🚀 ~ file: elasticSearchController.js ~ line 86 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)
      // newKeyword = newKeyword.includes(" mills") ? newKeyword.replace(" mills", " mill") : newKeyword
      newKeyword = newKeyword.includes("channapatna toys") ? newKeyword.replace("channapatna toys", "chennapatna toys") : newKeyword

      // newKeyword = newKeyword.replace(" in ", " ");
      // newKeyword = newKeyword.replace(" in", " ");

      reg1 = new RegExp(`\\bin\\b`, "mg")
      let condition = reg1.test(newKeyword)
      if(condition) newKeyword = newKeyword.replace(reg1, "")

      newKeyword = newKeyword.replace(",", "")
      newKeyword = newKeyword.split(" ").filter(item => item);
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 48 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)

      const range = {
        skip: parseInt(skip),
        limit: parseInt(limit),
      };

      let city = "",
        state = "", country = "", cities = {}, states = {}, countries = {}

      /************** COUNTRY FROM ELASTICSEARCH **************/
      const countriesQuery = await sellerSearch({ countryFromKeyword: newKeyword })
      let { query } = countriesQuery
      const _countries = await getAllCountriesElastic(query)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 144 ~ module.exports.serachSeller= ~ _countries", _countries)
      if (_countries[0].length) {
        newKeyword = newKeyword.join(" ")
        let __countries = _countries[0].filter(country => newKeyword.includes(country._source.name)) //[0]._source
        if (__countries.length) {
          countries = __countries[0]["_source"]
          countries.id = __countries[0]["_id"]
          countries._id = __countries[0]["_id"]
          const replace = countries.name
          if (replace && newKeyword.split(" ").lastIndexOf(replace) !== 0 && newKeyword.split(" ").length > 1 && !newKeyword.includes("/")) {
            newKeyword = newKeyword.split(" ")
            newKeyword.splice(newKeyword.lastIndexOf(replace.split(" ")[0]), replace.split(" ").length)
            newKeyword = newKeyword.join(" ")
          } else countries = {}
          // newKeyword = newKeyword.replace(`${countries.name}`, '')
        } else countries = {}
        newKeyword = newKeyword.split(" ")
      }

      /************ STATES FROM ELASTICSEARCH *************/
      const statesQuery = await sellerSearch({ stateFromKeyWord: newKeyword })
      query = statesQuery.query
      const _states = await getAllStatesElastic(query)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 120 ~ module.exports.serachSeller= ~ _states", _states)
      if (_states[0].length) {
        newKeyword = newKeyword.join(" ")
        let __states = _states[0].filter(state => newKeyword.includes(state._source.name))
        console.log("🚀 ~ file: elasticSearchController.js ~ line 114 ~ module.exports.serachSeller= ~ __states", __states)
        if (__states.length) {
          states = __states[0]["_source"]
          states.id = __states[0]["_id"]
          states._id = __states[0]["_id"]
          const replace = states.name
          console.log("🚀 ~ file: elasticSearchController.js ~ line 130 ~ module.exports.serachSeller= ~ replace", replace)
          if (replace && newKeyword.split(" ").lastIndexOf(replace) !== 0 && newKeyword.split(" ").length > 1 && !newKeyword.includes("/")) {
            newKeyword = newKeyword.split(" ")
            newKeyword.splice(newKeyword.lastIndexOf(replace.split(" ")[0]), replace.split(" ").length)
            newKeyword = newKeyword.join(" ")
          } else states = {}
          // newKeyword = newKeyword.replace(`${states.name}`, '') 
        } else states = {}
        newKeyword = newKeyword.split(" ")
      }

      /****** CITIES FROM ELASTICSEARCH **************/
      const citiesQuery = await sellerSearch({ cityFromKeyWord: newKeyword })
      query = citiesQuery.query
      const _cities = await getAllCitiesElastic(query)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 93 ~ module.exports.serachSeller= ~ _cities", _cities)
      if (_cities[0].length) {

        newKeyword = newKeyword.join(" ")
        let __cities = _cities[0].length && _cities[0].filter(city => city._source && city._source.alias && city._source.alias.filter(name => newKeyword.includes(name) && newKeyword.split(" ").lastIndexOf(name) !== 0)[0]) || []

        if (__cities.length) {
          cities = __cities[0]["_source"]
          cities.id = __cities[0]["_id"]
          cities._id = __cities[0]["_id"]
          let replace = cities.alias.filter(name => newKeyword.includes(name))[0]
          console.log("🚀 ~ file: elasticSearchController.js ~ line 94 ~ module.exports.serachSeller= ~ replace", replace)
          if (replace && newKeyword.split(" ").lastIndexOf(replace) !== 0 && newKeyword.split(" ").length > 1 && !newKeyword.includes("/")) {
            reqQuery.cityId = cities._id
            newKeyword = newKeyword.split(" ")
            newKeyword.splice(newKeyword.lastIndexOf(replace.split(" ")[0]), replace.split(" ").length)
            newKeyword = newKeyword.join(" ")
          }
          else cities = {}
        } else cities = {}
        newKeyword = newKeyword.split(" ");

      }

      newKeyword = [newKeyword.filter(item => item).join(" ")]
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 191 ~ module.exports.serachSeller= ~ searchKeywords", searchKeywords, newKeyword)
      // let word = newKeyword.join(" ").split(" ")
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 189 ~ module.exports.serachSeller= ~ word", word)
      // for (let i = 0; i < word.length; i++) {
      //   let pluralIndex = -1
      //   let singularIndex = -1
      //   pluralIndex = searchKeywords.findIndex(item => item == word[i])
      //   singularIndex = searchKeywords.findIndex(item => item.slice(0, item.length -1) == word[i])
      //   if(singularIndex !== -1) {
      //     newKeyword = [word[i], searchKeywords[singularIndex]]
      //     break;
      //   }
      //   if (pluralIndex !== -1) {
      //     newKeyword = [word[i], word[i].slice(0, word[i].length - 1)]
      //     break;
      //   }
      // }
      // newKeyword = newKeyword[0]

      console.log("🚀 ~ file: elasticSearchController.js ~ line 189 ~ module.exports.serachSeller= ~ newKeyword", newKeyword)

      reqQuery.searchProductsBy = {
        city: cities,
        state: states,
        country: countries,
        product: newKeyword,
      }

      /************** SELLERS SEARCH RESULTS ************/
      let result = await sellerSearch(reqQuery);
      let countryCount = {}
      if (reqQuery._country) {
        console.log("🚀 ~ file: elasticSearchController.js ~ line 229 ~ module.exports.serachSeller= ~ reqQuery._country", reqQuery._country, reqQuery.country)
        countryCount = await getCountByCountry(result.query)
        countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
        reqQuery.country = reqQuery._country
        result = await sellerSearch(reqQuery);
      } else if(cities.name || states.name || countries.name) {
        countryCount = await getCountByCountry(result.query)
        countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
        reqQuery.country = reqQuery._country
      }
      console.log("🚀 ~ file: elasticSearchController.js ~ line 231 ~ module.exports.serachSeller= ~ countryCount", countryCount)
      console.log("🚀 ~ file: elasticSearchController.js ~ line 228 ~ module.exports.serachSeller= ~ countryCount", countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"])

      query = result.query
      console.log("🚀 ~ file: elasticSearchController.js ~ line 192 ~ module.exports.serachSeller= ~ query", query)
      let { aggs, catId } = result;
      const seller = await searchFromElastic(query, range, aggs);

      cities.name ? newKeyword.push(cities.name) : ""
      states.name ? newKeyword.push(states.name) : ""
      countries.name ? newKeyword.push(countries.name) : ""
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
        state: states,
        country: countries,
        productSearchKeyword: newKeyword,
        countryCount: !countryCount.length ? seller[2]["result"]["buckets"] : countryCount
      };

      return respSuccess(res, resp);
    }


    const range = {
      skip: parseInt(reqQuery.skip),
      limit: parseInt(reqQuery.limit),
    };
    console.log("🚀 ~ file: elasticSearchController.js ~ line 239 ~ module.exports.serachSeller= ~ range", range)
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

    let result, seller
    // const { productId, primaryId, level5Id, skip, limit } = reqQuery
    if (level5Id) {

      result = await sellerSearch({ level5Id, skip, limit });
      let countryCount = {}
      if (reqQuery._country) {
        countryCount = await getCountByCountry(result.query)
        countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
        country = reqQuery._country
        result = await sellerSearch({ level5Id, country, skip, limit });
      }
      const { query, catId, aggs } = result;
      seller = await searchFromElastic(query, range, aggs);
      console.log("module.exports.serachSeller -> seller", seller)

      if (seller && seller.length && !seller[0].length) {
        result = await sellerSearch({ productId, skip, limit });
        if (reqQuery._country) {
          countryCount = await getCountByCountry(result.query)
          countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
          country = reqQuery._country
          result = await sellerSearch({ productId, country, skip, limit });
        }
        const { query, catId, aggs } = result;
        seller = await searchFromElastic(query, range, aggs);
        console.log("module.exports.serachSeller -> seller", seller)
      }

      if (seller && seller.length && !seller[0].length) {
        result = await sellerSearch({ primaryId, skip, limit });
        if (reqQuery._country) {
          countryCount = await getCountByCountry(result.query)
          countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
          country = reqQuery._country
          result = await sellerSearch({ primaryId, country, skip, limit });
        }
        const { query, catId, aggs } = result;
        seller = await searchFromElastic(query, range, aggs);
        console.log("module.exports.serachSeller -> seller", seller)
      }


      const resp = {
        total: seller[2]["products"]["value"], //seller[1],
        data: seller[0],
        city,
        countryCount: !countryCount.length ? seller[2]["result"]["buckets"] : countryCount
        // relatedCat,
      };
      return respSuccess(res, resp);

    }

    if (secondaryId) {
      console.log("🚀 ~ file: elasticSearchController.js ~ line 286 ~ module.exports.serachSeller= ~ secondaryId", secondaryId)

      result = await sellerSearch({ secondaryId, skip, limit });
      let countryCount = {}
      if (reqQuery._country) {
        countryCount = await getCountByCountry(result.query)
        countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
        country = reqQuery._country
        result = await sellerSearch({ secondaryId, country, skip, limit });
      }
      const { query, catId, aggs } = result;
      seller = await searchFromElastic(query, range, aggs);
      console.log("module.exports.serachSeller -> seller", seller)

      if (seller && seller.length && !seller[0].length) {
        result = await sellerSearch({ primaryId, skip, limit });
        if (reqQuery._country) {
          countryCount = await getCountByCountry(result.query)
          countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
          country = reqQuery._country
          result = await sellerSearch({ primaryId, country, skip, limit });
        }
        const { query, catId, aggs } = result;
        seller = await searchFromElastic(query, range, aggs);
        console.log("module.exports.serachSeller -> seller", seller)
      }

      if (seller && seller.length && !seller[0].length) {
        result = await sellerSearch({ parentId, skip, limit });
        if (reqQuery._country) {
          countryCount = await getCountByCountry(result.query)
          countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
          country = reqQuery._country
          result = await sellerSearch({ parentId, country, skip, limit });
        }
        const { query, catId, aggs } = result;
        seller = await searchFromElastic(query, range, aggs);
        console.log("module.exports.serachSeller -> seller", seller)
      }


      const resp = {
        total: seller[2]["products"]["value"], //seller[1],
        data: seller[0],
        city,
        countryCount: !countryCount.length ? seller[2]["result"]["buckets"] : countryCount
        // relatedCat,
      };
      return respSuccess(res, resp);

    }

    result = await sellerSearch(reqQuery);
    let countryCount = {}
    if (reqQuery._country) {
      countryCount = await getCountByCountry(result.query)
      countryCount = countryCount && countryCount.length && countryCount[0]["result"] && countryCount[0]["result"]["buckets"] || []
      reqQuery.country = reqQuery._country
      result = await sellerSearch(reqQuery);
    }
    const { query, catId, aggs } = result;

    seller = await searchFromElastic(query, range, aggs);
    // console.log("module.exports.serachSeller -> seller", seller)

    // const relatedCat = await getRelatedPrimaryCategory(primaryCatId);
    const resp = {
      total: seller[2]["products"]["value"], //seller[1],
      data: seller[0],
      city,
      countryCount: !countryCount.length ? seller[2]["result"]["buckets"] : countryCount
      // relatedCat,
    };
    return respSuccess(res, resp);
  } catch (error) { }
};

module.exports.searchSuggestion = async (req, res) => {
  try {
    const reqQuery = camelcaseKeys(req.query)

    const { skip, limit, search, product, group, sellerId, productId } = reqQuery

    if (productId && productId !== '' && productId !== 'undefined') {
      const query = {
        "bool": {
          "must": {
            "match": {
              "id": productId
            }
          }
        }
      }
      const aggs = {
        "aggs": {
          "products": {
            "cardinality": {
              "field": "name.keyword"
            }
          }
        }
      }
      let suggestions = await getSuggestions(query, { skip, limit }, product, aggs)
      // console.log("module.exports.searchSuggestion -> suggestions", suggestions[0][suggestions[0].length - 1])
      return respSuccess(res, suggestions[0], suggestions[1]["products"])
    } else if (sellerId && sellerId !== '' && sellerId !== 'undefined') {
      const result = await sellerSearch({ elastic: true, id: sellerId });
      const { query, catId } = result;
      const aggs = {
        "aggs": {
          "products": {
            "cardinality": {
              "field": "name.keyword"
            }
          }
        }
      }
      const sellers = await searchFromElastic(query, { skip: 0, limit: 1000 }, aggs);
      let _sellers = sellers && sellers.length && sellers[0].length && sellers[0].map(elem => ({ _id: elem._id, ...elem._source }))
      const suggestions = []
      _sellers.forEach(elem => {
        if (elem.productSubcategoryId && elem.productSubcategoryId.length) {
          suggestions.push(...elem.productSubcategoryId.map(item => ({ _source: { ...item, search: "level5" } })))
        } else if (elem.poductId && elem.poductId.length) {
          suggestions.push(...elem.poductId.map(item => ({
            _source: { ...item, search: "level4" },
            _index: 'trade-live.mastercollections',
            _type: '_doc',
            _id: item.id,
          })))
        } else if (elem.secondaryCategoryId && elem.secondaryCategoryId.length) {
          suggestions.push(...elem.secondaryCategoryId.map(item => ({
            _source: { ...item, search: "level3" },
            _index: 'trade-live.mastercollections',
            _type: '_doc',
            _id: item.id,
          })))
        } else if (elem.primaryCategoryId && elem.primaryCategoryId.length) {
          suggestions.push(...elem.primaryCategoryId.map(item => ({
            _source: { ...item, search: "level2" },
            _index: 'trade-live.mastercollections',
            _type: '_doc',
            _id: item.id,
          })))
        } else if (elem.parentCategoryId && elem.parentCategoryId.length) {
          suggestions.push(...elem.parentCategoryId.map(item => ({
            _source: { ...item, search: "level1" },
            _index: 'trade-live.mastercollections',
            _type: '_doc',
            _id: item.id,
          })))
        }
      })
      // console.log("🚀 ~ file: elasticSearchController.js ~ line 177 ~ module.exports.searchSuggestion= ~ suggestions", sellers)
      return respSuccess(res, suggestions, sellers[1]["products"])
    } else {
      let query = {
        bool: {
          should: [],
          must: [],
          must_not: [],
          filter: []
        },
      };
      const others = []; // group - 1
      const farmer = ["3"]; // group - 2
      const service = ["35", "37", "40", "41", "42", "43", "44", "48", "56"]; // group - 3
      query.bool.must.unshift({ "bool": { "should": [] } })
      if (group === '2') {
        for (let i = 0; i < farmer.length; i++) {
          const _farmer = farmer[i]
          const categoryMatch = {
            "match": {
              "l1": _farmer,
            }
          };
          query.bool.must[0]["bool"]["should"].push(categoryMatch)
        }

      } else if (group === '3') {

        for (let i = 0; i < service.length; i++) {
          const _service = service[i]
          const categoryMatch = {
            "match": {
              "l1": _service,
            }
          };
          query.bool.must[0]["bool"]["should"].push(categoryMatch)
        }
      } else {

      }

      if (search !== 'undefined' && search) {
        const searchQuery = {
          "match_phrase_prefix": {
            "name": search.toLowerCase()
          }
          // "wildcard": {
          //   "name": {
          //     "value": search + "*",
          //     "boost": 1.0,
          //     "rewrite": "constant_score"
          //   }
          // }
        }
        query.bool.must.push(searchQuery)

        const aggs = {
          "aggs": {
            "products": {
              "cardinality": {
                "field": "name.keyword"
              }
            }
          }
        }
        // console.log(JSON.stringify(query), ' --------------------')
        // console.log(JSON.stringify(aggs), ' -------------------- aggr')
        let suggestions = await getSuggestions(query, { skip, limit }, product, aggs)
        // console.log("module.exports.searchSuggestion -> suggestions", suggestions[0][suggestions[0].length - 1])
        return respSuccess(res, suggestions[0], suggestions[1]["products"])
      } else {
        const searchQuery = {
          // "query": {
          // "bool": {
          //   "must": {
          "match_all": {}
          //   }
          // }
          // }
        }
        query.bool.must.push(searchQuery)
        const aggs = {
          "aggs": {
            "products": {
              "cardinality": {
                "field": "name.keyword"
              }
            }
          }
        }
        // console.log(JSON.stringify(query), ' -------------------- else')
        let suggestions = await getSuggestions(query, { skip, limit }, null, aggs)
        // console.log("module.exports.searchSuggestion -> suggestions", suggestions)

        return respSuccess(res, suggestions[0], suggestions[1]["products"])
      }
    }


  } catch (error) {
    console.log(error)
    respError(res, error.message)
  }
}
