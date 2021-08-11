const mongoose = require('mongoose');
const elasticsearch = require('elasticsearch');
const { env } = process;
const config = require('./config');
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
  if (env.NODE_ENV !== 'production') {

    // console.log("🚀 ~ file: db.js ~ line 23 ~ dbConnection ~ tradeDb", tradeDb)
    url = `mongodb://${tradeDb.host1}:${tradeDb.port},${tradeDb.host2}:${tradeDb.port},${tradeDb.host3}:${tradeDb.port},${tradeDb.host4}:${tradeDb.port}/${tradeDb.database}?replicaSet=${tradeDb.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
    options = {
      ...options,
      keepAlive: true,
      replicaSet: `${tradeDb.replicaName}`,
      // useMongoClient: true,
    }
  } else {

    // options.sslCA = tradeDb.certFileBuf
    // url = `mongodb+srv://${tradeDb.user}:${tradeDb.password}@${tradeDb.host}/${tradeDb.database}?authSource=admin&replicaSet=${tradeDb.replicaName}`
    // url = `mongodb+srv://tradedb:9Hp5aTDMVac3LTWg@tradebazaar.v46kj.mongodb.net" target="_blank" rel="noopener noreferrer">=!=bvtySeZ5pw9EqyoyQ=!=Hp5aTDMVac3LTWg@tradebazaar.v46kj.mongodb.net/test?authSource=admin&replicaSet=atlas-10w371-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`
    url = `${tradeDb.protocol}://${tradeDb.user}:${tradeDb.password}@${tradeDb.host}/${tradeDb.database}`
  }
  if (env) {

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
let host = '', conf = {
  host,
  log: 'error',
  sniffOnStart: true,
}
if (env) {
  if (env.NODE_ENV !== 'development') {

    conf = {
      host: 'https://elastic:KYM6BwR6Am9a7gcnnn2My9ZL@ekbazaar-tradesearch.es.ap-south-1.aws.elastic-cloud.com:9243',
      log: 'error',
      // sniffOnStart: true,
    }

  } else if (env.NODE_ENV === 'staging') {

    conf.host = 'tradebazaarapi.tech-active.com:5085'

  } else if (env.NODE_ENV !== 'production') {

    conf.host = "157.245.109.173:5086"

  }

}

console.log("🚀 ~ file: db.js ~ line 85 ~ elasticSearchConnect ~ conf", conf)
const es = () => new elasticsearch.Client({
  ...conf
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