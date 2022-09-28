const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const awsController = require('../controllers/awsController')
const middle = require('../middleware/auth')
const express = require('express')
const router = express.Router();

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.post('/books', middle.authenticate, bookController.createBook)

router.get('/books', middle.authenticate, bookController.getBooks)

router.get('/books/:bookId', middle.authenticate, bookController.getBookByParam)

router.put('/books/:bookId', middle.authenticate, bookController.updateBook)

router.delete('/books/:bookId', middle.authenticate, bookController.deleteBookById)

router.post('/books/:bookId/review', reviewController.createReview)

router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)

router.post('/createURL',awsController.sdk)

router.all('/*', (req, res) => { return res.status(400).send({ status: false, message: "Endpoint Is Incorrect" })})






module.exports = router;
