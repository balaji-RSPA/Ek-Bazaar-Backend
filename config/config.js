let config;
if (global.environment === "production") {
  config = {
    host: "tradebazaarapi.tech-active.com",
    port: "5006",
    user: "tradeapi",
    password: "Oyljeabr6Orc",
    database: "tradeapi",
    server_port: "8070",
  };
} else {
  config = {
    tradedb: {
      host: "tradedb.ekbazaar.com",
      port: "5006",
      user: "trade",
      password: "jiarkerc9Om",
      database: "trade",
      server_port: "8070",
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
