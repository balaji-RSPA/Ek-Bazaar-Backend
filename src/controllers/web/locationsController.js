<<<<<<< HEAD
const { location } = require("../../modules");
const {
  getAllCities,
  getAllStates,
  getAllCountries,
  addState,
  addCountry,
} = location;

module.exports.getAllCities = async (req, res) => {
  try {
    const cities = await getAllCities();
    console.log(cities, "cities-------");
    res.send(cities);
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.getAllStates = async (req, res) => {
  try {
    const states = await getAllStates();
    console.log(states, "states-------");
    res.send(states);
  } catch (error) {
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
    console.log(countries, "countries......");
    res.send(countries);
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.createCountry = async (req, res) => {
  try {
    const countries = await addCountry({
      name: "India",
      status: true,
    });
    console.log(countries, "countries......");
    res.send(countries);
  } catch (error) {
    res.send(error.message);
  }
};
=======
const camelcaseKeys = require('camelcase-keys');
const { location } = require('../../modules')
const { respSuccess, respError } = require('../../utils/respHadler');

const {
    getAllStates,
    getAllCountries,
    addState,
    addCountry,
    addCity,
    getAllCities
} = location

module.exports.getAllStates = async (req, res) => {

    try {

        const states = await getAllStates()
        respSuccess(res, states)
        
    } catch (error) {

        respError(error.message)
        
    }
}

module.exports.createState = async(req, res) => {
    try {

        const reqData = req.body
        const data = await addState(reqData)
        respSuccess(res, data)

    } catch(error) {

        respError(error.message)

    }
}

module.exports.getAllCountries = async(req, res) => {
    try{
        const countries = await getAllCountries()
        respSuccess(res, countries)
    } catch(error) {
        respError(error.message)
    }
}

module.exports.createCountry = async(req, res) => {
    try{
        const reqData = req.body
        const countries = await addCountry(reqData)
        respSuccess(res, countries)
    } catch(error) {
        respError(error.message)
    }
}

module.exports.createCity = async(req, res) => {
    try{
        const reqData = req.body
        const countries = await addCity(reqData)
        respSuccess(res, countries)
    } catch(error) {
        respError(error.message)
    }
}

module.exports.getAllCities = async(req, res) => {
    try{
        const reqQuery = camelcaseKeys(req.query)
        const cities = await getAllCities(reqQuery)
        respSuccess(res, cities)
    } catch(error) {
        respError(error.message)
    }
}
>>>>>>> ramesh
