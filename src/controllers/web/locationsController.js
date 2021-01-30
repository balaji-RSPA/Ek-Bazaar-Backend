const camelcaseKeys = require("camelcase-keys");
const { location } = require("../../modules");
const { respSuccess, respError } = require("../../utils/respHadler");
const _ = require('lodash')
const {
  getAllCities,
  getAllStates,
  getAllCountries,
  addState,
  addCountry,
  checkAndAddCity,
  getCity,
  checkState,
  addCity,
  updateCity,
  updateState,
  statesBulkInsert,
  citiesBulkInsert,
  countiesBulkInsert,
  getAllCitiesUpdate
} = location;

module.exports.getAllCities = async (req, res) => {
  try {
    const reqQuery = camelcaseKeys(req.query)
    console.log("module.exports.getAllCities -> req.query", reqQuery)
    const cities = await getAllCities(req.query);
    respSuccess(res, cities);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.getAllStates = async (req, res) => {
  try {
    const states = await getAllStates();
    respSuccess(res, states);
  } catch (error) {
    respError(res, error.message);
  }
};

module.exports.statesBulkInsert = async (req, res) => {
  try {
    const reqData = req.body
    // console.log("🚀 ~ file: locationsController.js ~ line 39 ~ module.exports.statesBulkInsert= ~ reqData", reqData)
    const states = await statesBulkInsert(reqData);
    respSuccess(res, states);
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.citiesBulkInsert = async (req, res) => {
  try {
    const data = req.body
    const bulkData = []
    const data1 = _.uniqBy(data, 'name')
    if (data1.length) {
      for (let index = 0; index < data.length; index++) {
        const city = data1[index];
        if (city) {

          const qie = { name: city.state }
          const result = await checkState(qie)
          console.log("🚀 ~ file: locationsController.js ~ line 59 ~ module.exports.citiesBulkInsert= ~ qie", qie)
          if (result) {
            const cityData = {
              name: city.name,
              state: result && result._id || null,
              country: '5e312f978acbee60ab54de08'
            }
            bulkData.push(cityData)
          }
        }

      }
    }
    // console.log("🚀 ~ file: locationsController.js ~ line 39 ~ module.exports.statesBulkInsert= ~ reqData", reqData)
    const cities = await citiesBulkInsert(bulkData);
    respSuccess(res, cities);
  } catch (error) {
    console.log(error, ' werwerwr')
    res.send(error.message);
  }
};

module.exports.createState = async (req, res) => {
  try {
    const data = await addState({
      name: "Uttar Pradesh",
      status: true,
    });
    res.send(data);
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.getAllCountries = async (req, res) => {
  try {
    const countries = await getAllCountries();
    respSuccess(res, countries);
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.createCountry = async (req, res) => {
  // try {
  //   // const countries = await addCountry({
  //   //   name: "India",
  //   //   status: true,
  //   // });
  //   const data = req.body
  //   if (data.length)
  //     const result = await countiesBulkInsert(data)
  //   res.send(result);
  // } catch (error) {
  //   res.send(error.message);
  // }
};


module.exports.uploadNewCities = async (req, res) => {
  try {
    // console.log(req.body, 'new cities--------')
    const data = req.body
    if (data) {

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const query = {
          name: element.City
        }
        const result = await getCity(query)
        // console.log("🚀 ~ file: locationsController.js ~ line 83 ~ module.exports.uploadNewCities= ~ result", result)
        if (!result) {
          const stateRes = await checkState({ name: element.State })
          // console.log("🚀 ~ file: locationsController.js ~ line 86 ~ module.exports.uploadNewCities= ~ stateRes", stateRes)
          if (stateRes) {
            const uploadData = {
              country: '5e312f978acbee60ab54de08',
              state: stateRes._id || null,
              name: element.City,
              alias: [element.City.toLowerCase()]
            }
            console.log(uploadData, ' data----------------')
            // const newCity = await updateCity({ _id: result._id }, uploadData)
            const newCity = await addCity(uploadData)
            console.log(index + '---' + element.City, ' new City-----------')
          } else {
            console.log('--------- NO state -------------')
          }

        } else {
          console.log(result && result.name, ' exist ******')
        }

      }

    }
    respSuccess(res, 'Uploaded successfully------');
  } catch (error) {
    // res.send(error.message);
  }
};

module.exports.updateCountry = async (req, res) => {
  try {
    // console.log('new country--------')
    const result = await getAllStates({ skip: 0, limit: 200 })
    if (result) {

      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        if (!element.country) {
          const uda = {
            name: element.name,
            country: '5e312f978acbee60ab54de08',
          }
          const sss = await updateState({ _id: element._id }, uda)
          console.log("updateCountry= ~ result", sss)
        }
      }
      console.log('Completed------------------')
    }
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.uploadCityAlias = async (req, res) => {

  try {

    // console.log(req.body, 'aliasss-----')
    const data = req.body
    if (data.length) {

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log(element.name)
        const query = {
          name: element.name
        }
        const result = await getCity(query)
        // console.log("🚀 ~ file: locationsController.js ~ line 199 ~ module.exports.uploadCityAlias= ~ result", result)

        if (result) {

          console.log('city exist-----')

          let alia = []
          alia.push(element.name.trim().toLowerCase())

          if (element.aliases) {
            const aliaArray = element.aliases.split(",").map((rec) => rec.trim().toLowerCase())
            alia.push(...aliaArray.map((rec) => rec))
          }

          const updateResult = await updateCity({ _id: result._id }, { alias: alia })
          console.log("updated alias ----------------  ", updateResult.name)

        } else {
          console.log('city not exist-----')
          const stateResult = await checkState({ name: element.state })
          if (stateResult) {
            let alia = []
            alia.push(element.name.trim().toLowerCase())
            if (element.aliases) {
              const aliaArray = element.aliases.split(",").map((rec) => rec.trim().toLowerCase())
              alia.push(...aliaArray.map((rec) => rec))
            }
            const addData = {
              name: element.name,
              state: stateResult._id,
              country: stateResult.country || null,
              alias: alia
            }
            console.log(addData, ' data------')
            const addCityResult = await addCity(addData)
            console.log("new city added : --  ", addCityResult.name)
            // console.log("tateResult", addData)
          } else {
            console.log(' city and state not exist === ', element.name + '---' + element.state)
          }

        }

      }

    }
    respSuccess(res, 'Uploaded successfully------');

  } catch (error) {

    console.log(error)
    res.send(error.message);

  }

}


module.exports.updateCityAlias = async (req, res) => {

  try {
    console.log('update cites functiona-----=-')
    const data = await getAllCitiesUpdate({ alias: null })
    if (data.length) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log("🚀 ~ file: locationsController.js ~ line 266 ~ module.exports.updateCityAlias= ~ element", element)
        let alia = []
        alia.push(element.name.trim().toLowerCase())
        console.log("data", element.name)
        const updateResult = await updateCity({ _id: element._id }, { alias: alia })
      }
    }
    console.log('Completed updateing')
    respSuccess(res, 'Uploaded successfully------');

  } catch (error) {

    console.log(error)
    res.send(error.message);


  }
}



