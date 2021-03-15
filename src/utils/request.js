const axios = require('axios')
const {_IS_PROD_, _IS_DEV_, authServiceURL} = require("./utils").globalVaraibles
const {serviceURL} = authServiceURL()

const baseURL = _IS_PROD_ ? 'https://auth.ekbazaar.com/simplesso/' :
_IS_DEV_ ? 'https://auth.tech-active.com/simplesso/' :
'http://localhost:3010/simplesso/'

axios.defaults.withCredentials = true;
const request = axios.create({
    withCredentials: true,
    baseURL
})

request.interceptors.request.use(async (config) => {
    console.log("🚀 ~ file: request.js ~ line 15 ~ request.interceptors.request.use ~ config", config)
    config.headers.origin = serviceURL
    return config
  }, Promise.reject)
  
  request.interceptors.response.use(
    (response) => {
        console.log("🚀 ~ file: request.js ~ line 25 ~ response", response.headers)
      return response.data
    },
    (err) => {
    //   console.log("🚀 ~ file: request.js ~ line 33 ~ err", err)  
      return Promise.reject
    },
  )
  
  module.exports = {request}