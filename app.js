require('dotenv').config();
const { env } = process
global.environment = env.NODE_ENV || 'production'

const path = require('path');
const express = require('express')
const session = require("express-session");
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const morgan = require("morgan");
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require("node-cron");

require('./config/db').dbConnection();
require('./config/tenderdb').conn
const Logger = require('./src/utils/logger');
const config = require('./config/config')
const isAuthenticated = require("./sso-tools/isAuthenticated");
const checkSSORedirect = require("./sso-tools/checkSSORedirect");
const { sendQueSms, getExpirePlansCron, sendQueEmails, getAboutToExpirePlan } = require('./src/crons/cron')
const { updatePriority } = require('./src/controllers/web/testController')
const router = require('./src/routes');

const { tradeDb } = config

const app = express();
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true
    })
);
app.use(cors())
app.use(useragent.express());
app.use(fileUpload());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({ limit: '200mb' }));
app.use(express.static(path.join(__dirname, 'public')));
const server = require('http').Server(app);

app.get('/', function (req, res) {
    console.log('Home page')
    res.send('Its trade live')
})

app.get("/api/logged", async (req, res, next) => {
    let user = await checkSSORedirect(req, res, next)
    console.log("🚀 ~ file: app.js ~ line 53 ~ app.get ~ user", user)
    if(user && user.error) {
        res.status(200).json({success: false, message: error})
    } else if(!user) {
        user = await isAuthenticated(req, res, next)    
        if(!user) res.status(200).json({success: false, message: "user is not logged in any app"})
        else res.status(200).json({success: true, user})
    } else {
        res.status(200).json({success: true, user})
    }
})

// app.use(checkSSORedirect());

// app.get("/", isAuthenticated, (req, res, next) => {
//   res.render("index", {
//     what: `SSO-Consumer One ${JSON.stringify(req.session.user)}`,
//     title: "SSO-Consumer | Home"
//   });
// });

// app.use((req, res, next) => {
//   // catch 404 and forward to error handler
//   const err = new Error("Resource Not Found");
//   err.status = 404;
//   next(err);
// });

// app.use((err, req, res, next) => {
//   console.error({
//     message: err.message,
//     error: err
//   });
//   const statusCode = err.status || 500;
//   let message = err.message || "Internal Server Error";

//   if (statusCode === 500) {
//     message = "Internal Server Error";
//   }
//   res.status(statusCode).json({ message });
// });

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