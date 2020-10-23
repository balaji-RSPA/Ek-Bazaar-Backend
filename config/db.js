const mongoose = require('mongoose');
const { env } = process;
const config = require('./config')

function dbConnection () {

  let url;
  if (env) {

    url = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`
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

module.exports = { 
    mongoose,
    dbConnection
}