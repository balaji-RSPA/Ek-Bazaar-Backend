exports.INDEXNAME = process.env.NODE_ENV === "production" ? "tradedb.mastercollections" : "trade-live.mastercollections" //tradebazaar
// exports.INDEXNAME = 'opend_contacts.mastercollections'

exports.bcryptSalt = {
  SALT: 10,
};

exports.JWTTOKEN = "tech_active_ekbazaar";

exports.ADMIN_JWT_ADMIN_SECRET = "tech-ekbazaar-admin";

// mailgun test credential
exports.MailgunKeys = {
  senderMail: "admin@communications.ekbazaar.com",
  replyMail: "no-reply@communications.ekbazaar.com",
  mailgunAPIKey: "key-c956636404963d0492622caa1cdc6082",
  mailgunDomain: "communications.ekbazaar.com",
};
exports.fromEmail = {
  fromEmailName: "EkBazaar",
  fromEmailId: "shettenor1995@gmail.com",
};
exports.awsKeys = {
  endpoint: 'https://fra1.digitaloceanspaces.com/',
  accessKeyId: "PO5QFSCFS6QMNDJWMLZB",
  secretAccessKey: "tLxagFAGA9F4bWgG3yQ9DObw5UXU0s9OvqOjYt0gJZo",
  region: "us-east-1",
  Bucket: "trade-images",
};

exports.moduleTypes = {
  adminsManagement: "adminsManagement",
  // citiesManagement: 'citiesManagement',
  companiesManagement: "companiesManagement",
  // countriesManagement: 'countriesManagement',
  customersManagement: "customersManagement",
  industriesManagement: "industriesManagement",
  locationsManagement: "locationsManagement",
  rolesManagement: "rolesManagement",
  supportServices: "supportServices",
  // statesManagement: 'statesManagement',
  tendersManagement: "tendersManagement",
};

exports.sms = {
  smsURL: 'http://203.212.70.200/smpp/sendsms',
  username: 'cn14604',
  password: 'Admin@14604',
  senderID: 'EKBZAR'
}
const {NODE_ENV} = process.env
exports.siteUrl =  NODE_ENV === "production" ? "https://www.trade.ebazaar.com" : "http://tradebazaar.tech-active.com"

exports.accessModules = Object.values(this.moduleTypes);

exports.razorPayCredentials = {
  // key_id: 'rzp_test_jCeoTVbZGMSzfn',
  // key_secret: 'V8BiRAAeeqxBVheb0xWIBL8E',

  key_id: 'rzp_test_PYGivNOLb4gHKa',
  key_secret: 'kxHFfzePUsb5PeaDHP5QxmPO',
}
