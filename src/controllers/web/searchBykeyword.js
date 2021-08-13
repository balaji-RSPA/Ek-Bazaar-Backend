if (reqQuery.keyword) {
    const { keyword, skip, limit } = reqQuery

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

    let cities = await getAllCities({});
    cities = cities.map((city) => ({ name: city.name, id: city._id, state: city.state }));
    let states = await getAllStates();
    states = states.map((state) => ({ name: state.name, id: state._id }));
    // console.log("🚀 ~ file: elasticSearchController.js ~ line 54 ~ serviceTypes=serviceTypes.map ~ serviceTypes", serviceTypes)
    // console.log("🚀 ~ file: elasticSearchController.js ~ line 59 ~ module.exports.serachSeller= ~ cities", cities)
    // console.log("🚀 ~ file: elasticSearchController.js ~ line 69 ~ module.exports.serachSeller= ~ states", states)


    for (let i = 0; i < newKeyword.length; i++) {
      let _keyword = newKeyword[i]

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

    newKeyword = newKeyword.join(" ");

    // let productSearchKeyword = newKeyword
    let productSearchKeyword = newKeyword.replace(city.name, "")
    productSearchKeyword = productSearchKeyword.replace(state.name, "")
    productSearchKeyword = !serviceType.length && serviceType.name ? productSearchKeyword.replace(serviceType.name, "") : productSearchKeyword
    productSearchKeyword = productSearchKeyword.replace(" In ", " ")
    // productSearchKeyword = productSearchKeyword.split(" ")

    reqQuery.searchProductsBy = {
      serviceType,
      city,
      state,
      product: productSearchKeyword
    }
    
    const result = await sellerSearch(reqQuery);
    const { query, catId } = result;
    const seller = await searchFromElastic(query, range);
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