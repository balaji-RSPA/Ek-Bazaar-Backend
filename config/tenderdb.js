const mongoose = require("mongoose");
const elasticsearch = require("elasticsearch");
const { env } = process;
const config = require("./config");
const { tenderdb } = config;
const userSchema = require('../src/models/user')

const url = `mongodb://${tenderdb.user}:${tenderdb.password}@${tenderdb.host}:${tenderdb.port}/${tenderdb.database}`;
const options = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
};
const conn = mongoose.createConnection(url, options);
if(conn.name) {
    console.log('tenderdb connected')
} else {
    const error = new Error('tenderdb unable to connect')
    console.error(error);
}
const userModel = conn.name ? conn.model('users', userSchema) : ''
module.exports = {
    conn,
    userModel
}
