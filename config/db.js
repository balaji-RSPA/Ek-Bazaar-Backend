const mongoose = require('mongoose');
const elasticsearch = require('elasticsearch');
const { env } = process;
const config = require('./config')
const { tradeDb } = config
console.log(env.NODE_ENV, ' elastic search')
function dbConnection() {

  let url, options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
    connectTimeoutMS: 300000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    // reconnectTries: 30,
  };
  // if (env.NODE_ENV === 'production') {

  url = `mongodb://${tradeDb.user}:${tradeDb.password}@${tradeDb.host1}:${tradeDb.port},${tradeDb.host2}:${tradeDb.port},${tradeDb.host3}:${tradeDb.port}/${tradeDb.database}?replicaSet=${tradeDb.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
  options = {
    ...options,
    keepAlive: true,
    replicaSet: `${tradeDb.replicaName}`,
    // useMongoClient: true,
  }
  // } else {

  // url = `mongodb://${tradeDb.user}:${tradeDb.password}@${tradeDb.host}:${tradeDb.port}/${tradeDb.database}`;

  // }
  if (env) {

    // url = `mongodb://${tradedb.user}:${tradedb.password}@${tradedb.host}:${tradedb.port}/${tradedb.database}`
    mongoose.connect(url, options).catch(console.log);

  }

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {

    console.log('DB Connection Succeeded');

  });

  return db;

};

// function elasticSearchConnect() {
let host = ''
if (env) {
  /* if (env.NODE_ENV === 'development') {
    host = 'localhost:9200'
  } else  */if (env.NODE_ENV === 'staging' || env.NODE_ENV === 'development') {

    host = 'tradebazaarapi.tech-active.com:5085'
    // host = 'searchtradetemp.tech-active.com:5085'

  } else if (env.NODE_ENV === 'production') {

    // host = 'searchtrade.ekbazaar.com:5085'
    // host = 'searchtradetemp.tech-active.com:5085'
    host = '139.59.19.170:5085'

  }

}

const es = () => new elasticsearch.Client({
  host,
  log: 'error',
  sniffOnStart: true,
});

const esClient = es();

esClient.ping({
  requestTimeout: 10000
}, (err) => {

  if (err) {

    console.log(err)
    console.error('elasticsearch cluster is down!');

  } else {

    console.log('Everything is ok with elasticsearch');

  }

})
// return esClient
// }

// module.exports = esClient

module.exports = {
  mongoose,
  dbConnection,
  esClient
  // elasticSearchConnect
}