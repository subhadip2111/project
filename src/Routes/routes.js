const express = require('express');
const router = express.Router();
const authorController= require("../controller/authorController")
const blogController= require("../controller/blogController")
const middleware = require('../middleware/middleware')


router.get("/test-me", function (req, res) {
    res.send("My first ever  project1  api!")
})
//author
router.post("/Author", authorController.createAuthor)

//loginCheck
router.post("/loginCheck",middleware.authentication,authorController.loginCheck)

//create Blog
router.post("/Blog",middleware.auth1,blogController.createBlog)

//get Blog
router.get("/getBlog/:authorId",middleware.authentication,blogController.getBlog)

//Update Blog
router.put("/blogsss/:blogId",middleware.authorisation,blogController.updateBlog)

//Delete Blog by Specific Id
router.delete("/blogs/:blogId", blogController.deleteBlog)

//Delete Blog by Using Query
router.delete("/blogs", blogController.deleteBlogByQuery)


module.exports = router;