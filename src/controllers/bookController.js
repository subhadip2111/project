const bookModel = require("../models/booksModel")
const { isValidName, isValidRequestBody, isPresent, isValidISBN ,isValidExcerpt} = require('../validator/validator')
const mongoose = require('mongoose')
const reviewModel = require('../models/reviewsModel')
const moment = require('moment')
const usersModel = require("../models/usersModel")
const { decode } = require("jsonwebtoken")




const createBook = async function (req, res) {
  try {
    let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt, isDeleted } = req.body

    if (!isValidRequestBody(req.body)) return res.status(400).send({ status: false, message: "please provide some data" })

    if (!isPresent(title)) return res.status(400).send({ status: false, message: "title must be present" })

    if (!isValidName.test(title)) return res.status(400).send({ status: false, message: "title is invalid" })

    let repeatedTitle = await bookModel.findOne({ title: title })

    if (repeatedTitle) return res.status(400).send({ status: false, message: "Title is already in use" })

    if (!isPresent(excerpt)) return res.status(400).send({ status: false, message: "Excerpt must be present" })

    if (!isValidExcerpt.test(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is invalid" })

    if (!isPresent(userId)) return res.status(400).send({ status: false, message: "UserId must be present" })

    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId must be a valid ObjectId" })

    let checkUser = await usersModel.findById({_id : userId})
    console.log(checkUser)

    if (!checkUser) return res.status(404).send({ status: false, message: "User not found" })

    if (checkUser._id != req.decodedToken.userId) return res.status(403).send({ status: false, message: "Unauthorized User" })

    if (!isPresent(ISBN)) return res.status(400).send({ status: false, message: "ISBN must be present" })

    if (!isValidISBN.test(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN" })

    let repeadtedISBN = await bookModel.findOne({ ISBN: ISBN })

    if (repeadtedISBN) return res.status(400).send({ status: false, message: "ISBN is already present" })

    if (!isPresent(category)) return res.status(400).send({ status: false, message: "category must be present" })

    if (!isValidName.test(category)) return res.status(400).send({ status: false, message: "Enter a valid category" })

    if (!isPresent(subcategory)) return res.status(400).send({ status: false, message: "subcategory must be present" })

    if (!isValidName.test(subcategory)) return res.status(400).send({ status: false, message: "Enter a valid subcategory" })

    if (!isPresent(releasedAt)) return res.status(400).send({ status: false, message: "releasedAt must be present" })

    //.isValid : function of moment lib. to check the valid date
    if (!moment(releasedAt, "YYYY-MM-DD").isValid())
      return res.status(400).send({
        status: false,
        message: "Enter a valid date with the format (YYYY-MM-DD).",
      });

    if (isDeleted === true) return res.status(400).send({ status: false, message: "Cannot Delete While Creation" })

    let createBook = await bookModel.create(req.body)

    return res.status(201).send({ status: true, message: "Successfully Created the book", data: createBook })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

const getBooks = async function (req, res) {
  try {
    let filter = { isDeleted : false}
    let { userId, category, subcategory } = req.query

    if (!isValidRequestBody(req.query)){
      let getAllBooks= await bookModel.find()
      return res.status(200).send({status:true,data:getAllBooks})
    }
     
    
    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "UserId must be a valid ObjectId" })
    }

    let findBook = await bookModel.find({$and : [req.query ,filter]}).sort({ title: 1 }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
    
    if(findBook.length != 0) return res.status(200).send({ status: true, data: findBook })

    return res.status(404).send({ status: false, msg: "No Document Found as per filter key" })

  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

const getBookByParam = async function (req, res) {
  try {
    
    let bookId = req.params.bookId

    if (!bookId) return res.status(400).send({ status: false, message: "Please Provide BookId" })

    if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })

    let findBook = await bookModel.findById({ _id: bookId })

    if (!findBook) return res.status(404).send({ status: false, message: "No Such Book Exists" })

    if(findBook.isDeleted == true)return res.status(400).send({status:false , message : "Book Is Deleted"})
    
    let reviews = await reviewModel.find({bookId:bookId,isDeleted:false}).select({_id:1,bookId: 1,reviewedBy:1 ,reviewedAt: 1,rating: 1, review: 1})
    console.log(reviews)
    
    let reviewsData ;
    
    if(!reviews.length>0){
       reviewsData = []
    }
    reviewsData = reviews


    //...findBook.toObject() : mongoDb object is diff from JS object
    return res.status(200).send({ status: false, message: "success", data: {...findBook.toObject() , reviewsData  } })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

const updateBook = async function(req,res){
  try {
    
    let bookId = req.params.bookId
   
    if (!bookId) return res.status(400).send({ status: false, message: "Please Provide BookId" })
    
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
    
    let findBook = await bookModel.findById({_id : bookId})

    if(!findBook || findBook.isDeleted == true){
      return res.status(400).send({status:false , message : "Book Does Not Exist"})
    }

   //authorization 
    if(findBook.userId != req.decodedToken.userId)return res.status(403).send({status:false , message : "Unauthorized User"})
    
    let {title , excerpt , releasedAt , ISBN} = req.body
    
    
    if(!isValidRequestBody(req.body))return res.status(400).send({status:false , message : "Enter A Valid Request Body"})
    
    if(isPresent(excerpt)){
    if (!isValidExcerpt.test(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is invalid" })
    }
   
    if(isPresent(releasedAt)){
    if ((!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt)))
      return res.status(400).send({
        status: false,
        message: "Enter a valid date with the format (YYYY-MM-DD).",
      });
    }
   
    if(isPresent(title)){
      if(!isValidName.test(title))return res.status(400).send({ status: false, message: "title is invalid" })
      let repeatedTitle = await bookModel.findOne({title : title})
      if(repeatedTitle)return res.status(400).send({status:false , message : "Title Has To Be Unique"})

    }

    if(isPresent(ISBN)){
    if (!isValidISBN.test(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN" })
    let repeatedISBN = await bookModel.findOne({ISBN:ISBN})
    if(repeatedISBN)return res.status(400).send({status:false , message : "ISBN Has To Be Unique"})
    }

    let updateBook = await bookModel.findByIdAndUpdate(
        {_id : bookId},
        req.body,
        {new:true}
    )
    
    return res.status(200).send({status:true , message : "successfully updated" , data :updateBook })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

const deleteBookById = async function(req,res){
  try {
    
    let bookId = req.params.bookId

    if (!bookId) return res.status(400).send({ status: false, message: "Please Provide BookId" })
 
    if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
  
    let findBook = await bookModel.findById({_id : bookId})

    if(!findBook || findBook.isDeleted == true){
      return res.status(400).send({status:false , message : "Book Does Not Exist Or Is Already Deleted"})
    }

    if(findBook.userId != req.decodedToken.userId)return res.status(403).send({status:false , message : "Unauthorized User"})

    let deleteBook = await bookModel.findByIdAndUpdate(
      {_id: bookId},
      {$set : {isDeleted : true , deletedAt : Date.now()}},
      {new : true}
    )
  
  return res.status(200).send({status:true , message : "Successfully Deleted"})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

//decodeToke.iat

module.exports = { createBook, getBooks, getBookByParam ,updateBook,deleteBookById}


