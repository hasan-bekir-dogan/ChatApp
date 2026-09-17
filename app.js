const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const compression = require("compression");

const env = require("./config/env");
const pageRoute = require("./routes/pageRoute");
const userRoute = require("./routes/userRoute");
const personRoute = require("./routes/personRoute");
const profileRoute = require("./routes/profileRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

const sessionStore = MongoStore.create({ mongoUrl: env.mongoUri });

const sessionMiddleware = session({
  name: "chatapp.sid",
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    maxAge: env.sessionMaxAge,
  },
});

const app = express();

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    // The views load Bootstrap, jQuery and SweetAlert2 with inline handlers,
    // so a strict default CSP would break the UI. Everything else stays on.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(
  fileUpload({
    limits: { fileSize: env.uploadMaxBytes },
    abortOnLimit: true,
    responseOnLimit: "Uploaded file is too large.",
  })
);
app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

app.use("/", pageRoute);
app.use("/users", userRoute);
app.use("/person", personRoute);
app.use("/profile", profileRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

app.use((req, res) => {
  res.status(404).render("errors/404");
});

// Central error handler: routes forward failures here instead of leaking
// stack traces or raw driver errors to the client.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (!env.isTest) {
    console.error(error);
  }

  const status = error.status || 500;

  if (req.accepts("json") && !req.accepts("html")) {
    return res.status(status).json({ status: "fail", message: error.message });
  }

  res.status(status).json({
    status: "fail",
    message: status === 500 ? "Something went wrong." : error.message,
  });
});

module.exports = { app, sessionMiddleware, sessionStore };
