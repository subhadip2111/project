const jwt = require("jsonwebtoken")


const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"]
    
    if (!token) return res.status(400).send({ status: false, msg: "token must be present in the request header" })
    
    req.token = token
    
    jwt.verify(token, "Aniket-Subhadeep-Vandana",function(err,decode){
    
      //console.log(err)
    
    if(err){
      return res.status(401).send({ status: false, msg: "unauthanticated user" })
    }
    
    req.decodedToken = decode
    next()
    })
    // if (!decodedToken) return res.status(401).send({ status: false, msg: "unauthanticated user" })
    // console.log(decodedToken)
    // req.decodedToken = decodedToken
  }
  catch (error){
   return res.status(500).send({ msg: error.message })
  }
}
//jwt.verify(token, "Aniket-Subhadeep-Vandana",)



//if Date.now < expirein return "msg"



module.exports.authenticate = authenticate
