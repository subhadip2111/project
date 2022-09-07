const jwt = require("jsonwebtoken")
const blogModel = require("../model/blogModel")
// const authorModel = require("../model/authorModel")


const authentication = async function (req, res, next) {
    let token = req.headers['x-api-key']
    try {
        if (!token) {
            return res.status(404).send({ status: false, msg: "token is required in headers" })
        }
        let authorId = req.params.authorId
        let decodedtoken = jwt.verify(token, "Chetan-Shubhadip-Priyanka-Rajiv-group-52")
        console.log(decodedtoken)
       
        if (decodedtoken.userId!=authorId) {
            return res.status(404).send({ status: false, msg: "invalid userId" })
        }

   


        next();
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }

   
}


const auth1 = async function (req, res, next) {
try {
    let token = req.headers['x-api-key']
    let decodedtoken = jwt.verify(token, "Chetan-Shubhadip-Priyanka-Rajiv-group-52")    
    let id = req.body.authorId;
    if (decodedtoken.userId!=id) {
        return res.status(404).send({ status: false, msg: "userId doesnt exist" })
    } next();
}       
catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, msg: err.message })
}

}
    const authorisation = async function (req, res, next){
        try{
            let blogId = req.params.blogId
            let token = req.headers['x-api-key']
            let decodedToken = jwt.verify(token, "Chetan-Shubhadip-Priyanka-Rajiv-group-52")
            let newss = decodedToken.userId
            let findBlog = await blogModel.findById(blogId);
           console.log(findBlog) // if (findBlog) {
                let old =findBlog.authorId
              if (newss!=old)return res.status(403).send({ status: false, msg:"Author is not authorized to access this data"});
            
              next();
        }
    
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.authentication = authentication;
module.exports.authorisation = authorisation
module.exports.auth1=auth1