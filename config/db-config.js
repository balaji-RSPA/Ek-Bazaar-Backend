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
}

module.exports = config;
