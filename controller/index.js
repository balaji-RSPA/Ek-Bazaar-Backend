const uuidv4 = require("uuid/v4");
const Hashids = require("hashids");
const URL = require("url").URL;
const hashids = new Hashids();
const bcrypt = require("bcrypt");
const { genJwtToken } = require("./jwt_helper");
const { machineIdSync } = require("node-machine-id");
const { UserModel } = require("../config/db")

const re = /(\S+)\s+(\S+)/;

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
  investment_sso_consumer: 'kOL59cRqWBQhJwvwNOrYkD0iGVW',
};

const alloweOrigin = {
  "http://localhost:8070": true,
  "http://localhost:8060": true,
};

const deHyphenatedUUID = () => uuidv4().replace(/-/gi, "");
const encodedId = () => hashids.encodeHex(deHyphenatedUUID());

// A temporary cahce to store all the application that has login using the current session.
// It can be useful for variuos audit purpose
const sessionUser = {};
const sessionApp = {};

const originAppName = {
  "http://localhost:8070": "trade_sso_consumer",
  "http://localhost:8060": "tenders_sso_consumer",
};

let userDB = {
  "ashutosh@active.agency": {
    password: "test",
    userId: encodedId(), // incase you dont want to share the user-email.
    appPolicy: {
      trade_sso_consumer: { role: "user", shareEmail: false },
      tenders_sso_consumer: { role: "user", shareEmail: false },
      sso_consumer: { role: "admin", shareEmail: true },
      simple_sso_consumer: { role: "user", shareEmail: false }
    }
  }
};

// these token are for the validation purpose
const intrmTokenCache = {};

const fillIntrmTokenCache = (origin, id, intrmToken) => {
  intrmTokenCache[intrmToken] = [id, originAppName[origin]];
};
const storeApplicationInCache = (origin, id, intrmToken) => {
  if (sessionApp[id] == null) {
    sessionApp[id] = {
      [originAppName[origin]]: true
    };
    fillIntrmTokenCache(origin, id, intrmToken);
  } else {
    sessionApp[id][originAppName[origin]] = true;
    fillIntrmTokenCache(origin, id, intrmToken);
  }
  console.log({ ...sessionApp }, { ...sessionUser }, { intrmTokenCache });
};

const generatePayload = ssoToken => {
  const deviceId = machineIdSync();
  const globalSessionToken = intrmTokenCache[ssoToken][0];
  const appName = intrmTokenCache[ssoToken][1];
  const userEmail = sessionUser[globalSessionToken];
  const user = userDB[userEmail];
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
      globalSessionID: globalSessionToken
    }
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
  const { mobile, password } = req.body;
  console.log("🚀 ~ file: index.js ~ line 160 ~ register ~ mobile", mobile)
  const user = await UserModel.findOne({ mobile })
    .select({
      name: 1,
      email: 1,
      mobile: 1,
      preferredLanguage: 1,
      password: 1,
      isPhoneVerified: 1,
      isMobileVerified: 1,
      countryCode: 1
      // _id: -1,
    })
    .exec()
  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }
  const { _id } = user
  userDB = {
    [mobile]: {
      password,
      userId: _id, //encodedId() // incase you dont want to share the user-email.
      appPolicy: {
        trade_sso_consumer: { role: "user", shareEmail: false },
        tenders_sso_consumer: { role: "user", shareEmail: false },
        investment_sso_consumer: { role: "user", shareEmail: false }
      }
    }
  }
  const { serviceURL } = req.query;
  const id = _id; // encodedId();
  req.session.user = id;
  sessionUser[id] = mobile;
  if (serviceURL == null) {
    return res.redirect("/");
  }
  const url = new URL(serviceURL);

  const intrmid = _id; // encodedId();
  storeApplicationInCache(url.origin, id, intrmid);
  return res.send({ user, url: `${serviceURL}?ssoToken=${intrmid}` });
}

const doLogin = async (req, res, next) => {
  // do the validation with email and password
  // but the goal is not to do the same in this right now,
  // like checking with Datebase and all, we are skiping these section
  // const { email, password } = req.body;
  const { mobile, password } = req.body;
  console.log("🚀 ~ file: index.js ~ line 209 ~ doLogin ~ req.body", req.body)
  const user = await UserModel.findOne({ mobile })
    .select({
      name: 1,
      email: 1,
      mobile: 1,
      preferredLanguage: 1,
      password: 1,
      isPhoneVerified: 1,
      isMobileVerified: 1,
      countryCode: 1
      // _id: -1,
    })
    .exec()
  const { name, email, preferredLanguage, isPhoneVerified, isMobileVerified, _id } = user
  const registered = await bcrypt.compare(password, user.password);

  userDB = {
    [email]: {
      password,
      userId: _id, //encodedId() // incase you dont want to share the user-email.
      appPolicy: {
        trade_sso_consumer: { role: "user", shareEmail: false },
        tenders_sso_consumer: { role: "user", shareEmail: false },
        investment_sso_consumer: { role: "user", shareEmail: false }
      }
    }
  }
  if (!(userDB[email] && registered)) {
    return res.status(404).json({ message: "Invalid email and password" });
  }

  // else redirect
  const { serviceURL } = req.query;
  const id = _id; // encodedId();
  req.session.user = id;
  sessionUser[id] = email;
  if (serviceURL == null) {
    return res.redirect("/");
  }
  const url = new URL(serviceURL);

  const intrmid = _id; // encodedId();
  storeApplicationInCache(url.origin, id, intrmid);
  return res.send({ user, url: `${serviceURL}?ssoToken=${intrmid}` });
};

const login = async (req, res, next) => {
  // The req.query will have the redirect url where we need to redirect after successful
  // login and with sso token.
  // This can also be used to verify the origin from where the request has came in
  // for the redirection
  const { serviceURL } = req.query;
  const { mobile } = req.body;

  const user = await UserModel.findOne({ mobile })
    .select({
      name: 1,
      email: 1,
      mobile: 1,
      preferredLanguage: 1,
      password: 1,
      isPhoneVerified: 1,
      isMobileVerified: 1,
      countryCode: 1
      // _id: -1,
    })
    .exec()

  const { _id } = user
  // direct access will give the error inside new URL.
  if (serviceURL != null) {
    const url = new URL(serviceURL);
    if (alloweOrigin[url.origin] !== true) {
      return res
        .status(400)
        .json({ message: "Your are not allowed to access the sso-server" });
    }
  }
  if (req.session.user != null && serviceURL == null) {
    return res.send({ user, url: `${serviceURL}?ssoToken=${intrmid}` })
    // return res.redirect("/");
  }
  // if global session already has the user directly redirect with the token
  if (req.session.user != null && serviceURL != null) {
    const url = new URL(serviceURL);
    const intrmid = _id // encodedId();
    storeApplicationInCache(url.origin, req.session.user, intrmid);
    res.send({ user, url: `${serviceURL}?ssoToken=${intrmid}` })
  }

  next()
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
  console.log("🚀 ~ file: index.js ~ line 265 ~ logout ~ req.session.user", req.session.user)
  if (req.session.user !== null && serviceURL !== null) {
    req.session = null //.distroy(function (err) {
    // if (err) res.status(500).json({ success: false, message: err })
    // else res
    // .status(200)
    // .json({ success: true, message: "Successfully Logged out" })
    // })
    res
      .status(200)
      .json({ success: true, message: "Successfully Logged out" })
  }
}

module.exports = Object.assign({}, { doLogin, login, verifySsoToken, logout, register });
