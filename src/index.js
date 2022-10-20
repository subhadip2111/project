const express = require("express");
const route = require("./route/route.js");
const mongoose = require("mongoose");
const app = express();
const multer=require("multer")
app.use(multer().any())

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://subhadip:subhadip@cluster0.wn8fb9g.mongodb.net/project5?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
})