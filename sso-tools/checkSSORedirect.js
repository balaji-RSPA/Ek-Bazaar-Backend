const url = require("url");
const axios = require("axios");
const { verifyJwtToken } = require("./jwt_verify");
// const validReferOrigin = "http://sso.ankuranand.com:3010";
// const ssoServerJWTURL = "http://sso.ankuranand.com:3010/simplesso/verifytoken";
const ssoServerJWTURL = "http://localhost:3010/simplesso/verifytoken";

// const ssoRedirect = () => {
  // return async function(req, res, next) {
     async function ssoRedirect(req, res, next) {
    // check if the req has the queryParameter as ssoToken
    // and who is the referer.
    const { ssoToken } = req.query;
    console.log("🚀 ~ file: checkSSORedirect.js ~ line 13 ~ returnfunction ~ ssoToken", ssoToken)
    if (ssoToken != null) {
      // to remove the ssoToken in query parameter redirect.
      const redirectURL = url.parse(req.url).pathname;
      try {
        const response = await axios.get(
          `${ssoServerJWTURL}?ssoToken=${ssoToken}`,
          {
            headers: {
              Authorization: "Bearer l1Q7zkOL59cRqWBkQ12ZiGVW2DBL"
            }
          }
        );
        const { token } = response.data;
        const decoded = await verifyJwtToken(token);
        console.log("🚀 ~ file: checkSSORedirect.js ~ line 27 ~ returnfunction ~ decoded", decoded)
        // now that we have the decoded jwt, use the,
        // global-session-id as the session id so that
        // the logout can be implemented with the global session.
        req.session.user = decoded;
      } catch (err) {
        // return next(err);
        return {error: err.message}
      }
      return req.session.user
      // return res.redirect(`${redirectURL}`);
    }
    // return next();
    return null
  };
// };

module.exports = ssoRedirect;
