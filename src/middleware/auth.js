const jwt=require('jsonwebtoken')
const userModel=require('../models/userModel')
const {isValidObjectId } = require("../validation/validation")
const authentication= async function(req,res,next){
    try {
        let token=req.header('Authorization').split(" ")[1];
        console.log(req.header)
        if(!token)return res.send({status:false,msg:"Token is require "})
let decodedtoken= await jwt.verify(token,"e-website@project5")
if(!decodedtoken) return  res.status(401).send({status:false,msg:"invalid token "})
req.decodedUserId=decodedtoken.userId
next()
  } catch (err) {
        return res.status(500).send({status:false,message:err.message})
        
    }
}

module.exports={authentication}