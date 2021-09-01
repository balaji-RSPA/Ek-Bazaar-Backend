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
  if (env.NODE_ENV === 'production') {

    url = `mongodb://${tradeDb.host1}:${tradeDb.port},${tradeDb.host2}:${tradeDb.port},${tradeDb.host3}:${tradeDb.port},${tradeDb.host4}:${tradeDb.port}/${tradeDb.database}?replicaSet=${tradeDb.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
    options = {
      ...options,
      keepAlive: true,
      replicaSet: `${tradeDb.replicaName}`,
      // useMongoClient: true,
    }
  } else {

    // options.sslCA = tradeDb.certFileBuf
    // url = `${tradeDb.protocol}://${tradeDb.user}:${tradeDb.password}@${tradeDb.host}/${tradeDb.database}`
    // url = `mongodb://${tradeDb.host1}:${tradeDb.port},${tradeDb.host2}:${tradeDb.port},${tradeDb.host3}:${tradeDb.port}/${tradeDb.database}?replicaSet=${tradeDb.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
    url = `mongodb+srv://tradedbuser:c4Acevcz3V6srqln@ekbazaar-trade.vju7b.mongodb.net/tradedb?retryWrites=true&w=majority`
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

let host = '', conf = {
  host,
  log: 'error',
  sniffOnStart: true,
}
if (env) {
  if (env.NODE_ENV === 'staging' || env.NODE_ENV === 'development') {

    // conf.host = 'tradebazaarapi.tech-active.com:5085'
    // new single node multi shard elasticsearch
    conf.host = '165.22.209.173:9200'

  } else if (env.NODE_ENV === 'production') {

    // host = 'searchtrade.ekbazaar.com:5085'
    // host = 'searchtradetemp.tech-active.com:5085'
    // host = '139.59.19.170:5085'
    // host = '139.59.95.19:5085'
    // host = "167.71.233.251:5085"
    conf.host = "157.245.109.173:5086"

  }

}

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

module.exports = {
  mongoose,
  dbConnection,
  esClient
}