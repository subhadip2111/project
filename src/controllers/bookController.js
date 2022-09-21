const bookModel = require("../models/booksModel")
const { isValidName, isValidRequestBody, isPresent, isValidISBN } = require('../validator/validator')
const mongoose = require('mongoose')

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

    if (!isValidName.test(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is invalid" })

    if (!isPresent(userId)) return res.status(400).send({ status: false, message: "UserId must be present" })

    if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "UserId must be a valid ObjectId" })

    let checkUser = await usersModel.findById({ _id: userId })

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
    let { userId, category, subcategory } = req.query

    if (!isValidRequestBody(req.query)) return res.status(400).send({ status: false, message: "Please provide filters" })

    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "UserId must be a valid ObjectId" })
    }

    let findBook = await bookModel.find(req.query).sort({ title: 1 }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

    if (findBook.length != 0) return res.status(200).send({ status: true, data: findBook })

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

    let reviewsData = []
    let bookDetails = Object.assign({ findBook, reviewsData })

    // let reviews = await reviewmodel.find({bookId : bookId}).select({_id:1 , bookId:1 , reviewedBy:1 , reviewedAt:1 , rating:1 , review:1})

    //  if(reviews.length > 0){
    //     findBook["reviewsData"] = reviews
    //  }

    return res.status(200).send({ status: false, message: "success", data: bookDetails })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

//decodeToke.iat

module.exports = { createBook, getBooks, getBookByParam }


