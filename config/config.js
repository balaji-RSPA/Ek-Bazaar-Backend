let config;

console.log("🚀 ~ file: config.js ~ line 4 ~ process.env.NODE_ENV", process.env.NODE_ENV)
if (process.env.NODE_ENV === "production") {
  config = {
    tradeDb: {
      // replicaset
      host1: "159.65.145.186",
      host2: "128.199.29.212",
      host3: "143.110.177.149",
      port: "5006",
      user: "dev",
      password: "active.123",
      database: "tradedb",
      replicaName: "rs1",
      server_port: "8070",
    },
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
} else {
  config = {
    tradeDb: {
      // stating server db 
      host: "tradebazaarapi.tech-active.com",
      port: "5006",
      user: "tradelive",
      password: "jiarkerc9Om",
      database: "trade-live",
      server_port: "8070",

      // Actual Live db dont connect
      // host: "159.65.145.186",
      // port: "5006",
      // user: "dev",
      // password: "active.123",
      // database: "tradedb",
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
