const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const pageRoute = require("./routes/pageRoute");
const userRoute = require("./routes/userRoute");
const personRoute = require("./routes/personRoute");
const profileRoute = require("./routes/profileRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

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
app.use("*", (req, res, next) => {
  userIn = req.session.userId;
  next();
});
app.use("/", pageRoute);
app.use("/users", userRoute);
app.use("/person", personRoute);
app.use("/profile", profileRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

// 404 not found page (it will be end of the routes)
app.use((req, res, next) => {
  res.status(404).render("errors/404");
});

const port = 5000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});
