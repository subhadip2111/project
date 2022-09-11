const jwt = require("jsonwebtoken");
const blogModel = require("../model/blogModel");
const mongoose = require("mongoose")

//----------------------------------------------authentication------------------------------------------------------

const authentication = async function (req, res, next) {
  let token = req.headers["x-api-key"];
  try {
    if (!token) {return res.status(404).send({ status: false, msg: "Token is required in header" });  ////////
}
    let decodedtoken = jwt.verify(token,"Chetan-Shubhadip-Priyanka-Rajiv-group-52");
    // console.log(decodedtoken);
    if (!decodedtoken) {return res.status(400).send({ status: false, msg: "Token is not valid" });}

    // const authorid = req.params.authorId;
    // if(!authorid){
    //   return res.status(404).send({ msg: "not present Id" })
    // }
    // const decode = decodedtoken.userId;
    // if (decode != authorid){return res.status(404).send({ msg: "incorrect Id" });}
    next();
  } catch (err) {
    // console.log(err);
    return res.status(500).send({ status: false, msg: err.message });}
};

//----------------------------------------------authorisation------------------------------------------------------

const authorisation = async function (req, res, next) {
  try {
    const Id = req.params.blogId;
    const token = req.headers["x-api-key"];

    const decodedToken = jwt.verify(token, "Chetan-Shubhadip-Priyanka-Rajiv-group-52");
    let tokenId = req.params.blogId;

   let blogId = mongoose.Types.ObjectId.isValid(tokenId)
if(!blogId){
  return res.status(400).send({msg: "id not valid"})
}

    const data = await blogModel.findById(Id);
    if(!data){return res.status(404).send({msg: "data not avilable"})}    //////if i m giving the author id     
    if (decodedToken.userId != data.authorId) {return res.status(401).send({status:false, msg:"you are not authorised"});}
    next();
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });}
};
module.exports.authentication = authentication;
module.exports.authorisation = authorisation;