const mongoose = require('mongoose');
const elasticsearch = require('elasticsearch');
const { env } = process;
const config = require('./config')
const { tradedb } = config

function dbConnection() {

  let url;
  if (env) {

    url = `mongodb://${tradedb.user}:${tradedb.password}@${tradedb.host}:${tradedb.port}/${tradedb.database}`
    mongoose.connect(url, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      autoIndex: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000
    }).catch(console.log);

  }

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {

    console.log('DB Connection Succeeded');

  });

  return db;

};

// function elasticSearchConnect() {
let host = 'localhost:9200'
if (env) {

  if (env.NODE_ENV === 'staging' || env.NODE_ENV === 'development') {

    host = 'tradebazaarapi.tech-active.com:5085'

  } else if (env.NODE_ENV === 'production') {

    host = 'tradesearch.ekbazaar.com:5085'

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