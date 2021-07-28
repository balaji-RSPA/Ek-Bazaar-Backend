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
    const {skip,limit, search} = req.query
    const cities = await getAllCities({skip:parseInt(skip),limit:parseInt(limit), search});
    // console.log("🚀 ~ file: locationController.js ~ line 16 ~ module.exports.getCities= ~ cities", cities)
    respSuccess(res, cities);
  } catch (error) {
    respError(res, error.message);
  }
};

/**Get all states*/
module.exports.getStates = async (req, res) => {
  try {
    const {skip,limit} = req.query
    const states = await getAllStates(skip,limit);
    respSuccess(res, states);
  } catch (error) {
    respError(res, error.message);
  }
};

/**Get all countries*/
module.exports.getCountries = async (req, res) => {
  try {
    const {skip,limit} = req.query
    const countries = await getAllCountries(parseInt(skip),parseInt(500));
    respSuccess(res, countries);
  } catch (error) {
    respError(res, error.message);
  }
};