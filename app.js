const express = require("express");
const pageRoute = require("./routes/pageRoute");

const app = express();

// Template Engine
app.set("view engine", "ejs");

// Middlewares
app.use(express.static("public"));
app.use(express.json()); //for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routes
app.use("/", pageRoute);

const port = 5000;
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});
