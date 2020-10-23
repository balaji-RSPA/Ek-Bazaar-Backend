let config;
if (global.environment === 'production') {

  config = {
    host: 'tradebazaarapi.tech-active.com',
    port: '5006',
    user: 'tradeapi',
    password: 'Oyljeabr6Orc',
    database: 'tradeapi',
    server_port: '8070'
  }

} else {

  config = {
    host: 'tradebazaarapi.tech-active.com',
    port: '5006',
    user: 'tradeapi',
    password: 'Oyljeabr6Orc',
    database: 'tradeapi',
    server_port: '8070'
  }

}

module.exports = config;

