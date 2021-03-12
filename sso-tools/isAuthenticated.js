const isAuthenticated = (req, res/*, next*/) => {
  // simple check to see if the user is authenicated or not,
  // if not redirect the user to the SSO Server for Login
  // pass the redirect URL as current URL
  // serviceURL is where the sso should redirect in case of valid user
  const redirectURL = `${req.protocol}://${req.headers.host}${req.path}`;
  console.log("🚀 ~ file: isAuthenticated.js ~ line 8 ~ isAuthenticated ~ req.session.user", req.session)
  if (req.session.user == null) {
    return null
  }
  return req.session.user
};

module.exports = isAuthenticated;
