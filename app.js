const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const pageRoute = require("./routes/pageRoute");

const app = express();

// Connect to Database
mongoose
  .connect("mongodb://localhost/chatapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully.");
  });

// Template Engine
app.set("view engine", "ejs");

// Global Variable
global.userAuth = null;

// Middlewares
app.use(express.static("public"));
app.use(express.json()); //for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(
  session({
    secret: "my_keyboard_cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost/chatapp",
    }),
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

// Routes
/*app.use("*", (req, res, next) => {
  userAuth = req.session.userId;
});*/
app.use("/", pageRoute);

const port = 5000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});
