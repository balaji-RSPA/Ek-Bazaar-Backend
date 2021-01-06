const { respSuccess, respError } = require("../../utils/respHadler");
const { location } = require("../../modules");

const {
getAllCities,
getAllStates,
getAllCountries
} = location

/**Get all cities*/
module.exports.getCities = async (req, res) => {
  try {
    const cities = await getAllCities(req.body);
    respSuccess(res, cities);
  } catch (error) {
    respError(res, error.message);
  }
};

/**Get all states*/
module.exports.getStates = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const states = await getAllStates(skip,limit);
    respSuccess(res, states);
  } catch (error) {
    respError(res, error.message);
  }
};

/**Get all countries*/
module.exports.getCountries = async (req, res) => {
  try {
    const {skip,limit} = req.body
    const countries = await getAllCountries(skip,limit);
    respSuccess(res, countries);
  } catch (error) {
    respError(res, error.message);
  }
};