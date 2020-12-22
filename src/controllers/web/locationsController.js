const { location } = require("../../modules");
const { respSuccess, respError } = require("../../utils/respHadler");
const {
  getAllCities,
  getAllStates,
  getAllCountries,
  addState,
  addCountry,
} = location;

module.exports.getAllCities = async (req, res) => {
  try {
    // console.log(req.query)
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
