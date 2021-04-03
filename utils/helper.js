module.exports.respSuccess = (res, obj, message) => {

    let respData;

    if (typeof obj === 'object') {

        respData = {
            data: obj
        };

    } else {

        respData = {
            message: obj
        };

    }

    if (message) respData = { ...respData, message }

    const respObj = {
        success: true,
        ...respData
    };
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    res.status(200).json(respObj);
    res.end();

}

module.exports.respUnAuthorized = (res, msg) => {

    const respData = {
        success: false,
        auth: false,
        message: msg || 'Un-Authourized Access!'
    };
    res.status(401).json(respData);
    res.end();

}

module.exports.respAuthFailed = (res, data, msg) => {

    const respData = {
        success: false,
        auth: false,
        data: data,
        message: msg
    };
    res.status(200).json(respData);
    res.end();

}

module.exports.respError = (res, obj, message) => {

    let respData;

    if (typeof obj === 'object') {

        respData = {
            data: obj
        };

    } else {

        respData = {
            message: obj
        };

    }

    if (message) respData = { ...respData, message }

    const respObj = {
        success: false,
        ...respData
    };
    res.status(200).json(respObj);
    res.end();

}

exports.globalVaraibles = {
    _IS_PROD_: process.env.NODE_ENV === "production",
    _IS_DEV_: process.env.NODE_ENV === "staging",
    ssoLoginUrl: "login",
    ssoLogoutUrl: "logout",
    ssoRegisterUrl: "register",
    ssoServerJWTURL: "verifytoken",
    baseURL: function () {
        if (this._IS_PROD_) {
            return {
                trade: "https://tradeapi.ekbazaar.com/api/",
                tender: "https://api.ekbazaar.com/api/",
                investment: "https://investmentapi.ekbazaar.com/api/"
            }
        } else if (this._IS_DEV_) {
            return {
                trade: "https://tradebazaarapi.tech-active.com/api/",
                tender: "https://elastic.tech-active.com:8443/api/",
                investment: "https://investmentapi.tech-active.com/api/"
            }
        } else {
            return {
                trade: "http://localhost:8070/api/",
                tender: "http://localhost:8060/api/",
                investment: "http://localhost:8050/api/"
            }
        }
    },
    authServiceURL: function () {
        if (this._IS_PROD_) {
            return {
                _trade: "https://tradeapi.ekbazaar.com",
                _tender: "https://api.ekbazaar.com",
                _investment: "https://investmentapi.ekbazaar.com"
            }
        } else if (this._IS_DEV_) {
            return {
                _trade: "https://tradebazaarapi.tech-active.com",
                _tender: "https://elastic.tech-active.com:8443",
                _investment: "https://investmentapi.tech-active.com"
            }
        } else {
            return {
                _trade: "http://localhost:8070",
                _tender: "http://localhost:8060",
                _investment: "http://localhost:8050"
            }
        }
    }
}
