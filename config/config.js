const fs = require('fs');
const path = require('path');
var certFileBuf = fs.readFileSync(path.join(__dirname, 'ca-certificate.crt'), { encoding: 'utf8' });
let config;

console.log("🚀 ~ file: config.js ~ line 4 ~ process.env.NODE_ENV", process.env.NODE_ENV)
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
  config = {
    tradeDb: {
      // replicaset
      // host1: "159.65.145.186",
      host1: "157.245.98.215",
      host2: "128.199.29.212",
      host3: "143.110.177.149",
      host4: "142.93.208.201",
      port: "5006",
      user: "dev",
      password: "active.123",
      database: "tradedb",
      replicaName: "rs1",
      server_port: "8070",
    },
    // tradeDb: {
    //   // replicaset
    //   host1: "143.110.184.87",
    //   host2: "139.59.6.17",
    //   host3: "128.199.22.189",
    //   port: "5006",
    //   // user: "root",
    //   // password: "Gill7OfDyogh",
    //   database: "tradedb",
    //   replicaName: "rs1",
    //   server_port: "8070",
    // },
    // tradedb: {
    //   host: "tradedbtemp.tech-active.com",
    //   // host: "tradedb.ekbazaar.com",
    //   port: "5006",
    //   // user: "trade",
    //   // password: "jiarkerc9Om",
    //   // database: "trade",
    //   user: "dev",
    //   password: "active.123",
    //   database: "tradedb",
    // },
    tenderdb: {
      host: "tenderdb.ekbazaar.com",
      port: "5006",
      user: "tender",
      password: "Bamfesh7grer",
      database: "tender",
    }
  };
} /* else if(process.env.NODE_ENV === 'development') {
  config = {
    tradeDb: {
      // stating server db 
      // host: "trade-test-230ce624.mongo.ondigitalocean.com",
      // port: "27017",
      // user: "tradeuser",
      // password: "a7L6q193z80FIw2x",
      // database: "trade-live",
      // certFileBuf,
      // replicaName: "trade-test",
      protocol: 'mongodb+srv',
      database: 'tradedb',
      user: 'tradedb',
      password: '9Hp5aTDMVac3LTWg',
      host: 'tradebazaar.v46kj.mongodb.net',
      server_port: "8070",
    },
    tenderdb: {
      host: "139.59.46.227",
      port: "5006",
      user: "beta",
      password: "active.123",
      database: "ekbazarsample-beta",
    }
  }
} */ else {
  config = {
    tradeDb: {
      // stating server db 
      protocol: 'mongodb',
      host1: "159.89.166.142",
      host2: "143.110.249.95",
      host3: "143.110.254.145",
      port: "5006",
      user: "tradelive",
      password: "jiarkerc9Om",
      database: "trade-live",
      replicaName: "rs2",
      // user: "tradeapi",
      // password: "Oyljeabr6Orc",
      // database: "tradeapi",
      server_port: "8070",

      // // stating test server db 
      // protocol: 'mongodb',
      // host1: "159.89.166.142",
      // host2: "143.110.249.95",
      // host3: "143.110.254.145",
      // port: "5006",
      // user: "newtradedb",
      // password: "clid9Quim",
      // database: "newtradedb",
      // replicaName: "rs2",
      // // user: "tradeapi",
      // // password: "Oyljeabr6Orc",
      // // database: "tradeapi",
      // server_port: "8070",

    },
    tenderdb: {
      host: "139.59.46.227",
      port: "5006",
      user: "beta",
      password: "active.123",
      database: "ekbazarsample-beta",
    },
  };
}

module.exports = config;
