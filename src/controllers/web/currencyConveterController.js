const { respSuccess, respError } = require("../../utils/respHadler");
const { CurrencyConvrter } = require('../../modules');

const { findCurrencyConverter, addConverter, getAllCurrency, getAllCurrencyINR } = CurrencyConvrter


module.exports.getCurrencyConveter = async (req, res) => {
    try{
        const currencyConvter = await findCurrencyConverter();
        respSuccess(res, currencyConvter, "Currency Convter Fetch Success")
    }catch (error){
        console.log("The Error Part", error)
        respError(res, error.message);
    }
}

module.exports.addCurrencyConveter = async (req, res) => {
    try{
        const { currencyName, unitAmount } = req.body;
        const data = {
            currencyName,
            unitAmount
        }
        const convter = await addConverter(data);
        respSuccess(res, convter, "Currency Converter is added Successfully")
    }catch(error){
        console.log("The Error Part", error)
        respError(res, error.message);
    }
}

module.exports.getAllCurrency = async (req,res) => {
    try {
        let allCurrency = await getAllCurrency({})

        respSuccess(res, allCurrency, "All currency for Onebazzar")
    } catch (error) {
        console.log("The Error Part", error)
        respError(res, error.message);
    }
}

module.exports.getSingleCurrency = async (req, res) => {
    try {
        const { value } = req.query
        let singleUSDCurrency = await getAllCurrency({ code: value })
        let singleINRCurrency = await getAllCurrencyINR({ code: value })

        respSuccess(res, { "USD": singleUSDCurrency, "INR": singleINRCurrency }, "Currency Convter Fetch Success")
    } catch (error) {
        console.log("The Error Part", error)
        respError(res, error.message);
    }
}