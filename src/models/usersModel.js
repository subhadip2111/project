const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    title: {type : String, trim : true , enum : ["Mr", "Mrs", "Miss"] , required : true},
    name: {type : String, trim : true , required : true},
    phone: {type : String, trim : true , required : true , unique : true},
    email: {type : String, trim : true , required : true , unique:true}, 
    password: {type : String, trim : true , required : true},
    address: {
    street: {type : String},
    city: {type : String},
    pincode: {type : String}
  },
},{timestamps : true})

module.exports = mongoose.model('User',userSchema)