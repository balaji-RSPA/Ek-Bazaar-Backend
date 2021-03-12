const fs = require("fs");
const path = require("path");

const privateKeyFilePath =
  process.env.JWT_SSO_PRIVATE_KEY_FILE ||
  // path.resolve(__dirname, "./jwtPrivate.key");
  path.resolve(__dirname, "./private-key.pem");

const privateCert = fs.readFileSync(privateKeyFilePath);

const jwtValidatityKey = "simple-sso-jwt-validatity";

module.exports = Object.assign(
  {},
  {
    privateCert,

    jwtValidatityKey
  }
);
