const express = require('express');
const route = require('./routes/route.js');
const  mongoose = require('mongoose');
const app = express();
const PORT=process.env.PORT||3000

app.use(express.json());





mongoose.connect("mongodb+srv://panigrahisameer_200:iklsSoxrtvpy4JOK@cluster0.kyd9m93.mongodb.net/group56Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"),
err => console.log(err))


app.use('/', route);


app.listen(  PORT, function () {
    console.log('Express app running on port ' + PORT)
});