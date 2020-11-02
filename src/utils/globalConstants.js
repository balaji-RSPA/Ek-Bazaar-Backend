exports.INDEXNAME = 'ekbazaar'

exports.bcryptSalt = {
  SALT: 10,
};

exports.JWTTOKEN = "tech_active_ekbazaar";

exports.ADMIN_JWT_ADMIN_SECRET = "tech-ekbazaar-admin";

// mailgun test credential
exports.MailgunKeys = {
  senderMail: "",
  replyMail: "",
  mailgunAPIKey: "",
  mailgunDomain: "",
};
exports.fromEmail = {
  fromEmailName: "EkBazaar",
  fromEmailId: "shettenor1995@gmail.com",
};
exports.awsKeys = {
  accessKeyId: "AKIA5NLROODPXVCPRUBT",
  secretAccessKey: "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",
  region: "us-east-1",
  Bucket: "ekbazaar-test",
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

exports.accessModules = Object.values(this.moduleTypes);
