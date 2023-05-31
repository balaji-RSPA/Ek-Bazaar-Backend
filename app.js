require('dotenv').config();
const { env } = process
global.environment = env.NODE_ENV || 'production'
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser')
const morgan = require("morgan");
const bodyParser = require('body-parser');
const engine = require("ejs-mate");
const cors = require('cors');
require('./config/db').conn
const router = require("./router");

const swaggerUi = require('swagger-ui-express');
const swaggerSso = require('./swagger_sso.json');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: [
    /** development **/
    "http://localhost:8085", "http://localhost:8080", "http://localhost:8071", "http://localhost:8081","http://localhost:8086",
    /** ekbazaar beta + live **/
    "https://www.trade.ekbazaar.com", "https://tradebazaar.tech-active.com",
    "https://www.tenders.ekbazaar.com", "https://ekbazaar.tech-active.com",
    "https://www.investment.ekbazaar.com", "https://investment.tech-active.com",
    /** onebazaar beta **/
    "https://onebazaar.tech-active.com",
    "https://tradeonebazaar.tech-active.com",
    "https://tendersonebazaar.tech-active.com",
    "https://investmentonebazaar.tech-active.com",
    "https://v2trade.ekbazaar.com",
    "https://v2trade.onebazaar.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  credentials: true,
}))
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("trust proxy", 1);
const cookieOptions = {
  path: "/",
  expires: 1000 * 60 * 60 * 24 * 15,
  // domain: ".ekbazaar.com",
  // sameSite: "none",
  httpOnly: true,
  // secure: true,
};


app.use(
  session({
    key: "session",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      ...cookieOptions
    },
  })
);
app.use((req, res, next) => {
  console.log(req.session, req.headers);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS, HEAD");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, authorization");
  next();
});
app.use((req, res, next) => {
  console.log(req.session);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan("dev"));
app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use("/simplesso", router);
app.use("/api", router);
app.get("/", (req, res, next) => {
  const user = req.session.user || "unlogged";
  res.render("index", {
    what: `SSO-Server ${user}`,
    title: "SSO-Server | Home",
  });
});

var options = {}

app.use('/api-docs/sso', function (req, res, next) {
  swaggerSso.host = req.get('host');
  req.swaggerDoc = swaggerSso;
  next();
}, swaggerUi.serveFiles(swaggerSso, options), swaggerUi.setup());

app.use((req, res, next) => {
  // catch 404 and forward to error handler
  const err = new Error("Resource Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error({
    message: err.message,
    error: err,
  });
  const statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (statusCode === 500) {
    message = "Internal Server Error";
  }
  res.status(statusCode).json({ message });
});

module.exports = app;
