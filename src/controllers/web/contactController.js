const axios = require('axios');
const {
  respSuccess,
  respError
} = require("../../utils/respHadler");

/**
 * Insert contact us enquires
 */
module.exports.addContact = async (req, res) => {
  try {
  let result
  let url
  if (process.env.NODE_ENV === 'staging'){
   url = `http://localhost:8060/api/v1/`
  }
  if(process.env.NODE_ENV === 'development'){
    url = `https: //api.ekbazaar.com/api/v1/`
  }
  if(process.env.NODE_ENV === 'production'){
     url = `https: //elastic.tech-active.com:8443/api/v1/`
  }
  let response = await axios.post(`${url}contact`, req.body)
  if(response.data.success === false){
    throw new Error(response.data.message)
  }else{
    result = response && response.data && response.data.data;
  }
   respSuccess(res, result, "Your request has been successfully submitted")
  } catch (error) {
    respError(res, error.message);
  }
};