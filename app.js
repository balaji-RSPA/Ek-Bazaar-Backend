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
const { sendQueSms, getExpirePlansCron, sendQueEmails, getAboutToExpirePlan, sendDailyCount } = require('./src/crons/cron')
const { fetchPartiallyRegistredSeller, fetchPartiallyRegistredBuyer } = require('./src/modules/sellersModule')
const { updatePriority, gujaratSellerData } = require('./src/controllers/web/testController')
const { respSuccess, respError } = require("./src/utils/respHadler")
const router = require('./src/routes');
const { request } = require("./src/utils/request")
const { authServiceURL, ssoLoginUrl } = require("./src/utils/utils").globalVaraibles
const { deleteTestData, uploadInternationalCity, getCityList, deleteTestDataRemaining, deleteTestDataChat } = require('./src/controllers/web/testController')
const { uploadOnBoardSeller, moveSellerToNewDB, getSellerMasterProducts, uploadOnBoardBuyers } = require('./src/controllers/web/sellerDataMove')
const { uploadChatLanguageCategory } = require('./src/controllers/web/languageTempateController')
// const {checkIndicesMaster} = require("./elasticsearch-mapping/tradebazaar")

// const { suggestions} = require("./elasticsearch-mapping");

// const { suggestionsMapping } = suggestions
// checkIndicesMaster()

const { serviceURL } = authServiceURL()
const { tradeDb } = config
const moment = require('moment');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      "http://localhost:8086",
      "http://localhost:8085",
      "http://localhost:3000",
      "https://tradebazaar.tech-active.com",
      "https://tradeonebazaar.tech-active.com",
      "https://trade.ekbazaar.com",
      "https://trade.onebazaar.com",
      "http://admin.ekbazaar.tech-active.com",
      "https://admin.ekbazaar.tech-active.com",
      "http://192.168.1.28:8086"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  limit: '50mb',
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

// call this function for send daily report manually
app.get("/send-daily-report", async function (req, res) {
  try {
    console.log("send-daily-report api called");
    let response = await sendDailyCount();
    console.log(response, "send-daily-report response");
    return respSuccess(res, response);
  } catch (error) {
    console.log(error, "send-daily-report error");
    // return respError(res, error);
    return respError(res, "Something went wrong try again!");
  }
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

// app.post("/uploadChatLanguageCategory", async function (req, res) {
//   try {
//     const result = await uploadChatLanguageCategory(req, res);
//   } catch (error) { }
//   // res.send('Its delete records  live')
// });

// app.get("/deleteTestData", async function (req, res) {
//   try {
//     const result = await deleteTestData(req, res);
//   } catch (error) { }
//   // res.send('Its delete records  live')
// });
// app.get("/deleteTestDataRemaining", async function (req, res) {
//   try {
//     const result = await deleteTestDataRemaining(req, res);
//   } catch (error) { }
//   // res.send('Its delete records  live')
// });
// app.get("/deleteTestDataChat", async function (req, res) {
//   try {
//     const result = await deleteTestDataChat(req, res);
//   } catch (error) { }
//   // res.send('Its delete records  live')
// });
app.get("/gujaratSellerData", async function (req, res) {
  try {
    const result = await gujaratSellerData(req, res)
  } catch (error) { }
  // res.send('Its delete records  live')
});

app.get("/uploadOnBoardSeller", async function (req, res) {
  try {
    const result = await uploadOnBoardSeller(req, res)
  } catch (error) { }
  // res.send('Its delete records  live')
});
app.get("/getSellerMasterProducts", async function (req, res) {
  try {
    const result = await getSellerMasterProducts(req, res)
  } catch (error) { }
  // res.send('Its delete records  live')
});
app.get("/moveSellerToNewDB", async function (req, res) {
  try {
    const result = await moveSellerToNewDB(req, res)
  } catch (error) { }
  // res.send('Its delete records  live')
});

// Buyer dara move
app.get("/uploadOnBoardBuyers", async function (req, res) {
  try {
    const result = await uploadOnBoardBuyers(req, res)
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
// const threeMinutesAgo = moment().subtract(3, 'minutes')
// console.log(threeMinutesAgo,"=========kjhgkfhdsgkhsdkhgf")
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
app.get("/getCityList", async function (req, res) {
  try {
    const result = await getCityList(req, res);
  } catch (error) { }
  res.send('Its delete records  live')
});


server.on("listening", () => {
  console.log(`Listening:${server.address().port}`);
  Logger.info(`Listening:${server.address().port}`);
});

if (env.NODE_ENV === 'production') {
  const dailyCount = cron.schedule("30 2 * * *", async () => {
    dailyCount.stop();
    console.log(
      "-------------------- dailyCount cron start --------------------",
      new Date()
    );
    await sendDailyCount();
    console.log(
      "-------------------- dailyCount cron completed --------------------",
      new Date()
    );
    dailyCount.start();
  });
  dailyCount.start();
}

if (env.NODE_ENV === "production") {
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

if (env.NODE_ENV === "production" || env.NODE_ENV === "staging") {
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

  // const priority = cron.schedule("* * * * *", async () => {
  //   priority.stop();
  //   console.log(
  //     "-------------------- priority file cron start --------------------",
  //     new Date()
  //   );
  //   await updatePriority();
  //   console.log(
  //     "-------------------- priority file cron completed --------------------",
  //     new Date()
  //   );
  //   priority.start();
  // });
  // priority.start();
  const emailSmsToPartiallyRegistered = cron.schedule("* * * * *", async () => {
    console.log(' Incomplete registration cron started ------ ')
    emailSmsToPartiallyRegistered.stop();
    await fetchPartiallyRegistredBuyer();
    await fetchPartiallyRegistredSeller();
    emailSmsToPartiallyRegistered.start();
    console.log('Incomplete registration cron end ------------------')
  });
  emailSmsToPartiallyRegistered.start();

}
