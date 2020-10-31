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
