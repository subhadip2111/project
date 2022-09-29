const express = require('express')
const mongoose = require('mongoose')
const app = express()
const router = require('./routes/route')

app.use(express.json())
app.use(express.urlencoded({extended: true}))


mongoose.connect("mongodb+srv://subhadip123:zLd05Hb78G3vrkvS@cluster0.c35uxw1.mongodb.net/subhadip?retryWrites=true&w=majority", 
{useNewUrlParser :true})
.then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))


app.use('/', router)

app.use(function (req, res) {
    return res.status(400).send({ status: false, message: "Path not found, please provide correct path" })
})


app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("Express app running on PORT" + (process.env.PORT || 3000))
})

