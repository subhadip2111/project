const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const route= require('./Routes/routes')

app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://group52_Database:8PHjYSmzAZUGKxzj@cluster0.qz3onpx.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )

  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});