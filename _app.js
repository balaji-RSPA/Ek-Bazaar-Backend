require('dotenv').config();
const { env } = process
global.environment = env.NODE_ENV || 'production'
const express = require('express')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const cron = require("node-cron");
var io = require('socket.io')(http);
const Logger = require('./src/utils/logger');
const useragent = require('express-useragent');
const config = require('./config/config')
const { tradeDb } = config

const { sellerBulkInsertWithBatch } = require("./src/controllers/web/sellersController")
const { captureRazorPayPayment, createPdf } = require('./src/controllers/web/paymentController')
const { deleteRecords } = require('./src/controllers/web/userController')
const { updateSelleProfileChangesToProducts, updateKeywords, sendQueSms, getExpirePlansCron, sendQueEmails, getAboutToExpirePlan } = require('./src/crons/cron')
const { updateLevel2l1Data, updateLevel3l1Data, updatePriority } = require('./src/controllers/web/testController')
require('./config/db').dbConnection();
require('./config/tenderdb').conn
// require('./config/db').elasticSearchConnect();

const app = express();
const server = require('http').Server(app);

const router = require('./src/routes');
const models = require('./src/models')
// const States = models.States
// const Countries = models.Countries

const { suggestions, level1, level2, level3, level4, level5, city, state, country, serviceType, tradeMaster } = require("./elasticsearch-mapping");
const { checkIndices, putMapping, suggestionsMapping } = suggestions
const l1CheckIndices = level1.checkIndices,
    l1PutMapping = level1.putMapping,
    l2CheckIndices = level2.checkIndices,
    l2PutMapping = level2.putMapping,
    l3CheckIndices = level3.checkIndices,
    l3PutMapping = level3.putMapping,
    l4CheckIndices = level4.checkIndices,
    l4PutMapping = level4.putMapping,
    l5CheckIndices = level5.checkIndices,
    l5PutMapping = level5.putMapping,
    cityCheckIndices = city.checkIndices,
    cityPutMapping = city.putMapping,
    stateCheckIndices = state.checkIndices,
    statePutMapping = state.putMapping,
    countryCheckIndices = country.checkIndices,
    countryPutMapping = country.putMapping,
    serviceTypeCheckIndices = serviceType.checkIndices,
    serviceTypePutMapping = serviceType.putMapping,
    tradeMasterCheckIndices = tradeMaster.checkIndicesMaster,
    tradeMasterPutMapping = tradeMaster.putMappingMaster

app.use(useragent.express());
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({ limit: '200mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    console.log('Home page')
    res.send('Its trade live')
})

// app.get('/updateLevel2l1Data', async function (req, res) {
//   try {
//       const result = await updateLevel2l1Data()
//   } catch (error) {

//   }
//   res.send('Its delete records  live')
// })
// app.get('/updateLevel3l1Data', async function (req, res) {
//   try {
//       const result = await updateLevel3l1Data()
//   } catch (error) {

//   }
//   res.send('Its delete records  live')
// })

app.get('/suggestionsMapping', async function (req, res) {
    try {
        const result = await suggestionsMapping()
    } catch (error) {

        res.send(error)
    }
})

app.get('/updatePriority', async function (req, res) {
    try {
        const result = await updatePriority()
    } catch (error) {

        res.send(error)
    }
})

// app.get('/getExpirePlansCron', async function (req, res) {
//   try {
//     const result = await getExpirePlansCron()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })
// app.get('/sendQueEmails', async function (req, res) {
//   try {
//     const result = await sendQueEmails()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })
// app.get('/abouttoexpireplan', async function (req, res) {
//   try {
//     const result = await getAboutToExpirePlan()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// const planExpire = cron.schedule('* * * * *', async () => {
//     planExpire.stop()
//     console.log('-------------------- planExpire file cron start --------------------', new Date());
//     // await getExpirePlansCron()
//     await getAboutToExpirePlan()
//     console.log('-------------------- planExpire file cron completed --------------------', new Date())
//     planExpire.start()
//   })
//   planExpire.start()

// const queEmail = cron.schedule('* * * * *', async () => {
//   queEmail.stop()
//   console.log('-------------------- queEmail file cron start --------------------', new Date());
//   await sendQueEmails()
//   console.log('-------------------- queEmail file cron completed --------------------', new Date())
//   queEmail.start()
// })
// queEmail.start()

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

// app.get('/deleteRecords1', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await deleteRecords({skip : 0, limit : 1000})
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// app.get('/deleteRecords2', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await deleteRecords({skip : 1000, limit : 2000})
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// app.get('/deleteRecords3', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await deleteRecords({skip : 2000, limit : 3000})
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// app.get('/deleteRecords4', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await deleteRecords({skip : 3000, limit : 4000})
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// app.get('/updateSelleProfileChangesToProducts', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await updateSelleProfileChangesToProducts()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

// app.get('/updateKeywords', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await updateKeywords()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })


// app.get('/sendQueSms', async function (req, res) {
//   // console.log('Home page')
//   try {
//     const result = await sendQueSms()
//   } catch (error) {

//   }
//   // res.send('Its delete records  live')
// })

app.get('/createPdf', async function (req, res) {
    // console.log('Home page')
    try {
        const result = await createPdf()
    } catch (error) {

    }
    // res.send('Its delete records  live')
})

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