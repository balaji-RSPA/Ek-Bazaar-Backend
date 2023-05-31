const mongoose = require('mongoose');
const config = require('./db-config')
const userSchema = require('../model/user')

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
const url = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
// let url = `mongodb://${config.host1}:${config.port},${config.host2}:${config.port},${config.host3}:${config.port}/${config.database}?replicaSet=${config.replicaName}&retryWrites=true&isMaster=true&readPreference=primary`;
// url = `mongodb://${config.user}:${config.password}@${config.host1}:${config.port}/${config.database}`;

const conn = mongoose.createConnection(url, options);
if (conn.name) {
    console.log('MongoDB Connected')
} else {
    const error = new Error('MongoDB unable to connect')
    console.error(error);
}
const UserModel = conn.model('users', userSchema)

module.exports = {
    conn,
    UserModel,
}
