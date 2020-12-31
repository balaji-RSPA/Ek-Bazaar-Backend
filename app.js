require('dotenv').config();
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

const { env } = process
const { sellerBulkInsertWithBatch } = require("./src/controllers/web/sellersController")
const { deleteRecords } = require('./src/controllers/web/userController')

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
  res.send('Its trade live')
})

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

app.use(router)

server.listen(tradedb.server_port);

server.on('error', (e) => {

  console.log(e, "Can't start the server!");
  Logger.error(e)

});

server.on('listening', () => {

  console.log(`Listening:${server.address().port}`);
  Logger.info(`Listening:${server.address().port}`)

});
