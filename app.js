require("dotenv").config();
const { env } = process;
global.environment = env.NODE_ENV || "production";

const path = require('path');
const express = require('express')
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");

require('./config/db').dbConnection();
require('./config/tenderdb').conn
const Logger = require('./src/utils/logger');
const config = require('./config/config')
const { sendQueSms, getExpirePlansCron, sendQueEmails, getAboutToExpirePlan } = require('./src/crons/cron')
const { updatePriority } = require('./src/controllers/web/testController')
const { respSuccess, respError } = require("./src/utils/respHadler")
const router = require('./src/routes');
const { request } = require("./src/utils/request")
const { authServiceURL, ssoLoginUrl } = require("./src/utils/utils").globalVaraibles
const { deleteTestData, uploadInternationalCity } = require('./src/controllers/web/testController')

// const { suggestions} = require("./elasticsearch-mapping");

// const { suggestionsMapping } = suggestions

const { serviceURL } = authServiceURL()
const { tradeDb } = config

const app = express();
// app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:8086",
      "http://localhost:3000",
      "http://localhost:8070",
      "http://localhost:8085",
      "https://trade.ekbazaar.com",
      "https://trade.onebazaar.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin, Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, authorization"
  );
  next();
});
app.use(useragent.express());
app.use(fileUpload());

app.use(express.static(path.join(__dirname, "public")));
const server = require("http").Server(app);

app.use(router);
app.get("/", async function (req, res) {
  console.log("Home page");
  res.send("It's Ekbazaar Trade beta api server");
});

app.get("/api/logged", async (req, res, next) => {
  const response = await request({
    url: ssoLoginUrl,
    method: "GET",
    params: { serviceURL },
  });
  console.log("🚀 ~ file: app.js ~ line 87 ~ app.get ~ response", response);
  const { data } = response;
  if (data && data.success)
    return respSuccess(res, { user: data.data.user, token: data.data.token });
  else return respError(res, data.message);
});

app.post("/capture/:paymentId", async function (req, res) {
  try {
    const result = await captureRazorPayPayment(req, res);
  } catch (error) { }
  // res.send('Its delete records  live')
});

app.get("/deleteTestData", async function (req, res) {
  try {
    const result = await deleteTestData(req, res);
  } catch (error) { }
  // res.send('Its delete records  live')
});

async function indexing() {
  await checkIndices();
  await putMapping();
  // await l1CheckIndices()
  // await l1PutMapping()
  // await l2CheckIndices()
  // await l2PutMapping()
  // await l3CheckIndices()
  // await l3PutMapping()
  // await l4CheckIndices()
  // await l4PutMapping()
  // await l5CheckIndices()
  // await l5PutMapping()
  // await cityCheckIndices()
  // await cityPutMapping()
  // await stateCheckIndices()
  // await statePutMapping()
  // await countryCheckIndices()
  // await countryPutMapping()
  // await serviceTypeCheckIndices()
  // await serviceTypePutMapping()
  // await tradeMasterCheckIndices()
  // await tradeMasterPutMapping()
}
// indexing()

app.use(router);

server.listen(tradeDb.server_port);

server.on("error", (e) => {
  console.log(e, "Can't start the server!");
  Logger.error(e);
});

// app.get('/suggestionsMapping', async function (req, res) {
//   try {
//       console.log('test --------------------   ')
//       const result = await suggestionsMapping()
//   } catch (error) {

//       res.send(error)
//   }
// })

app.post("/uploadInternationalCity", async function (req, res) {
  try {
    const result = await uploadInternationalCity(req, res);
    console.log('city---')
  } catch (error) { }
  res.send('Its delete records  live')
});


server.on("listening", () => {
  console.log(`Listening:${server.address().port}`);
  Logger.info(`Listening:${server.address().port}`);
});

if (env.NODE_ENV === "production1") {
  const queSms = cron.schedule("* * * * *", async () => {
    queSms.stop();
    console.log(
      "-------------------- queSms file cron start --------------------",
      new Date()
    );
    await sendQueSms();
    console.log(
      "-------------------- queSms file cron completed --------------------",
      new Date()
    );
    queSms.start();
  });
  queSms.start();
}

if (env.NODE_ENV === "production1" || env.NODE_ENV === "staging") {
  const planExpire = cron.schedule(
    "50 23 * * *",
    async () => {
      //every day 10 am cron will start
      planExpire.stop();
      console.log(
        "-------------------- planExpire file cron start --------------------",
        new Date()
      );
      await getExpirePlansCron();
      await getAboutToExpirePlan();
      console.log(
        "-------------------- planExpire file cron completed --------------------",
        new Date()
      );
      planExpire.start();
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
  planExpire.start();

  const queEmail = cron.schedule("* * * * *", async () => {
    queEmail.stop();
    console.log(
      "-------------------- queEmail file cron start --------------------",
      new Date()
    );
    await sendQueEmails();
    console.log(
      "-------------------- queEmail file cron completed --------------------",
      new Date()
    );
    queEmail.start();
  });
  queEmail.start();

  const priority = cron.schedule("* * * * *", async () => {
    priority.stop();
    console.log(
      "-------------------- priority file cron start --------------------",
      new Date()
    );
    await updatePriority();
    console.log(
      "-------------------- priority file cron completed --------------------",
      new Date()
    );
    priority.start();
  });
  priority.start();
}
