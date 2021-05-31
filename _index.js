const app = require("./onebazaar");
const PORT = 3014;

app.listen(PORT, () => {
  console.info(`sso-server listening on port ${PORT}`);
});
