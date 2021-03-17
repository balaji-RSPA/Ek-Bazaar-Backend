const axios = require('axios')
const { baseURL} = require("../utils/helper").globalVaraibles;
const { trade, tender, investment } = baseURL()

// const baseURL = _IS_PROD_ ? 'https://auth.ekbazaar.com/simplesso/' :
// _IS_DEV_ ? 'https://auth.tech-active.com/simplesso/' :
// 'http://localhost:3010/simplesso/'

axios.defaults.withCredentials = true;
const request = axios.create({
  withCredentials: true,
  baseURL: config.data && config.data.origin === "trade" ? trade : config.data && config.data.origin === "tender" ? tender : investment
})

request.interceptors.request.use(async (config) => {
  console.log("🚀 ~ file: request.js ~ line 15 ~ request.interceptors.request.use ~ config", config)
  // config.headers.origin = serviceURL
  return config
}, Promise.reject)

request.interceptors.response.use(
  (response) => {
    console.log("🚀 ~ file: request.js ~ line 25 ~ response", response.headers)
    return response
  },
  (err) => {
    //   console.log("🚀 ~ file: request.js ~ line 33 ~ err", err)  
    return Promise.reject
  },
)

module.exports = { request }