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
      host: "tradebazaarapi.tech-active.com",
      port: "5006",
      user: "tradeapi",
      password: "Oyljeabr6Orc",
      database: "tradeapi",
      server_port: "8080",
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
