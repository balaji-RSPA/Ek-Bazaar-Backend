const uuidv4 = require("uuid/v4");
const Hashids = require("hashids");
const axios = require("axios");
const URL = require("url").URL;
const hashids = new Hashids();
const bcrypt = require("bcrypt");
const { genJwtToken } = require("./jwt_helper");
const { machineIdSync } = require("node-machine-id");
const { UserModel } = require("../config/db");
const { globalVaraibles, respError, respSuccess, respAuthFailed } = require("../utils/helper");
const { trade, tender, investment } = globalVaraibles.baseURL();
const { _trade, _tender, _investment } = globalVaraibles.authServiceURL();

const encodePassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const re = /(\S+)\s+(\S+)/;

// url to make request
let baseURL = "";

// Note: express http converts all headers
// to lower case.
const AUTH_HEADER = "authorization";
const BEARER_AUTH_SCHEME = "bearer";

function parseAuthHeader(hdrValue) {
  if (typeof hdrValue !== "string") {
    return null;
  }
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
}

const fromAuthHeaderWithScheme = function (authScheme) {
  const authSchemeLower = authScheme.toLowerCase();
  return function (request) {
    let token = null;
    if (request.headers[AUTH_HEADER]) {
      const authParams = parseAuthHeader(request.headers[AUTH_HEADER]);
      if (authParams && authSchemeLower === authParams.scheme.toLowerCase()) {
        token = authParams.value;
      }
    }
    return token;
  };
};

const fromAuthHeaderAsBearerToken = function () {
  return fromAuthHeaderWithScheme(BEARER_AUTH_SCHEME);
};

const appTokenFromRequest = fromAuthHeaderAsBearerToken();

// app token to validate the request is coming from the authenticated server only.
const appTokenDB = {
  trade_sso_consumer: "l1Q7zkOL59cRqWBkQ12ZiGVW2DBL",
  tenders_sso_consumer: "1g0jJwGmRQhJwvwNOrY4i90kD0m",
  investment_sso_consumer: "kOL59cRqWBQhJwvwNOrYkD0iGVW",
};

const alloweOrigin = {
  /** ekbazaar development + beta + live **/
  // tenders
  "http://localhost:8060": true,
  // "https://elastic.tech-active.com:8443": true,
  "https://tenderapi.tech-active.com": true,
  "https://api.ekbazaar.com": true,
  //trade
  "http://localhost:8070": true,
  "https://tradebazaarapi.tech-active.com": true,
  "https://tradeapi.ekbazaar.com": true,
  //investment
  "http://localhost:8050": true,
  "https://investmentapi.tech-active.com": true,
  "https://investmentapi.ekbazaar.com": true
};

const deHyphenatedUUID = () => uuidv4().replace(/-/gi, "");
const encodedId = () => hashids.encodeHex(deHyphenatedUUID());

// A temporary cahce to store all the application that has login using the current session.
// It can be useful for variuos audit purpose
const sessionUser = {};
const sessionApp = {};

const originAppName = {
  /** ekbazaar development + beta + live **/
  //tenders
  "http://localhost:8060": "tenders_sso_consumer",
  // "https://elastic.tech-active.com:8443": "tenders_sso_consumer",
  "https://tenderapi.tech-active.com": "tenders_sso_consumer",
  "https://api.ekbazaar.com": "tenders_sso_consumer",
  //trade
  "http://localhost:8070": "trade_sso_consumer",
  "https://tradebazaarapi.tech-active.com": "trade_sso_consumer",
  "https://tradeapi.ekbazaar.com": "trade_sso_consumer",
  //investment
  "http://localhost:8050": "investment_sso_consumer",
  "https://investmentapi.tech-active.com": "investment_sso_consumer",
  "https://investmentapi.ekbazaar.com": "investment_sso_consumer",
};

let userDB = {
  "ashutosh@active.agency": {
    password: "test",
    userId: encodedId(), // incase you dont want to share the user-email.
    appPolicy: {
      trade_sso_consumer: { role: "user", shareEmail: false },
      tenders_sso_consumer: { role: "user", shareEmail: false },
      sso_consumer: { role: "admin", shareEmail: true },
      simple_sso_consumer: { role: "user", shareEmail: false },
    },
  },
};

// these token are for the validation purpose
const intrmTokenCache = {};

const fillIntrmTokenCache = (origin, id, intrmToken) => {
  intrmTokenCache[intrmToken] = [id, originAppName[origin]];
};
const storeApplicationInCache = (origin, id, intrmToken) => {
  if (sessionApp[id] == null) {
    sessionApp[id] = {
      [originAppName[origin]]: true,
    };
    fillIntrmTokenCache(origin, id, intrmToken);
  } else {
    sessionApp[id][originAppName[origin]] = true;
    fillIntrmTokenCache(origin, id, intrmToken);
  }
  // console.log({ ...sessionApp }, { ...sessionUser }, { intrmTokenCache });
};

const generatePayload = (ssoToken) => {
  const deviceId = machineIdSync();

  const globalSessionToken = intrmTokenCache[ssoToken][0];
  const appName = intrmTokenCache[ssoToken][1];
  const userEmail = sessionUser[globalSessionToken];
  const user = userDB[userEmail];
  console.log("🚀 ~ file: index.js ~ line 150 ~ generatePayload ~ user", user)
  const appPolicy = user.appPolicy[appName];
  const email = appPolicy.shareEmail === true ? userEmail : undefined;
  const payload = {
    ...{ ...appPolicy },
    ...{
      deviceId,
      email,
      shareEmail: undefined,
      uid: user.userId,
      userId: user.userId,
      // global SessionID for the logout functionality.
      globalSessionID: globalSessionToken,
    },
  };
  return payload;
};

const verifySsoToken = async (req, res, next) => {
  const appToken = appTokenFromRequest(req);
  const { ssoToken } = req.query;
  // if the application token is not present or ssoToken request is invalid
  // if the ssoToken is not present in the cache some is
  // smart.
  if (
    appToken == null ||
    ssoToken == null ||
    intrmTokenCache[ssoToken] == null
  ) {
    return res.status(400).json({ message: "badRequest" });
  }

  // if the appToken is present and check if it's valid for the application
  const appName = intrmTokenCache[ssoToken][1];
  const globalSessionToken = intrmTokenCache[ssoToken][0];
  // If the appToken is not equal to token given during the sso app registraion or later stage than invalid
  if (
    appToken !== appTokenDB[appName] ||
    sessionApp[globalSessionToken][appName] !== true
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  // checking if the token passed has been generated
  const payload = generatePayload(ssoToken);

  const token = await genJwtToken(payload);
  // delete the itremCache key for no futher use,
  delete intrmTokenCache[ssoToken];
  return res.status(200).json({ token, deviceId: payload.deviceId });
};

const register = async (req, res, next) => {
  const {
    email,
    mobile,
    password,
    ipAddress,
    preferredLanguage,
    countryCode,
    origin,
    whatsappChecked,
    isMobileApp,
    isWhatsappApp
  } = req.body;
  req.body.password = encodePassword(password);
  console.log(req.body,"====================")
  const tenderUser = {
    email,
    countryCode: Boolean(mobile.countryCode) && mobile.countryCode || countryCode || "+91",
    mobile: Boolean(mobile.mobile) && parseInt(mobile.mobile) || mobile && parseInt(mobile) || null,
    isPhoneVerified: 2,
    password: req.body.password,
    isMobileApp: isMobileApp || false,
    isWhatsappApp: isWhatsappApp || false
    // preferredLanguage
  };

  let url = "";
  const findUser = await UserModel.findOne({ mobile: tenderUser.mobile });
  if (origin === "trade") {
    baseURL = trade;
    url = baseURL + "user";
    req.query.serviceURL = _trade;
    if (findUser && (findUser.deleteTrade && findUser.deleteTrade.status) && (findUser.deleteTendor && findUser.deleteTendor.status) && (findUser.deleteInvestement && findUser.deleteInvestement.status)) {
      tenderUser.deleteTrade = {
        status: false,
        reason: ""
      }
      tenderUser.deleteTendor = {
        status: false,
        reason: ""
      }
      tenderUser.deleteInvestement = {
        status: false,
        reason: ""
      }
    } else {
      tenderUser.deleteTrade = {
        status: false,
        reason: ""
      }
    }
  } else if (origin === "tender") {
    baseURL = tender;
    url = baseURL + "v1/user";
    req.query.serviceURL = _tender;
    if (findUser && (findUser.deleteTrade && findUser.deleteTrade.status) && (findUser.deleteTendor && findUser.deleteTendor.status) && (findUser.deleteInvestement && findUser.deleteInvestement.status)) {
      tenderUser.deleteTrade = {
        status: false,
        reason: ""
      }
      tenderUser.deleteTendor = {
        status: false,
        reason: ""
      }
      tenderUser.deleteInvestement = {
        status: false,
        reason: ""
      }
    } else {
      tenderUser.deleteTendor = {
        status: false,
        reason: ""
      }
    }
  } else {
    baseURL = investment;
    url = baseURL + "user";
    req.query.serviceURL = _investment;
    if (findUser && (findUser.deleteTrade && findUser.deleteTrade.status) && (findUser.deleteTendor && findUser.deleteTendor.status) && (findUser.deleteInvestement && findUser.deleteInvestement.status)) {
      tenderUser.deleteTrade = {
        status: false,
        reason: ""
      }
      tenderUser.deleteTendor = {
        status: false,
        reason: ""
      }
      tenderUser.deleteInvestement = {
        status: false,
        reason: ""
      }
    } else {
      tenderUser.deleteInvestement = {
        status: false,
        reason: ""
      }
    }
  }

  if (preferredLanguage) tenderUser.preferredLanguage = preferredLanguage;
  let user;
  if (findUser) {
    user = await UserModel.findOneAndUpdate({ mobile: findUser.mobile }, { ...tenderUser, email: findUser.email }); //.exec()
  } else {
    user = await UserModel.create(tenderUser); //.exec()
  }
  console.log("🚀 ~ file: index.js ~ line 229 ~ register ~ user", user)
  // const user = await UserModel.findOneAndUpdate({ mobile: mobile.mobile || mobile }, { $set: tenderUser }, { new: true, upsert: true }); //.exec()
  if (!user) {
    return respError(res, "User not Created");
  }
  const { _id } = user;
  userDB = {
    [tenderUser.mobile || tenderUser.email]: {
      password,
      userId: _id, //encodedId() // incase you dont want to share the user-email.
      appPolicy: {
        trade_sso_consumer: { role: "user", shareEmail: false },
        tenders_sso_consumer: { role: "user", shareEmail: false },
        investment_sso_consumer: { role: "user", shareEmail: false },
      },
    },
  };
  const { serviceURL } = req.query;
  const id = encodedId();
  req.session.user = id;
  sessionUser[id] = tenderUser.mobile || tenderUser.email;
  if (serviceURL == null) {
    return res.redirect("/");
  }
  const _url = new URL(serviceURL);

  const intrmid = encodedId();
  storeApplicationInCache(_url.origin, id, intrmid);

  console.log(url,"-===bbbbbbbbbbbbbbbbbbbbbbbb", mobile)
  const response = await axios({
    url,
    method: "POST",
    data: {
      user,
      _user: req.session.user,
      url: `${serviceURL}?ssoToken=${intrmid}`,
      email,
      mobile,
      password,
      ipAddress,
      preferredLanguage,
      countryCode,
      origin,
      _base: req.headers.origin,
      whatsappChecked,
      isMobileApp: isMobileApp || false,
      isWhatsappApp: isWhatsappApp || false
    },
  });
  console.log("🚀 ~ file: index.js:349 ~ register ~ response:", response)
  const { data } = response;
  if (data.success) {
    req.session.token = data.data.token;
    req.session.ssoToken = intrmid;
    return respSuccess(
      res,
      { token: data.data.token, _user: req.session.user, ...data.data },
      data.message
    );
  }
  return respError(res, response.data);
};

const doLogin = async (req, res, next) => {
  // do the validation with email and password
  // but the goal is not to do the same in this right now,
  // like checking with Datebase and all, we are skiping these section
  // const { email, password } = req.body;
  let { password, ipAddress, mobile, userType, origin, location, countryCode, email } = req.body;
  let query = {}
  if (req.body.email) query = { email: req.body.email }
  else query = { mobile, countryCode: countryCode || "+91" }
  const user = await UserModel.findOne(query)
    // .sort({ _id: -1 })
    .select({
      name: 1,
      email: 1,
      mobile: 1,
      preferredLanguage: 1,
      password: 1,
      isPhoneVerified: 1,
      isMobileVerified: 1,
      countryCode: 1,
      deleteTrade: 1,
      deleteInvestement: 1,
      deleteTendor: 1
      // _id: -1,
    })
    .exec();
  if (!user) {
    return respError(res, "User not found");
  }
  if (user && userType && userType === "seller" && !user.password) {
    respAuthFailed(res, undefined, "user not found")
  }
  // console.log("🚀 ~ file: index.js ~ line 319 ~ doLogin ~ user", user)

  let url = "";
  if (origin === "trade") {
    baseURL = trade;
    url = baseURL + "user/login";
    req.query.serviceURL = _trade;
    if (user && user.deleteTrade && user.deleteTrade.status) return respError(res, "Your account has been deleted")
  } else if (origin === "tender") {
    baseURL = tender;
    url = baseURL + "v1/user/login";
    req.query.serviceURL = _tender;
    if (user && user.deleteTendor && user.deleteTendor.status) return respError(res, "Your account has been deleted")
  } else {
    baseURL = investment;
    url = baseURL + "user/login";
    req.query.serviceURL = _investment;
    if (user && user.deleteInvestement && user.deleteInvestement.status) return respError(res, "Your account has been deleted")
  }

  const {
    // mobile,
    // name,
    // email,
    // preferredLanguage,
    // isPhoneVerified,
    // isMobileVerified,
    _id,
  } = user;
  const registered = user.password ? await bcrypt.compare(password, user.password) : true;
  userDB = {
    [user.mobile || user.email]: {
      password,
      userId: _id, //encodedId() // incase you dont want to share the user-email.
      appPolicy: {
        trade_sso_consumer: { role: "user", shareEmail: false },
        tenders_sso_consumer: { role: "user", shareEmail: false },
        investment_sso_consumer: { role: "user", shareEmail: false },
      },
    },
  };

  if (!registered) return respError(res, "Invalid Credentials");
  else if (!(userDB[user.mobile] && registered)) {
    return respError(res, "Invalid Credentials");
  }

  // else redirect
  const { serviceURL } = req.query;
  const id = encodedId();
  req.session.user = id;
  sessionUser[id] = user.mobile;
  if (serviceURL == null) {
    return res.redirect("/");
  }
  const _url = new URL(serviceURL);

  const intrmid = encodedId();
  storeApplicationInCache(_url.origin, id, intrmid);
  const response = await axios({
    url,
    method: "POST",
    data: {
      user,
      url: `${serviceURL}?ssoToken=${intrmid}`,
      origin,
      password,
      ipAddress,
      mobile,
      userType,
      location,
      _base: req.headers.origin,
      email,
      countryCode
    },
  });
  const { data } = response;
  if (response.data.success) {
    req.session.token = data.data.token;
    req.session.ssoToken = intrmid;
    return respSuccess(
      res,
      {
        user,
        _user: data.data.user,
        token: data.data.token,
        activeChat: data.data.activeChat,
        productCount: data.data.productCount,
        sellerType: data.data.sellerType
      },
      data.message
    );
  } else {
    respError(res, response.data.message);
  }
};

const login = async (req, res, next) => {
  // The req.query will have the redirect url where we need to redirect after successful
  // login and with sso token.
  // This can also be used to verify the origin from where the request has came in
  // for the redirection

  const { origin } = req.query;
  if (origin === "trade" || !origin) {
    req.query.serviceURL = _trade;
  } else if (origin === "tender") {
    req.query.serviceURL = _tender;
  } else {
    req.query.serviceURL = _investment;
  }

  const { serviceURL } = req.query;

  // direct access will give the error inside new URL.
  const intrmid = encodedId();
  if (serviceURL != null) {
    const url = new URL(serviceURL);
    if (alloweOrigin[url.origin] !== true) {
      return res
        .status(400)
        .json({ message: "Your are not allowed to access the sso-server" });
    }
  }
  if (req.session.user != null && serviceURL == null) {
    return res.send({
      user: req.session.user,
      url: `${serviceURL}?ssoToken=${intrmid}`,
    });
    // return res.redirect("/");
  }
  // if global session already has the user directly redirect with the token
  if (req.session.user != null && serviceURL != null) {
    const url = new URL(serviceURL);
    storeApplicationInCache(url.origin, req.session.user, intrmid);
    return respSuccess(res, {
      user: req.session.user,
      token: req.session.token,
      langCode: req.session.featuredLanguage
    });
    // return res.send({ user, url: `${serviceURL}?ssoToken=${intrmid}` })
  }
  respError(res, { message: "User is not logged in", langCode: req.session.featuredLanguage });
  // next()
};

const logout = async (req, res, next) => {
  // The req.query will have the redirect url which can be used to verify the origin from where the request has came in
  const { serviceURL } = req.query;
  if (serviceURL != null) {
    const url = new URL(serviceURL);
    if (alloweOrigin[url.origin] !== true) {
      return res
        .status(400)
        .json({ message: "Your are not allowed to access the sso-server" });
    }
  }

  if (req.session.user !== null && serviceURL !== null) {
    req.sessionStore.destroy(req.session.id, function (err) {
      console.log("session-destroyed callback", err);
    });
    // req.session.distroy()
    // req.session.cookie.expires = new Date().getTime();
    // req.session = null //.distroy(function (err) {
    // if (err) res.status(500).json({ success: false, message: err })
    // else res
    // .status(200)
    // .json({ success: true, message: "Successfully Logged out" })
    // })

    return respSuccess(res, "Successfully Logged out");
  }
};

const postRFP = async (req, res, next) => {
  const {
    mobile,
    name,
    email,
    location,
    productDetails,
    ipAddress,
    requestType,
    sellerId,
  } = req.body;

  console.log(JSON.stringify(req.body),"sdfgffffffffffffffffffffffffff")

  let user = await UserModel.findOne({ mobile: mobile.mobile })
    .select({
      name: 1,
      email: 1,
      mobile: 1,
      preferredLanguage: 1,
      password: 1,
      isPhoneVerified: 1,
      isMobileVerified: 1,
      countryCode: 1,
      // _id: -1,
    })
    .exec();
  let __user = {};
  let _id = ""
  if (user) {
    _id = user._id
    user = [user];
  } else {
    const userData = {
      name,
      email,
      mobile: mobile.mobile,
      countryCode: mobile.countryCode,
      password: null,
    };
    __user = await UserModel.create(userData);
    _id = __user._id
    user = [];
  }

  const password = encodedId();
  req.query.serviceURL = _trade;
  let baseURL = trade;
  let url = baseURL + "buyer/rfp";

  const { serviceURL } = req.query;

  userDB = {
    [mobile.mobile || mobile]: {
      password,
      userId: _id, // encodedId(), // incase you dont want to share the user-email.
      appPolicy: {
        trade_sso_consumer: { role: "user", shareEmail: false },
        tenders_sso_consumer: { role: "user", shareEmail: false },
        investment_sso_consumer: { role: "user", shareEmail: false },
      },
    },
  };

  const id = encodedId();
  req.session.user = id;
  sessionUser[id] = mobile.mobile || mobile;
  if (serviceURL == null) {
    return res.redirect("/");
  }
  const _url = new URL(serviceURL);

  const intrmid = encodedId();
  storeApplicationInCache(_url.origin, id, intrmid);
  const response = await axios({
    url,
    method: "POST",
    data: {
      user,
      __user,
      _user: req.session.user,
      url: `${serviceURL}?ssoToken=${intrmid}`,
      ...req.body,
    },
  });
  if (response.data.success) {
    if (response.data && response.data.data && response.data.data.token) req.session.token = response.data.data.token
    return respSuccess(res, { ...response.data.data }, response.data.message);
  } else {
    return respError(res, response.data && response.data.message ? response.data.message : "Somthing went wrong");
  }
};

const setUserLanguage = async (req, res, next) => {
  const { langCode } = req.body
  const id = encodedId();
  req.session.user = id;
  sessionUser[id] = "onebazaar";
  const _url = new URL(globalVaraibles.url);

  const intrmid = encodedId();
  storeApplicationInCache(_url.origin, id, intrmid);
  req.session.featuredLanguage = langCode

  return respSuccess(res, { langCode })
}

const getUserLanguage = async (req, res, next) => {
  return respSuccess(res, { langCode: req.session.featuredLanguage })
}

module.exports = Object.assign(
  {},
  { doLogin, login, verifySsoToken, logout, register, baseURL, postRFP, setUserLanguage, getUserLanguage }
);