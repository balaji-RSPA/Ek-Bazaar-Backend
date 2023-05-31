if (process.env.NODE_ENV === "production") {
    config = {
        host: "tenderdb.ekbazaar.com",
        port: "5006",
        user: "tender",
        password: "Bamfesh7grer",
        database: "tender",
    }
} else {
    config = {
        host: "139.59.46.227",
        port: "5006",
        user: "beta",
        password: "active.123",
        database: "ekbazarsample-beta",
    }

    // config = {
    //     // stating server db 
    //     protocol: 'mongodb',
    //     host1: "159.89.166.142",
    //     host2: "143.110.249.95",
    //     host3: "143.110.254.145",
    //     port: "5006",
    //     user: "tradelive",
    //     password: "jiarkerc9Om",
    //     database: "trade-live",
    //     replicaName: "rs2",
    //     // user: "tradeapi",
    //     // password: "Oyljeabr6Orc",
    //     // database: "tradeapi",
    //     server_port: "8070",

    //     // // stating test server db 
    //     // protocol: 'mongodb',
    //     // host1: "159.89.166.142",
    //     // host2: "143.110.249.95",
    //     // host3: "143.110.254.145",
    //     // port: "5006",
    //     // user: "newtradedb",
    //     // password: "clid9Quim",
    //     // database: "newtradedb",
    //     // replicaName: "rs2",
    //     // // user: "tradeapi",
    //     // // password: "Oyljeabr6Orc",
    //     // // database: "tradeapi",
    //     // server_port: "8070",
    // }
}

module.exports = config;
