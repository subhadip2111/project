const reviewModel = require('../models/reviewsModel')
const bookModel = require("../models/booksModel") 
const mongoose = require('mongoose')
const { isValidName, isValidRequestBody, isPresent, isValidISBN ,isValidExcerpt} = require('../validator/validator')

const createReview = async function(req,res){
    try {
        let bookIdInParam = req.params.bookId

    if (!bookIdInParam) return res.status(400).send({ status: false, message: "Please Provide BookId" })
 
    if (!mongoose.isValidObjectId(bookIdInParam)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
  
    let findBook = await bookModel.findById({_id : bookIdInParam})

    if(!findBook || findBook.isDeleted == true){
      return res.status(400).send({status:false , message : "Book Does Not Exist Or Is Already Deleted"})
    }

    let {review, rating, reviewedBy , reviewedAt , bookId} = req.body

    if(!isValidRequestBody(req.body))return res.status(400).send({status:false , message : "Body Cannot Be Empty"})

    
    
   if(review){
    if(!isPresent(review))
    return res.status(400).send({status : false , message :"Review Cannot Be Empty" })
   }
    
    if(!isPresent(rating))return res.status(400).send({status : false , message : "Ratings Are Required"})

    if(!(/^[1-5]$/).test(rating))return res.status(400).send({status : false , message : "Rating Has To Contain Numbers From 1 to 5"})

    if(!isPresent(reviewedBy)){
        req.body.reviewedBy = "Guest"
    }else {
        if(!isValidName.test(reviewedBy)){
           return res.status(400).send({status:false , message : "Enter A Valid Reviewer's Name"})
        }
    }
   
    if(!isPresent(reviewedAt)){
        req.body.reviewedAt = Date.now()
    }else {
        if((!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt))){
           return res.status(400).send({status:false , message : "Enter A Valid Date Format"})
        }
    }

    if(!isPresent(bookId)){
        req.body.bookId = bookIdInParam
    }else {
        if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
    }



    let createReview = await reviewModel.create(req.body)
    let updateBook = await bookModel.findByIdAndUpdate(
        {_id : bookIdInParam},
        {$inc : {reviews : +1}},
        {new : true}
    )

    return res.status(200).send({status:true , message : "successfully created" , data : {...updateBook.toObject(),reviewsData :createReview}})
    

        
    } catch (error) {
       return res.status(500).send({status:false , message : error.message})
    }
}

const updateReview = async function(req,res){
    try {
        let bookIdInParam = req.params.bookId

        if (!bookIdInParam) return res.status(400).send({ status: false, message: "Please Provide BookId" })
     
        if (!mongoose.isValidObjectId(bookIdInParam)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
      
        let findBook = await bookModel.findById({_id : bookIdInParam})
    
        if(!findBook || findBook.isDeleted == true){
          return res.status(400).send({status:false , message : "Book Does Not Exist Or Is Already Deleted"})
        }

        let reviewIdinParam = req.params.reviewId

        if (!reviewIdinParam) return res.status(400).send({ status: false, message: "Please Provide ReviewId" })

        if (!mongoose.isValidObjectId(reviewIdinParam)) return res.status(400).send({ status: false, message: "ReviewId Must Be A Valid ObjectId" })
        
        let findReview = await reviewModel.findById({_id : reviewIdinParam})
    
        if(!findReview || findReview.isDeleted == true){
          return res.status(400).send({status:false , message : "Review Does Not Exist"})
        }

        //bookA does not have reviewB how to handle
        
        let {review, rating, reviewedBy } = req.body

        if(!isValidRequestBody(req.body))return res.status(400).send({status:false , message : "Body Cannot Be Empty"})

        if(review){
            if(!isPresent(review))
            return res.status(400).send({status : false , message :"Review Cannot Be Empty" })
           }
        
        if(isPresent(rating)){
            if(!(/^[1-5]$/).test(rating))return res.status(400).send({status : false , message : "Rating Has To Contain Numbers From 1 to 5"})
        }

        if(reviewedBy){
            if(!isPresent(reviewedBy)){
                req.body.reviewedBy = 'Guest'
            }
            if(!isValidName.test(reviewedBy)){
                return res.status(400).send({status:false , message : "Enter A Valid Reviewer's Name"})
             }
        }

        
        let updateReview = await reviewModel.findByIdAndUpdate(
            {_id:reviewIdinParam},
            req.body,
            {new : true}
        )

        return res.status(200).send({status:true , message : "successfully updated" , data : {...findBook.toObject(),reviewsData :updateReview}})



        
    } catch (error) {
        return res.status(500).send({status:false , message : error.message})
    }
}

const deleteReview = async function(req,res){
    try {
        let bookIdInParam = req.params.bookId

        if (!bookIdInParam) return res.status(400).send({ status: false, message: "Please Provide BookId" })
     
        if (!mongoose.isValidObjectId(bookIdInParam)) return res.status(400).send({ status: false, message: "BookId Must Be A Valid ObjectId" })
      
        let findBook = await bookModel.findById({_id : bookIdInParam})
    
        if(!findBook || findBook.isDeleted == true){
          return res.status(400).send({status:false , message : "Book Does Not Exist Or Is Already Deleted"})
        }

        let reviewIdinParam = req.params.reviewId

        if (!reviewIdinParam) return res.status(400).send({ status: false, message: "Please Provide ReviewId" })

        if (!mongoose.isValidObjectId(reviewIdinParam)) return res.status(400).send({ status: false, message: "ReviewId Must Be A Valid ObjectId" })
        
        let findReview = await reviewModel.findById({_id : reviewIdinParam})
    
        if(!findReview || findReview.isDeleted == true){
          return res.status(400).send({status:false , message : "Review Does Not Exist Or Is Already Deleted"})
        }

        let updateReview = await reviewModel.findByIdAndUpdate(
            {_id :reviewIdinParam },
            {$set : {isDeleted : true }},
            {new : true}
        )

        let updateBook = await bookModel.findByIdAndUpdate(
            {_id:bookIdInParam},
            {$inc : {reviews : -1}},
            {new : true}
        )

        return res.status(200).send({status:true , message : "successfully deleted"})
        
    } catch (error) {
        return res.status(500).send({status:false , message : error.message})
    }
}

module.exports = {createReview,updateReview,deleteReview}