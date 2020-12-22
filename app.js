const express = require('express')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const cron = require("node-cron");
const Logger = require('./src/utils/logger');
const useragent = require('express-useragent');
const config = require('./config/config')
const { tradedb } = config

require('dotenv').config();
const { env } = process
const { sellerBulkInsertWithBatch } = require("./src/controllers/web/sellersController")

global.environment = env.NODE_ENV || 'production'
require('./config/db').dbConnection();
require('./config/tenderdb').conn
// require('./config/db').elasticSearchConnect();

const app = express();
const server = require('http').Server(app);

const router = require('./src/routes');
const models = require('./src/models')
// const States = models.States
// const Countries = models.Countries
console.log(env.NODE_ENV, 'node env')

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
  res.send('Hello Babu')
})

app.use(router)

server.listen(tradedb.server_port);

server.on('error', (e) => {

  console.log(e, "Can't start the server!");
  Logger.error(e)

});

if (
  env.NODE_ENV === "production"
) {

  /** cron batch */
  const batch1 = cron.schedule('* * * * *', async () => {
    batch1.stop()
    console.log('batch1 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller1")
    await sellerBulkInsertWithBatch(records)
    console.log('batch1 tenders cron completed+++++', new Date())
    batch1.start()
  })
  batch1.start()

  const batch2 = cron.schedule('* * * * *', async () => {
    batch2.stop()
    console.log('batch2 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller2")
    await sellerBulkInsertWithBatch(records)
    console.log('batch2 tenders cron completed+++++', new Date())
    batch2.start()
  })
  batch2.start()

  const batch3 = cron.schedule('* * * * *', async () => {
    batch3.stop()
    console.log('batch3 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller3")
    await sellerBulkInsertWithBatch(records)
    console.log('batch3 tenders cron completed+++++', new Date())
    batch3.start()
  })
  batch3.start()

  const batch4 = cron.schedule('* * * * *', async () => {
    batch4.stop()
    console.log('batch4 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller4")
    await sellerBulkInsertWithBatch(records)
    console.log('batch4 tenders cron completed+++++', new Date())
    batch4.start()
  })
  batch4.start()

  const batch5 = cron.schedule('* * * * *', async () => {
    batch5.stop()
    console.log('batch5 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller5")
    await sellerBulkInsertWithBatch(records)
    console.log('batch5 tenders cron completed+++++', new Date())
    batch5.start()
  })
  batch5.start()

  const batch6 = cron.schedule('* * * * *', async () => {
    batch6.stop()
    console.log('batch6 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller6")
    await sellerBulkInsertWithBatch(records)
    console.log('batch6 tenders cron completed+++++', new Date())
    batch6.start()
  })
  batch6.start()

  const batch7 = cron.schedule('* * * * *', async () => {
    batch7.stop()
    console.log('batch7 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller7")
    await sellerBulkInsertWithBatch(records)
    console.log('batch7 tenders cron completed+++++', new Date())
    batch7.start()
  })
  batch7.start()

  const batch8 = cron.schedule('* * * * *', async () => {
    batch8.stop()
    console.log('batch8 tenders cron start++++++', new Date());
    const { records } = require("./requests/F&B/seller8")
    await sellerBulkInsertWithBatch(records)
    console.log('batch8 tenders cron completed+++++', new Date())
    batch8.start()
  })
  batch8.start()
}

server.on('listening', () => {

  console.log(`Listening:${server.address().port}`);
  Logger.info(`Listening:${server.address().port}`)

});
