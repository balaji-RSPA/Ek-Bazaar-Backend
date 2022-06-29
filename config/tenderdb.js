const mongoose = require("mongoose");
const elasticsearch = require("elasticsearch");
const { env } = process;
const config = require("./config");
const { tenderdb,tradeDb } = config;
const userSchema = require('../src/models/user')
const commonInvoiceSchema = require('../src/models/commonInvoiceSchema');
const sessionSchema = require('../src/models/session')
const sessionLogSchema = require('../src/models/sessionLog')

// const url = `mongodb://${tenderdb.user}:${tenderdb.password}@${tenderdb.host}:${tenderdb.port}/${tenderdb.database}`;
let url;
if(env.NODE_ENV === 'production' /* || env.NODE_ENV === 'staging' */){
    url = `mongodb+srv://tradedbuser:c4Acevcz3V6srqln@ekbazaar-trade.vju7b.mongodb.net/tradedb?retryWrites=true&w=majority`
}
else{

    url = `mongodb://${tradeDb.host1}:${tradeDb.port},${tradeDb.host2}:${tradeDb.port},${tradeDb.host3}:${tradeDb.port}/${tradeDb.database}?replicaSet=${tradeDb.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
}


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
if (conn.name) {
    console.log('tenderdb connected')
} else {
    const error = new Error('tenderdb unable to connect')
    console.error(error);
}
const userModel = conn.model('users', userSchema)
const sessionModel = conn.model('sessions', sessionSchema)
const sessionLogModel = conn.model('sessionLogs', sessionLogSchema)
const commonInvoiceModel = conn.model('invoicenumbers', commonInvoiceSchema)
module.exports = {
    conn,
    userModel,
    sessionModel,
    sessionLogModel,
    commonInvoiceModel
}
