const express = require('express')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const Logger = require('./src/utils/logger');
const useragent = require('express-useragent');
const config = require('./config/config')

require('dotenv').config();
const { env } = process

global.environment = env.NODE_ENV || 'production'
require('./config/db').dbConnection();

const app = express();
const server = require('http').Server(app);

const router = require('./src/routes/web/locationRoutes');
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

app.get('/', function (req, res){
    console.log('Home page')
    res.send('Hello Babu')
})

app.use(router)

server.listen(config.server_port);

server.on('error', (e) => {

  console.log(e, "Can't start the server!");
  Logger.error(e)

});

server.on('listening', () => {

  console.log(`Listening:${server.address().port}`);
  Logger.info(`Listening:${server.address().port}`)

});
