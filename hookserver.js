require("dotenv").config();
const { env } = process;
global.environment = env.NODE_ENV || "production";
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
require('./config/db').dbConnection();
require('./config/tenderdb').conn
const config = require('./config/config')
const { tradeDb } = config
const router = require('./src/routes/hookRoutes');
const crypto = require('crypto')

const app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const server = require("http").Server(app);

app.use(function(req,res, next) {
    const screat = 'lpMc345sdiucht5';
    const target = crypto.createHmac('sha256', screat);
    target.update(JSON.stringify(req.body));
    const digest = target.digest('hex');
    
    console.log(digest, "=======================", req.headers['x-razorpay-signature']);
    if (digest === req.headers['x-razorpay-signature']){
        console.log('------Signature Match------');
        next();
    }else{
        console.log('Signature is not matching....');
    }
});

// app.use(router);

// server.listen(tradeDb.server_port);

// server.on("listening", () => {
//     console.log(`Listening:${server.address().port}`);
// });
