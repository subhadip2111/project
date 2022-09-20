// const mongoose = require('mongoose')
// const ObjectId = mongoose.Schema.Types.ObjectId

// const bookSchema = new mongoose.Schema({

//   title: {type : String, required :true, unique : true , trim : true},
//   excerpt: {type : String, required :true, trim : true}, 
//   userId: {type : ObjectId, required : true, ref : 'User' , trim : true},
//   ISBN: {type : String, required : true, unique:true , trim : true},
//   category: {type : [String], required : true},
//   subcategory: [type : [String] , required : true],
//   reviews: {type : Number, default: 0, comment: Holds number of reviews of this book},
//   deletedAt: {Date, when the document is deleted}, 
//   isDeleted: {boolean, default: false},
//   releasedAt: {Date, mandatory, format("YYYY-MM-DD")},
//   createdAt: {timestamp},
//   updatedAt: {timestamp},
// })