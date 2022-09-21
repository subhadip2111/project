const jwt = require("jsonwebtoken")
//const bookModel = require("../models/booksModel")


//const authenticate = async function (req, res, next) {
  //   try {
  //     let token = req.headers["x-api-key"] 
  //     if (!token) return res.status(400).send({ status: false, msg: "token must be present in the request header" })
  //     req.token = token
  //     let decodedToken = jwt.verify(token, "Aniket-Subhadeep-Vandana")
  //     if(!decodedToken)return res.status(401).send({status:false,msg:"unauthanticated user"})//how to send this msg in postman response

  //     //req.decodedToken = decodedToken
      
  //   }
  //   catch (err) {
  //     res.status(500).send({ msg: err })
  //   }
  // }

  const authenticate = async function (req, res, next) {

    try {
        // check if token key is present in the header/cookies
        let token = req.headers["x-api-key"];
        // if (!token) token = req.headers["x-api-key"]; //convert key to small case because it will only accept smallcase
        if(!token){
            return res.status(400).send({ status: false, msg: "Token is Missing" });
        }
        
        // Checking if the token is creted using the secret key provided and decode it.
       let decodedToken;
       try{
         decodedToken = jwt.verify(token, "Aniket-Subhadeep-Vandana");

         //req.decodedToken = decodedToken
       }
       catch(err){return res.status(401).send({status:false , message : err.message +","+"Unauthanticated User"})}
       
       if (!decodedToken)
            return res.status(401).send({ status: false, msg: "Authentication Missing. Login is required. Token is invalid" }); 

       
            next()
        
    }
    catch (err) {
        res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })
    }

}

//if Date.now < expirein return "msg"

 

  module.exports.authenticate=authenticate