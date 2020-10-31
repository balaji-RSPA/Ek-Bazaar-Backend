/* eslint-disable no-useless-escape */

exports.validateEmail = (str) => {

  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,9})+$/
  const cond = regex.test(str)
  return cond ? str : ''

}

exports.validatePhone = (num) => {

  const regex = /^\d{10}$/
  const cond = regex.test(num)
  return cond ? num : ''

}
