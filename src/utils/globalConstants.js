exports.INDEXNAME = process.env.NODE_ENV === "production" ? "tradedb.mastercollections" : "trade-live.mastercollections" //tradebazaar

// new elasticsearch single node multi index
// exports.INDEXNAME = "tradedb.mastercollections"

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
  // smsURL: 'http://203.212.70.200/smpp/sendsms',
  // username: 'cn14604',
  // password: 'Admin@14604',
  "senderID": 'EKBZAR',
  // "smsURL": "http://180.179.218.150/sendurlcomma.aspx?",
  "userName": 20060709,
  "password": "NAG@087",
  "smsURL": "http://180.179.215.100/sendurl.aspx?user=20060709&pwd=NAG@087&senderid=EKBZAR&"
}

exports.exotelSms = {
  'apiKey' : 'a16cbb8f78d846f10c0eef9bd8786a3bd6ee79132e5e3f15',
  'apiToken' : '0d5f5b66e3554da61966d96f3307e5a7caab58d6fa9b07ee',
  'subDomain' : '@api.exotel.com',
  'accountSid' : 'techactivesolutionsindia1',
  'senderID': 'EKBZAR',
  'apiURL': "https://a16cbb8f78d846f10c0eef9bd8786a3bd6ee79132e5e3f15:0d5f5b66e3554da61966d96f3307e5a7caab58d6fa9b07ee@api.exotel.com/v1/Accounts/techactivesolutionsindia1"
}

const { NODE_ENV } = process.env
exports.siteUrl = NODE_ENV === "production" ? "https://www.trade.ebazaar.com" : "http://tradebazaar.tech-active.com"

exports.accessModules = Object.values(this.moduleTypes);

exports.razorPayCredentials = NODE_ENV === 'production' ?
  {
    // Live subramany
    key_id: 'rzp_live_CTVuq0QYf0mDPH',
    key_secret: 'KOY2qN10NCtcbgZmtpq87wOW',

    // tech active
    // key_id: 'rzp_live_XD55IMcWecgyGW',
    // key_secret: 'ZjFLNOH3YsDhhoH9Nf676kDn',
  } : {
    // orbit
    // key_id: 'rzp_test_jCeoTVbZGMSzfn',
    // key_secret: 'V8BiRAAeeqxBVheb0xWIBL8E',

    // akashay
    // key_id: 'rzp_test_PYGivNOLb4gHKa',
    // key_secret: 'kxHFfzePUsb5PeaDHP5QxmPO',

    // test subramanya
    key_id: 'rzp_test_UZ9n6fsg5YF5wE',
    key_secret: 'CrvydcP70c1LppJnGXgSu1b1',

    //tech active
    // key_id: 'rzp_test_7xMhKwGh9PRlRA',
    // key_secret: 'e2bNdsdat2NeW73aYEICwjvc'
  }
exports.siteURL = "https://www.tenders.ekbazaar.com"
exports.imageURLS = {
  logoEkb: "https://tradebazaarapi.tech-active.com/images/ekbazaarlogo.png",
  logoOne: "https://tenders.ekbazaar.com/assets/images/One-bazaar.svg",
  emailVerified: "https://tradebazaarapi.tech-active.com/images/Unsubscribe.png",
  registrationthanks: "https://tradebazaarapi.tech-active.com/images/registrationthanks.png",
  otpverification: "https://tradebazaarapi.tech-active.com/images/passwordreset.png",
  passwordUpdated: "https://tradebazaarapi.tech-active.com/images/success.png",
  invoice: "https://tradebazaarapi.tech-active.com/images/invoice_updated.png",
  planExpired: "https://tradebazaarapi.tech-active.com/images/planExpired.png",
  planExpiring: "https://tradebazaarapi.tech-active.com/images/planExpiring.png",
  planChange: "https://tradebazaarapi.tech-active.com/images/planChanged.png",
  enquiry: "https://tradebazaarapi.tech-active.com/images/enquiry.png",
  facebook: "https://www.tenders.ekbazaar.com/assets/images/facebook.png",
  twitter: "https://www.tenders.ekbazaar.com/assets/images/twitter.png",
  linkedIn: "https://www.tenders.ekbazaar.com/assets/images/linkedin.png",
  accountActivated: "https://tradebazaarapi.tech-active.com/images/accountactivated@2x.png",
  registerationFlow: "https://tradebazaarapi.tech-active.com/images/registration-flow.png",
  announcements: "https://tradebazaarapi.tech-active.com/images/announcement@2x.png"
}

exports.rocketChatDomain = NODE_ENV === 'production' ? "chatbot.ekbazaar.com" : "chatbot.active.agency"
exports.rocketChatAdminLogin = NODE_ENV === 'production' ? {
  username: "ramesh@active.agency",
  password: "rameshTechActive"
} : {
  username: "ramesh",
  password: "ramesh123"
}

exports.stripeApiKeys = NODE_ENV === 'production' ? {clientKey: "", secretKey: ""} : {
  clientKey: "pk_test_51JhBmfSIrsAhsOaISFcd4J61fweaSlL7AwqYxZPzrNZXR1NfwPp3U6cF9CkYu68JE8rzksfo8dUMWhuLMbuazqru00XRhHRY7j", secretKey: "sk_test_51JhBmfSIrsAhsOaIafy9CUJ5SVhFBA2XtRXxdFLV5SvZFHuwIW52KbgtyZLz9BANufK3HYI1KGV94vaHCwzMcWrJ00q9gtQz7n"
};
