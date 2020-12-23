const { location } = require("../../modules");
const { respSuccess, respError } = require("../../utils/respHadler");
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
  updateState
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


module.exports.uploadNewCities = async (req, res) => {
  try {
    // console.log(req.body, 'new cities--------')
    const data = req.body
    if(data){

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const query = {
          name: element.City
        }
        const result = await getCity(query)
        // console.log("🚀 ~ file: locationsController.js ~ line 83 ~ module.exports.uploadNewCities= ~ result", result)
        if(result){
          const stateRes = await checkState({name: element.State})
          // console.log("🚀 ~ file: locationsController.js ~ line 86 ~ module.exports.uploadNewCities= ~ stateRes", stateRes)
          if(stateRes){
            const uploadData = {
              country: '5e312f978acbee60ab54de08',
              state: stateRes._id || null,
              name: element.City
            }
            const newCity = await updateCity({_id: result._id}, uploadData)
            console.log(index+ '---'+element.City,' new City-----------')
          }

        }else{
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
    const result = await getAllStates({skip: 0, limit: 200})
    if(result){

       for (let index = 0; index < result.length; index++) {
          const element = result[index];
          if(!element.country){
            const uda = {
              name: element.name,
              country: '5e312f978acbee60ab54de08',
            }
            const sss = await updateState({_id: element._id}, uda)
            console.log("updateCountry= ~ result", sss)
          }
       }
       console.log('Completed------------------')
    }
  } catch (error) {
    res.send(error.message);
  }
};
