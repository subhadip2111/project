const jwt = require("jsonwebtoken")
//const bookModel = require("../models/booksModel")


  const authenticate = async function (req, res, next) {
    try {
      let token = req.headers["x-api-key"] 
      if (!token) return res.status(400).send({ status: false, msg: "token must be present in the request header" })
      req.token = token
      let decodedToken = jwt.verify(token, "Aniket-Subhadeep-Vandana")
      if(!decodedToken)  return res.status(401).send({status:false,msg:"unauthanticated user"})
      req.decodedToken = decodedToken
      next()
    }
    catch (err) {
      res.status(500).send({ msg: err })
    }
  }
    
        
    
//if Date.now < expirein return "msg"

 

  module.exports.authenticate=authenticate
