require('dotenv').config();
const { env } = process
global.environment = env.NODE_ENV || 'production'

const path = require('path');
const express = require('express')
const session = require("express-session");
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')
const morgan = require("morgan");
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require("node-cron");

require('./config/db').dbConnection();
require('./config/tenderdb').conn
const Logger = require('./src/utils/logger');
const config = require('./config/config')
const isAuthenticated = require("./sso-tools/isAuthenticated");
const { ssoRedirect } = require("./sso-tools/checkSSORedirect");
const { sendQueSms, getExpirePlansCron, sendQueEmails, getAboutToExpirePlan } = require('./src/crons/cron')
const { updatePriority } = require('./src/controllers/web/testController')
const { respSuccess } = require("./src/utils/respHadler")
const router = require('./src/routes');

const { tradeDb } = config

const app = express();
// app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:8085", "https://tradebazaar.tech-active.com", "https://www.trade.ekbazaar.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("trust proxy", 1);
const cookieOptions = {
    path: "/",
    expires: 1000 * 60 * 60 * 24 * 15,
    // domain: ".tech-active.com",
    sameSite: "none",
    httpOnly: true,
    // secure: true,
};

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, authorization");
    // res.cookie("token","ghjkk5247986-512222222222.dfghjkk", {
    //   secure: true,
    //   httpOnly: true,
    //   domain: "tradebazaarapi.tech-acive.com"
    // });
    next();
});

app.use(
    session({
        key: "userId",
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        // domain: ".tech-active.com",
        cookie: {
            ...cookieOptions
        },
    })
);
app.use(useragent.express());
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));
const server = require('http').Server(app);

app.use(router)
app.get('/', function (req, res) {
    console.log('Home page')
    res.send("It's Ekbazaar Trade beta api server")
})

app.get("/api/logged", async (req, res, next) => {
    let user = await ssoRedirect(req, res, next)
    if (user && user.error) {
        respSuccess(res, error)
    } else if (!user) {
        user = await isAuthenticated(req, res, next)
        if (!user) respSuccess(res, "user is not logged in any app")
        else {
            // req.session.cookie._expires = 60 * 60 * 24
            respSuccess(res, { user, token: req.session.token })
        }
    } else {
        respSuccess(res, { user, token: req.session.token })
    }
})

app.post('/capture/:paymentId', async function (req, res) {
    try {
        const result = await captureRazorPayPayment(req, res)
    } catch (error) {

    }
    // res.send('Its delete records  live')
})

async function indexing() {
    await checkIndices()
    await putMapping()
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

app.use(router)

server.listen(tradeDb.server_port);

server.on('error', (e) => {
    console.log(e, "Can't start the server!");
    Logger.error(e)
});

server.on('listening', () => {
    console.log(`Listening:${server.address().port}`);
    Logger.info(`Listening:${server.address().port}`)
});

if (env.NODE_ENV === "production") {
    const queSms = cron.schedule('* * * * *', async () => {
        queSms.stop()
        console.log('-------------------- queSms file cron start --------------------', new Date());
        await sendQueSms()
        console.log('-------------------- queSms file cron completed --------------------', new Date())
        queSms.start()
    })
    queSms.start()
}

if (env.NODE_ENV === "production" || env.NODE_ENV === "staging") {

    const planExpire = cron.schedule('50 23 * * *', async () => { //every day 10 am cron will start
        planExpire.stop()
        console.log('-------------------- planExpire file cron start --------------------', new Date());
        await getExpirePlansCron()
        await getAboutToExpirePlan()
        console.log('-------------------- planExpire file cron completed --------------------', new Date())
        planExpire.start()
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    })
    planExpire.start()

    const queEmail = cron.schedule('* * * * *', async () => {
        queEmail.stop()
        console.log('-------------------- queEmail file cron start --------------------', new Date());
        await sendQueEmails()
        console.log('-------------------- queEmail file cron completed --------------------', new Date())
        queEmail.start()
    })
    queEmail.start()

    const priority = cron.schedule('* * * * *', async () => {
        priority.stop()
        console.log('-------------------- priority file cron start --------------------', new Date());
        await updatePriority()
        console.log('-------------------- priority file cron completed --------------------', new Date())
        priority.start()
    })
    priority.start()

}