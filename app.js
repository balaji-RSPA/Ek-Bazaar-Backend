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
app.use(
    session({
        key: "userId",
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 1000 * 60 * 60 * 24 * 15,
        },
    })
);
app.use(useragent.express());
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));
const server = require('http').Server(app);

// app.use(_ssoRedirect());
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