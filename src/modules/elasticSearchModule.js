const mongoose = require("mongoose");
const esClient = require("../../config/db").esClient;
const { INDEXNAME } = require("../utils/globalConstants");
const { Sellers } = require("../models");
const { getCatId, getSecCatId } = require('../modules/categoryModule')
// const { getCatId } = category

module.exports.addSellerBulkIndex = async () => {

  try {
    const data = await Sellers.count({ _id: { $gt: "5fe3fff61c9d614de3ab75bc", $lt: "5feba4a1b0b2eb5c558b72c5" } })//.skip(109711); // Getting total seller count
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 12 ~ module.exports.addSellerBulkIndex= ~ data", data)
    const limit = 400; // Limited for 1000
    const ratio = data / limit;
    let skip = 0;
    let cnt = 20000
    let successCounter = 0;
    let failureCounter = 0;
    console.log(ratio, "ratio");
    for (skip; skip <= data; skip += limit) {
      // making a batch 1000 records
      const foundDoc = await Sellers.find()
        .skip(skip)
        .sort({ _id: -1 })
        .limit(limit)
        // .populate("primaryCatId", "name venderId")
        .populate("location.state", "name region")
        .populate("location.country", "name")
        .populate("location.city", "name")
        .populate("sellerType.name", "name")
        // .populate("sellerType.cities.city", "name")
        // .populate("sellerType.cities.state", "name region")
        .populate({
          path: 'sellerProductId',
          model: 'sellerproducts',
          select: 'sellerId serviceType parentCategoryId primaryCategoryId secondaryCategoryId poductId productSubcategoryId serviceCity',
          populate: [
            {
              path: 'serviceType',
              model: 'sellerTypes',
              select: 'name ',
            },
            {
              path: 'parentCategoryId',
              model: 'level1',
              select: 'name'
            }, {
              path: 'primaryCategoryId',
              model: 'level2',
              select: 'name'
            }, {
              path: 'secondaryCategoryId',
              model: 'level3',
              select: 'name'
            }, {
              path: 'poductId',
              model: 'level4',
              select: 'name'
            },
            {
              path: 'productSubcategoryId',
              model: 'level5',
              select: 'name'
            },
            {
              path: 'serviceCity.city',
              model: 'cities',
              select: 'name'
            },
            {
              path: 'serviceCity.state',
              model: 'states',
              select: 'name'
            },
            {
              path: 'serviceCity.country',
              model: 'countries',
              select: 'name'
            },
          ]
        })
        .lean();

      try {
        cnt += limit
        console.log("bulk insert to elastic")
        await this.bulkStoreInElastic(foundDoc); // added to the ES
        successCounter++;
        console.log("first------", foundDoc[0]["name"], "last----------", foundDoc[foundDoc.length - 1]["name"])
      } catch (error) {
        console.log(error, "es index error");
        failureCounter++;
        console.log("first------", foundDoc[0]["name"], "last----------", foundDoc[foundDoc.length - 1]["name"])
      }
      // console.log("module.exports.addSellerBulkIndex -> const", foundDoc)
      // return foundDoc;
    }
    return Promise.resolve(/*'Successfully indexed'*/
      `Successfully indexed ${(successCounter - failureCounter) * limit
      } out of ${data} items`
    );
  } catch (error) {
    return Promise.reject(error);
  }

}

exports.bulkStoreInElastic = (foundDoc) =>
  new Promise((resolve, reject) => {
    const bulkBody = [];
    foundDoc.forEach((item) => {
      // Makes a structure to insert in ES

      const index = {
        index: {
          _index: INDEXNAME,
          _id: item._id,
        },
      };
      bulkBody.push(index);
      const docData = item;
      delete docData._id;
      bulkBody.push(docData);
    });

    esClient
      .bulk({
        body: bulkBody,
      })
      .then((response) => {
        // After insert

        let errorCount = 0;
        response.items.forEach((item) => {
          if (item.index && item.index.error) {
            // Checks for any error in insert

            ++errorCount;
            reject(new Error("err"));
          }
        });
        console.log(
          `Successfully indexed ${bulkBody.length - errorCount} out of ${bulkBody.length
          } items`
        );
        resolve("ok");
      })
      .catch(reject);
  });

exports.sellerSearch = async (reqQuery) => {

  const { offerSearch, cityId, productId, secondaryId, primaryId, parentId, keyword, serviceType, level5Id, search, searchProductsBy, elastic, cityFromKeyWord, stateFromKeyWord, countryFromKeyword, userId, country } = reqQuery
  console.log("🚀 ~ file: elasticSearchModule.js ~ line 154 ~ exports.sellerSearch= ~ reqQuery", reqQuery)
  let catId = ''
  let query = {
    bool: {
      should: [],
      must: [],
      must_not: [],
      filter: []
    },
  };
  let aggs = {

  }
  const function_score = {
    query: {
      bool: {
        should: []
      }
    },
    functions: []
  }

  if (country) {
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 177 ~ exports.sellerSearch= ~ country", country)
    if (Array.isArray(country)) {
      country.forEach(cntry => {
        let countryFilter = {
          "match": {
            "sellerId.location.country.name.keyword": cntry
          }
        }
        query.bool.should.push(countryFilter)
      })
      query.bool["minimum_should_match"] = 1
    } else {
      let countryFilter = {
        "match": {
          "sellerId.location.country.name.keyword": country
        }
      }
      query.bool.must.push(countryFilter)
    }
  }

  const sellerActiveAccount = {
    "bool": {
      "should": [
        {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "sellerId.deactivateAccount"
                }
              },
              {
                "term": {
                  "sellerId.deactivateAccount": false
                }
              }
            ]
          }
        },
        {
          "bool": {
            "must_not": {
              "exists": {
                "field": "sellerId.deactivateAccount"
              }
            }
          }
        }
      ]
    }
  }

  if (userId) {
    query.bool.must.push({
      "exists": {
        "field": "userId"
      }
    })
    query.bool.must_not.push({
      "term": {
        "userId.name.keyword": ""
      }
    })
  }

  if (cityFromKeyWord) {
    if (Array.isArray(cityFromKeyWord)) {
      cityFromKeyWord.forEach(city => {

        const searchCity = {
          "wildcard": {
            "alias.keyword": `*${city}*`
          }
        }

        query.bool.should.push(searchCity)
      })
    } else {
      const searchCity = {
        "wildcard": {
          "alias.keyword": `*${cityFromKeyWord}*`
        }
      }
      query.bool.must.push(searchCity)
    }
  }

  if (stateFromKeyWord) {
    if (Array.isArray(stateFromKeyWord)) {
      stateFromKeyWord.forEach(state => {

        const searchState = {
          "wildcard": {
            "name.keyword": `*${state}*`
          }
        }
        query.bool.should.push(searchState)
      })
    } else {
      const searchState = {
        "wildcard": {
          "name.keyword": `*${stateFromKeyWord}*`
        }
      }
      query.bool.must.push(searchState)
    }
  }

  if (countryFromKeyword) {
    if (Array.isArray(countryFromKeyword)) {
      countryFromKeyword.forEach(country => {

        const searchCountry = {
          "wildcard": {
            "name.keyword": `*${country}*`
          }
        }
        query.bool.should.push(searchCountry)
      })
    } else {
      const searchCountry = {
        "wildcard": {
          "name.keyword": `*${countryFromKeyword}*`
        }
      }
      query.bool.must.push(searchCountry)
    }
  }

  if (keyword) {
    const { product, city, state, country } = searchProductsBy
    if (product) {
      if (Array.isArray(product)) {

        // query.bool.must.unshift({ bool: { should: [] } });
        let prod = [product[0]]
        prod.forEach(p => {

          const searchKey = {
            "match_phrase": {
              "keywords": p
            }
          }

          query.bool.must.push(searchKey)

        })

        aggs = {
          "collapse": {
            "field": "sellerId.name.keyword"
          },
          "aggs": {
            "products": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }/* ,
            "result": {
              "terms": {
                "field": "sellerId.location.country.name.keyword",
                "size": 200
              },
              "aggs": {
                "countryCount": {
                  "cardinality": {
                    "field": "sellerId.name.keyword"
                  }
                }
              }
            } */
          }
        }
      } else {
        const searchKey = {
          "match": {
            "keywords": product
          }
        }
        query.bool.must.push(searchKey)

        aggs = {
          "collapse": {
            "field": "sellerId.name.keyword"
          },
          "aggs": {
            "products": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        }
      }

      query.bool.must.push({
        "match": {
          "status": true
        }
      })
      query.bool.filter.push(sellerActiveAccount)
    }
    if (city && city.name) {

      let cityFilter = [
        {
          "match": {
            "sellerId.location.city.name": city.name
          }
        },
        {
          "match": {
            "serviceCity.city.name": city.name
          }
        }
      ]

      query.bool.should.push(...cityFilter)
      query.bool["minimum_should_match"] = 1

      let prod = product //[product[0]]
      prod.forEach(p => {

        const citySorting = [

          /********* onboarded searched city seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.city"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.city.name": city.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 10
          },
          /********* onboard searched city seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.city"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.city.name": city.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 15
          },

          /********* onboard searched city in service city seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.city.name": city.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 20
          },
          /********* onboard searched city in service city seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.city.name": city.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 25
          },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "sellerId.location.city.name": city.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 25
          // },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "serviceCity.city.name": city.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 30
          // }
        ]
        function_score.functions.push(...citySorting)
      })
    }
    if (state && state.name) {

      let stateFilter = [
        {
          "match": {
            "sellerId.location.state.name": state.name
          }
        },
        {
          "match": {
            "serviceCity.state.name": state.name
          }
        }
      ]

      query.bool.should.push(...stateFilter)
      query.bool["minimum_should_match"] = 1

      let prod = product //[product[0]]
      prod.forEach(p => {

        const stateSorting = [

          /********* onboarded searched state seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.state"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.state.name": state.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 10
          },
          /********* onboard searched state seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.state"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.state.name": state.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 15
          },

          /********* onboard searched state in service city seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.state.name": state.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 20
          },
          /********* onboard searched state in service city seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.state.name": state.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 25
          },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "sellerId.location.state.name": state.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 25
          // },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "serviceCity.state.name": state.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 30
          // }
        ]
        function_score.functions.push(...stateSorting)
      })

    }
    if (country && country.name) {

      let countryFilter = [
        {
          "match": {
            "sellerId.location.country.name": country.name
          }
        },
        {
          "match": {
            "serviceCity.country.name": country.name
          }
        }
      ]

      query.bool.should.push(...countryFilter)
      query.bool["minimum_should_match"] = 1

      let prod = product //[product[0]]
      prod.forEach(p => {

        const countrySorting = [

          /********* onboarded searched country seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.country"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.country.name": country.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 10
          },
          /********* onboard searched country seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "exists": {
                      "field": "sellerId.location.country"
                    }
                  },
                  {
                    "match": {
                      "sellerId.location.country.name": country.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 15
          },

          /********* onboard searched country in service city seller exact match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.country.name": country.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `${p}`
                    }
                  }
                ]
              }
            },
            "weight": 20
          },
          /********* onboard searched country in service city seller partial match ********/
          {
            "filter": {
              "bool": {
                "must": [
                  {
                    "exists": {
                      "field": "userId"
                    }
                  },
                  {
                    "match": {
                      "serviceCity.country.name": country.name
                    }
                  },
                  {
                    "wildcard": {
                      "keywords.keyword": `*${p}*`
                    }
                  }
                ]
              }
            },
            "weight": 25
          },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "sellerId.location.state.name": state.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 25
          // },
          // {
          //   "filter": {
          //     "bool": {
          //       "must": [
          //         {
          //           "match": {
          //             "serviceCity.state.name": state.name
          //           }
          //         }
          //       ]
          //     }
          //   },
          //   "weight": 30
          // }
        ]
        function_score.functions.push(...countrySorting)
      })

    }
  }

  if (elastic) {
    const seller = {
      "match": {
        "sellerId._id": reqQuery.id
      }
    }
    query.bool.must.push(seller)
  }

  if (search) {
    const suggestionQuery = {
      "term": {
        "name": {
          "query": search.toLowerCase(),
          // "minimum_should_match": "10%"
        }
      }
    }
    query.bool.should.push(suggestionQuery);
  }

  if (level5Id) {
    const level5Search = {
      match: {
        "productSubcategoryId._id": level5Id,
      },
    }
    query.bool.must.push(level5Search);
    query.bool.filter.push(sellerActiveAccount)
    if (reqQuery.findByEmail) {
      query.bool.must.push({
        "exists": {
          "field": "sellerId.email"
        }
      })
    }
    query.bool.must.push({
      "match": {
        "status": true
      }
    })
    aggs = {
      "collapse": {
        "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
      },
      "aggs": {
        "products": {
          "cardinality": {
            "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
          }
        }/* ,
        "result": {
          "terms": {
            "field": "sellerId.location.country.name.keyword",
            "size": 200
          },
          "aggs": {
            "countryCount": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        } */
      }
    }
  }

  if (productId) {
    console.log("🚀 ~ file: elasticSearchModule.js ~ line 320 ~ exports.sellerSearch= ~ productId", productId)
    // const categoryId = await getCatId({_id: productId }, '_id')
    // catId = categoryId
    const categoryMatch = {
      match: {
        "poductId._id": productId,
      },
    };

    query.bool.must.push(categoryMatch);
    query.bool.must.push({
      "match": {
        "status": true
      }
    })
    query.bool.filter.push(sellerActiveAccount)
    if (reqQuery.findByEmail) {
      query.bool.must.push({
        "exists": {
          "field": "sellerId.email"
        }
      })
    }
    aggs = {
      "collapse": {
        "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
      },
      "aggs": {
        "products": {
          "cardinality": {
            "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
          }
        }/* ,
        "result": {
          "terms": {
            "field": "sellerId.location.country.name.keyword",
            "size": 200
          },
          "aggs": {
            "countryCount": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        } */
      }
    }
  }

  if (serviceType) {
    if (Array.isArray(serviceType)) {
      query.bool.must.unshift({ bool: { should: [] } });
      for (let i = 0; i < serviceType.length; i++) {
        const service = serviceType[i]
        const categoryMatch = {
          "match": {
            "serviceType._id": service,
          }
        };
        query.bool.must[0].bool.should.push(categoryMatch);
      }
      aggs = {
        "collapse": {
          "field": "sellerId.name.keyword"
        },
        "aggs": {
          "products": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }/* ,
          "result": {
            "terms": {
              "field": "sellerId.location.country.name.keyword",
              "size": 200
            },
            "aggs": {
              "countryCount": {
                "cardinality": {
                  "field": "sellerId.name.keyword"
                }
              }
            }           
          } */
        }
      }
      
    } else {
      const categoryMatch = {
        "match": {
          "serviceType._id": serviceType,
        }
      };
      query.bool.must.push(categoryMatch);
      aggs = {
        "collapse": {
          "field": "sellerId.name.keyword"
        },
        "aggs": {
          "products": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }/* ,
          "result": {
            "terms": {
              "field": "sellerId.location.country.name.keyword",
              "size": 200
            },
            "aggs": {
              "countryCount": {
                "cardinality": {
                  "field": "sellerId.name.keyword"
                }
              }
            }           
          } */
        }
      }
    }
    query.bool.filter.push(sellerActiveAccount)
    if(!keyword) {
      aggs.aggs.result = {
        ...aggs.aggs.result,
        "aggs": {
          "countryCount": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }
        }
      }
    }
  }

  if (secondaryId) {
    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "secondaryCategoryId._id": secondaryId,
      },
    };
    query.bool.must.push(categoryMatch);
    query.bool.filter.push(sellerActiveAccount)
    if (reqQuery.findByEmail) {
      query.bool.must.push({
        "exists": {
          "field": "sellerId.email"
        }
      })
    }
    query.bool.must.push({
      "match": {
        "status": true
      }
    })
    aggs = {
      "collapse": {
        "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
      },
      "aggs": {
        "products": {
          "cardinality": {
            "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
          }
        }/* ,
        "result": {
          "terms": {
            "field": "sellerId.location.country.name.keyword",
            "size": 200
          },
          "aggs": {
            "countryCount": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        } */
      }
    }

  }

  if (primaryId) {
    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "primaryCategoryId._id": primaryId,
      },
    };
    query.bool.must.push(categoryMatch);
    query.bool.filter.push(sellerActiveAccount)
    if (reqQuery.findByEmail) {
      query.bool.must.push({
        "exists": {
          "field": "sellerId.email"
        }
      })
    }
    query.bool.must.push({
      "match": {
        "status": true
      }
    })
    aggs = {
      "collapse": {
        "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
      },
      "aggs": {
        "products": {
          "cardinality": {
            "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
          }
        }/* ,
        "result": {
          "terms": {
            "field": "sellerId.location.country.name.keyword",
            "size": 200
          },
          "aggs": {
            "countryCount": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        } */
      }
    }
  }

  if (parentId) {
    console.log("exports.sellerSearch -> parentId", parentId)

    // const categoryId = await getSecCatId({_id: secondaryId }, '_id')
    const categoryMatch = {
      term: {
        "parentCategoryId._id": parentId,
      },
    };
    query.bool.must.push({
      "match": {
        "status": true
      }
    })
    query.bool.must.push(categoryMatch);
    query.bool.filter.push(sellerActiveAccount)
    if (reqQuery.findByEmail) {
      query.bool.must.push({
        "exists": {
          "field": "sellerId.email"
        }
      })
    }
    aggs = {
      "collapse": {
        "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
      },
      "aggs": {
        "products": {
          "cardinality": {
            "field": reqQuery.findByEmail ? "sellerId.email.keyword" : "sellerId._id.keyword"
          }
        }/* ,
        "result": {
          "terms": {
            "field": "sellerId.location.country.name.keyword",
            "size": 200
          },
          "aggs": {
            "countryCount": {
              "cardinality": {
                "field": "sellerId.name.keyword"
              }
            }
          }
        } */
      }
    }
  }

  if (level5Id || productId || secondaryId || primaryId || parentId) {
    const sorting = [
      /********* onboarded india seller exact match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              },
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              },
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `${p}`
                }
              } */
            ]
          }
        },
        "weight": 10
      },
      /********* onboard india seller partial match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              },
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              },
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `*${p}*`
                }
              } */
            ]
          }
        },
        "weight": 15
      },

      /********* onboard foreign seller exact match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              },
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `${p}`
                }
              } */
            ],
            "must_not": [
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }
            ]
          }
        },
        "weight": 20
      },
      /********* onboard foreign seller partial match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              },
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `*${p}*`
                }
              } */
            ],
            "must_not": [
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }
            ]
          }
        },
        "weight": 25
      },

      /********* onboard no country seller exact match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `${p}`
                }
              } */
            ],
            "must_not": [
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              }
            ]
          }
        },
        "weight": 30
      },
      /********* onboard no country seller partial match ********/
      {
        "filter": {
          "bool": {
            "must": [
              {
                "exists": {
                  "field": "userId"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `*${p}*`
                }
              } */
            ],
            "must_not": [
              {
                "exists": {
                  "field": "sellerId.location.country"
                }
              }
            ]
          }
        },
        "weight": 40
      },

      /********* not onboard india seller exact match ********/
      {
        "filter": {
          "bool": {
            "must": [
              // {
              //   "exists": {
              //     "field": "sellerId.location.country"
              //   }
              // },
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `${p}`
                }
              } */
            ]
          }
        },
        "weight": 45
      },
      /********* not onboard india seller partial match ********/
      {
        "filter": {
          "bool": {
            "must": [
              // {
              //   "exists": {
              //     "field": "sellerId.location.country"
              //   }
              // },
              {
                "match": {
                  "sellerId.location.country.name": "india"
                }
              }/* ,
              {
                "wildcard": {
                  "keywords.keyword": `*${p}*`
                }
              } */
            ]
          }
        },
        "weight": 50
      },

      /********* not onboard foreign seller exact match ********/
      // {
      //   "filter": {
      //     "bool": {
      //       "must": [
      //         {
      //           "wildcard": {
      //             "keywords.keyword": `${p}`
      //           }
      //         }
      //       ],
      //       "must_not": [
      //         {
      //           "match": {
      //             "sellerId.location.country.name": "india"
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   "weight": 55
      // },
      // /********* not onboard foreign seller partial match ********/
      // {
      //   "filter": {
      //     "bool": {
      //       "must": [
      //         {
      //           "wildcard": {
      //             "keywords.keyword": `*${p}*`
      //           }
      //         }
      //       ],
      //       "must_not": [
      //         {
      //           "match": {
      //             "sellerId.location.country.name": "india"
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   "weight": 60
      // },

      /********* not onboard no country seller exact match ********/
      // {
      //   "filter": {
      //     "bool": {
      //       "must": [
      //         {
      //           "wildcard": {
      //             "keywords.keyword": `${p}`
      //           }
      //         }
      //       ],
      //       "must_not": [
      //         {
      //           "exists": {
      //             "field": "sellerId.location.country"
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   "weight": 65
      // },
      // /********* not onboard no country seller partial match ********/
      // {
      //   "filter": {
      //     "bool": {
      //       "must": [
      //         {
      //           "wildcard": {
      //             "keywords.keyword": `*${p}*`
      //           }
      //         }
      //       ],
      //       "must_not": [
      //         {
      //           "exists": {
      //             "field": "sellerId.location.country"
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   "weight": 70
      // }
    ]
    function_score.functions.push(...sorting)
  }

  if (cityId) {
    if (Array.isArray(cityId)) {
      query.bool.must.unshift({ bool: { should: [] } });
      cityId.forEach((c) => {
        const locationMatch = {
          term: {
            // "location.city._id": c,
            "serviceCity.city._id": c
          },
        };
        query.bool.must[0].bool.should.push(locationMatch);
      });
      aggs = {
        "collapse": {
          "field": "sellerId.name.keyword"
        },
        "aggs": {
          "products": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }/* ,
          "result": {
            "terms": {
              "field": "sellerId.location.country.name.keyword",
              "size": 200
            },
            "aggs": {
              "countryCount": {
                "cardinality": {
                  "field": "sellerId.name.keyword"
                }
              }
            }
          } */
        }
      }
    } else {
      const locationMatch = {
        term: {
          // "location.city._id": cityId,
          "serviceCity.city._id": cityId
        },
      };
      query.bool.must.push(locationMatch);

      aggs = {
        "collapse": {
          "field": "sellerId.name.keyword"
        },
        "aggs": {
          "products": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }/* ,
          "result": {
            "terms": {
              "field": "sellerId.location.country.name.keyword",
              "size": 200
            },
            "aggs": {
              "countryCount": {
                "cardinality": {
                  "field": "sellerId.name.keyword"
                }
              }
            }
          } */
        }
      }
    }
    query.bool.filter.push(sellerActiveAccount)
  }

  if (offerSearch) {

    query.bool.must.push({
      "exists": {
        "field": "offers"
      }
    })

  }

  function_score.query = query
  if (searchProductsBy && ((searchProductsBy.city && searchProductsBy.city.name) || (searchProductsBy.state && searchProductsBy.state.name) || (searchProductsBy.country && searchProductsBy.country.name))) {
  } else if (searchProductsBy && searchProductsBy.product && searchProductsBy.product.length) {
    let i = 10

    searchProductsBy.product.forEach(p => {

      const sorting = [
        /********* onboarded india seller exact match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                },
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `${p}`
                  }
                }
              ]
            }
          },
          "weight": 10
        },
        /********* onboard india seller partial match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                },
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `*${p}*`
                  }
                }
              ]
            }
          },
          "weight": 15
        },

        /********* onboard foreign seller exact match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `${p}`
                  }
                }
              ],
              "must_not": [
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                }
              ]
            }
          },
          "weight": 20
        },
        /********* onboard foreign seller partial match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `*${p}*`
                  }
                }
              ],
              "must_not": [
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                }
              ]
            }
          },
          "weight": 25
        },

        /********* onboard no country seller exact match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `${p}`
                  }
                }
              ],
              "must_not": [
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                }
              ]
            }
          },
          "weight": 30
        },
        /********* onboard no country seller partial match ********/
        {
          "filter": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "userId"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `*${p}*`
                  }
                }
              ],
              "must_not": [
                {
                  "exists": {
                    "field": "sellerId.location.country"
                  }
                }
              ]
            }
          },
          "weight": 40
        },

        /********* not onboard india seller exact match ********/
        {
          "filter": {
            "bool": {
              "must": [
                // {
                //   "exists": {
                //     "field": "sellerId.location.country"
                //   }
                // },
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `${p}`
                  }
                }
              ]
            }
          },
          "weight": 45
        },
        /********* not onboard india seller partial match ********/
        {
          "filter": {
            "bool": {
              "must": [
                // {
                //   "exists": {
                //     "field": "sellerId.location.country"
                //   }
                // },
                {
                  "match": {
                    "sellerId.location.country.name": "india"
                  }
                },
                {
                  "wildcard": {
                    "keywords.keyword": `*${p}*`
                  }
                }
              ]
            }
          },
          "weight": 50
        },

        /********* not onboard foreign seller exact match ********/
        // {
        //   "filter": {
        //     "bool": {
        //       "must": [
        //         {
        //           "wildcard": {
        //             "keywords.keyword": `${p}`
        //           }
        //         }
        //       ],
        //       "must_not": [
        //         {
        //           "match": {
        //             "sellerId.location.country.name": "india"
        //           }
        //         }
        //       ]
        //     }
        //   },
        //   "weight": 55
        // },
        // /********* not onboard foreign seller partial match ********/
        // {
        //   "filter": {
        //     "bool": {
        //       "must": [
        //         {
        //           "wildcard": {
        //             "keywords.keyword": `*${p}*`
        //           }
        //         }
        //       ],
        //       "must_not": [
        //         {
        //           "match": {
        //             "sellerId.location.country.name": "india"
        //           }
        //         }
        //       ]
        //     }
        //   },
        //   "weight": 60
        // },

        /********* not onboard no country seller exact match ********/
        // {
        //   "filter": {
        //     "bool": {
        //       "must": [
        //         {
        //           "wildcard": {
        //             "keywords.keyword": `${p}`
        //           }
        //         }
        //       ],
        //       "must_not": [
        //         {
        //           "exists": {
        //             "field": "sellerId.location.country"
        //           }
        //         }
        //       ]
        //     }
        //   },
        //   "weight": 65
        // },
        // /********* not onboard no country seller partial match ********/
        // {
        //   "filter": {
        //     "bool": {
        //       "must": [
        //         {
        //           "wildcard": {
        //             "keywords.keyword": `*${p}*`
        //           }
        //         }
        //       ],
        //       "must_not": [
        //         {
        //           "exists": {
        //             "field": "sellerId.location.country"
        //           }
        //         }
        //       ]
        //     }
        //   },
        //   "weight": 70
        // }
      ]
      function_score.functions.push(...sorting)
      console.log("🚀 ~ file: elasticSearchModule.js ~ line 1210 ~ exports.sellerSearch= ~  function_score.functions", function_score.functions)

    })
  }

  query = {
    function_score
  }
  return {
    query,
    aggs,
    catId
  }

}

exports.searchFromElastic = (query, range, aggs, sort) =>
  new Promise((resolve, reject) => {

    const { skip, limit } = range;
    aggs = aggs || {}
    const body = {
      size: limit || 10,
      from: skip || 0,
      query,
      ...aggs,
      sort: [
        // {
        //   "sellerId.planExpired": {
        //     "order": "desc"
        //   }
        // },
        // {
        //   "sellerId.paidSeller": {
        //     "order": "desc"
        //   }
        // },
        // {
        //   "userId._id.keyword": {
        //     "order": "desc"
        //   }
        // }
        {
          "_score": {
            "order": "desc"
          }
        }
      ]
    };

    const searchQuery = {
      index: INDEXNAME,
      body,
    };

    esClient
      .search(searchQuery)
      .then(async (results) => {
        const { count } = await this.getCounts(query); // To get exact count
        resolve([
          results.hits.hits,
          count,
          results.aggregations/*,
          // results.hits.total*/
        ]);
      })
      .catch(error => //{
        console.error(error)
        //reject(error)
        //}
      )
  })

exports.getCounts = (query) =>
  new Promise((resolve, reject) => {
    esClient
      .count({
        index: INDEXNAME,
        body: {
          query,
        },
      })
      .then(resolve)
      .catch(reject);
  });

exports.getCountByCountry = (query) => new Promise((resolve, reject) => {
  // console.log("🚀 ~ file: elasticSearchModule.js ~ line 2038 ~ exports.getCountByCountry= ~ query", query)

  //let filtered1 = query.function_score.query.bool.should.length && query.function_score.query.bool.should.filter(item => {
    //return item["match"]["sellerId.location.country.name"] || item["match"]["serviceCity.country.name"]
  //})

  //let filtered2 = query.function_score.query.bool.should.length && query.function_score.query.bool.should.filter(item => item["match"]["sellerId.location.state.name"] || item["match"]["serviceCity.state.name"])

  //let filtered3 = query.function_score.query.bool.should.length && query.function_score.query.bool.should.filter(item => item["match"]["sellerId.location.city.name"] || item["match"]["serviceCity.city.name"])

  //if (filtered1.length) {

    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["sellerId.location.country.name"]), 1)
    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["serviceCity.country.name"]), 1)

  //} else if (filtered2.length) {

    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["sellerId.location.state.name"]), 1)
    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["serviceCity.state.name"]), 1)

  //} else if (filtered3.length) {

    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["serviceCity.city.name"]), 1)
    //query.function_score.query.bool.should.splice(query.function_score.query.bool.should.findIndex(item => item["match"]["serviceCity.city.name"]), 1)

  //}

  //console.log("🚀 ~ file: elasticSearchModule.js ~ line 2038 ~ exports.getCountByCountry= ~ query", query.function_score.query/* .bool.should */)
  // if(!query.function_score.query.bool.should.length) delete  query.function_score.query.bool.should
  //console.log(query.function_score.query.bool)
  //console.log("🚀 ~ file: elasticSearchModule.js ~ line 2038 ~ exports.getCountByCountry= ~ query", query.function_score.query.bool.must)
  //console.log("🚀 ~ file: elasticSearchModule.js ~ line 2041 ~ exports.getCountByCountry= ~ filtered", filtered1, filtered2, filtered3)
  //query = query.function_score.query
  let aggs = {
    "collapse": {
      "field": "sellerId.name.keyword"
    },
    "aggs": {
      "products": {
        "cardinality": {
          "field": "sellerId.name.keyword"
        }
      },
      "result": {
        "terms": {
          "field": "sellerId.location.country.name.keyword",
          "size": 200
        },
        "aggs": {
          "countryCount": {
            "cardinality": {
              "field": "sellerId.name.keyword"
            }
          }
        }
      }
    }
  }
  const body = {
    size: 500,
    from: 0,
    query,
    ...aggs,

  };

  const searchQuery = {
    index: INDEXNAME,
    body,
  };

  esClient
    .search(searchQuery)
    .then(async (results) => {
      resolve([
        // results.hits.hits,
        results.aggregations
      ]);
    })
    .catch(error =>
      console.error(error.message)
    )
})

/*

  Update doc

*/

exports.updateESDoc = async (_id, doc) => new Promise((resolve, reject) => {
  const body = {
    doc,
  };
  let id = _id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    id = id.toString();
  }

  const newData = {
    index: INDEXNAME,
    id,
    body,
  };

  esClient.update(newData).then(resolve).catch(reject);
});

exports.getSuggestions = (query, range, product, aggs) => new Promise((resolve, reject) => {
  const { skip, limit } = range;
  // console.log("exports.getSuggestions -> limit", limit)
  aggs = aggs || {}
  let body = !product ? {
    size: limit || 20,
    from: skip || 0,
    query,
    ...aggs/* ,
    highlight, */
    // sort: { "_id": "desc" }
  } : {
    from: skip || 0,
    size: 10000,
    query,
    ...aggs
  };
  // console.log("exports.getSuggestions -> body", JSON.stringify(body))
  const searchQuery = {
    index: process.env.NODE_ENV === "production" ? "tradedb.suggestions" : "trade-live.suggestions",
    body,
  };
  esClient
    .search(searchQuery)
    .then(async (results) => {
      // const { count } = await this.getCounts(query); // To get exact count
      resolve([
        results.hits.hits,
        results.aggregations
        // count,
      ]);
    })
    .catch(error => reject(error))
})

exports.getAllCitiesElastic = (query) => new Promise((resolve, reject) => {
  const body = {
    query
  };
  const searchQuery = {
    index: process.env.NODE_ENV === "production" ? "tradedb.cities" : "trade-live.cities",
    body,
    from: 0,
    size: 500
  };
  esClient
    .search(searchQuery)
    .then(async (results) => {
      resolve([
        results.hits.hits,
      ]);
    })
    .catch(error => reject(error))
})

exports.getAllStatesElastic = (query) => new Promise((resolve, reject) => {
  const body = {
    query
  };
  const searchQuery = {
    index: process.env.NODE_ENV === "production" ? "tradedb.states" : "trade-live.states",
    body,
    from: 0,
    size: 500
  };
  esClient
    .search(searchQuery)
    .then(async (results) => {
      resolve([
        results.hits.hits,
      ]);
    })
    .catch(error => reject(error))
})

exports.getAllCountriesElastic = query => new Promise((resolve, reject) => {
  const body = {
    query
  }
  console.log("🚀 ~ file: elasticSearchModule.js ~ line 1794 ~ exports.getAllCountriesElastic=query=>newPromise ~ query", query)
  const searchQuery = {
    index: process.env.NODE_ENV === "production" ? "tradedb.countries" : "trade-live.countries",
    body,
    from: 0,
    size: 500
  };
  esClient
    .search(searchQuery)
    .then(async (results) => {
      resolve([
        results.hits.hits,
      ]);
    })
    .catch(error => reject(error))
})
