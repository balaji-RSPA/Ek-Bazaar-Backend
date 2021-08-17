// if (keyword) {
  //   const { searchProductsBy } = reqQuery
  //   console.log("🚀 ~ file: elasticSearchModule.js ~ line 139 ~ exports.sellerSearch= ~ searchProductsBy", searchProductsBy)
  //   const keywordMatch = []
  //   const productMatch = []
  //   // if (searchProductsBy.serviceType && searchProductsBy.city) {
  //   //   keywordMatch.push({
  //   //     "match": {
  //   //       "sellerProductId.serviceType._id": searchProductsBy.serviceType.id,
  //   //     }
  //   //   })
  //   // }

  //   if (searchProductsBy.serviceType) {
  //     if (Array.isArray(searchProductsBy.serviceType)) {
  //       searchProductsBy.serviceType.forEach(type => (
  //         productMatch.push({
  //           "match": {
  //             "sellerProductId.serviceType._id": type.id
  //           },
  //         })
  //       ))
  //     } else {
  //       keywordMatch.push({
  //         "match": {
  //           "sellerProductId.serviceType._id": searchProductsBy.serviceType.id
  //         },
  //       })
  //     }
  //   }
  //   if (searchProductsBy.city) {
  //     keywordMatch.push({
  //       "match": {
  //         "sellerProductId.serviceCity.city._id": searchProductsBy.city.id,
  //       }
  //     })
  //   }
  //   if (searchProductsBy.state) {
  //     keywordMatch.push({
  //       match: {
  //         "sellerProductId.serviceCity.state._id": searchProductsBy.state.id,
  //       }
  //     })
  //   }
  //   if (searchProductsBy.product) {

  //     /** level 5 **/
  //     productMatch.push({
  //       "match_phrase": {
  //         "sellerProductId.productSubcategoryId.name": searchProductsBy.product,
  //       }
  //     })

  //     /** level 4 **/
  //     productMatch.push({
  //       "match_phrase": {
  //         "sellerProductId.poductId.name": searchProductsBy.product,
  //       }
  //     })

  //     /** level 3 **/
  //     productMatch.push({
  //       "match_phrase": {
  //         "sellerProductId.secondaryCategoryId.name": searchProductsBy.product
  //       }
  //     })

  //     /** level 2 **/
  //     productMatch.push({
  //       "match_phrase": {
  //         "sellerProductId.primaryCategoryId.name": searchProductsBy.product
  //       }
  //     })

  //     /** name */
  //     productMatch.push({
  //       "match": {
  //         "name": {
  //           "query": searchProductsBy.product,
  //           "minimum_should_match": "10%"
  //         }
  //       }
  //     })

  //     // const {product} = searchProductsBy
  //     // if(Array.isArray(product)) {
  //     //   for(let i=0; i<product.length; i++) {
  //     //     const prdct = product[i]
  //     //     const searchSellers = {
  //     //       "match": {
  //     //             "name": {
  //     //               "query": prdct,
  //     //               "minimum_should_match": "10%"
  //     //             }
  //     //           }
  //     //     }
  //     //     query.bool.must.push(searchSellers)
  //     //   }
  //     // }

  //   }
  //   console.log("🚀 ~ file: elasticSearchModule.js ~ line 216 ~ exports.sellerSearch= ~ productMatch", productMatch)
  //   console.log("🚀 ~ file: elasticSearchModule.js ~ line 226 ~ exports.sellerSearch= ~ keywordMatch", keywordMatch)

  //   query.bool.should = productMatch
  //   query.bool["minimum_should_match"] = 1
  //   query.bool.must = keywordMatch

  //   // query.bool.filter.push({
  //   //   "bool": {
  //   //     "should": productMatch
  //   //   }
  //   // })
  // }