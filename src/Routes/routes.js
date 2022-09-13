const express = require('express');
const router = express.Router();
const authorController= require("../controller/authorController")
const blogController= require("../controller/blogController")
const middleware = require('../middleware/middleware')

router.get("/test-me", function (req, res) {
    res.send("My first ever  project1  api!")
})
//author
router.post("/authors", authorController.createAuthor)

//loginCheck
router.post("/login",authorController.loginCheck)

//create Blog
router.post("/blogs",middleware.authentication,blogController.createBlog)

//get Blog
router.get("/blogs",middleware.authentication,blogController.getBlog)

//Update Blog
router.put("/blogs/:blogId",middleware.authentication,middleware.authorisation,blogController.updateBlog)

//Delete Blog by Specific Id
router.delete("/blogs/:blogId",middleware.authentication,middleware.authorisation,blogController.deleteBlog)


//Delete Blog by Using Query
router.delete("/blogs",middleware.authentication,middleware.authorisation1, blogController.deleteBlogByQuery)


router.all("/*", function (req, res) {
    res.status(400).send({ status: false, message: "invalid http request" });
  });
  


module.exports = router;