const userModel = require("../models/usersModel")
const{isValidName , isValidRequestBody , isPresent , isValidMail ,isValidNumber , isvalidPassword} = require('../validator/validator')
const jwt  = require('jsonwebtoken')

const createUser = async function(req,res){
 try {
    let {title , name , phone ,email , password , address} = req.body 

    if(!isValidRequestBody(req.body))return res.status(400).send({status:false , message : "body can't be empty"})
    
    if(!isPresent(title))return res.status(400).send({status:false , message : "title must be present"})

    if(!title.includes("Mr", "Mrs", "Miss"))return res.status(400).send({status:false , message : "title is invalid"})

    if(!isPresent(name))return res.status(400).send({status:false , message : "name must be present"})

    if(!isValidName.test(name))return res.status(400).send({status:false , message : "name is invalid"})

    if(!isPresent(phone))return res.status(400).send({status:false , message : "phone must be present"})

    if(!isValidNumber.test(phone))return res.status(400).send({status:false , message : "phone is invalid"})

    let checkNumber = await userModel.findOne({phone:phone})

    if(checkNumber)return res.status(400).send({status:false , message : "phone number already exists"})

    if(!isPresent(email))return res.status(400).send({status:false , message : "email must be present"})

    if(!isValidMail.test(email))return res.status(400).send({status:false , message : "email is invalid"})

    let checkEmail = await userModel.findOne({email:email})

    if(checkEmail)return res.status(400).send({status:false , message : "email is already registerd"})

    if(!isPresent(password))return res.status(400).send({status:false , message : "password must be present"})

    if(!isvalidPassword.test(password))return res.status(400).send({status:false , message : "password must contain 8 to 15 charactors"})

    let createUser = await userModel.create(req.body)

    return  res.status(201).send({status:true , message : "successfully created" , data : createUser})

} catch (error) {
   return res.status(500).send({status:false , message : error.message})
 }
   
}


const loginUser = async function(req,res){
    try {
        let {email,password} = req.body

        if(!isValidRequestBody(req.body))return res.status(400).send({status:false , message : "body cannot be empty"})
        
        if(!isPresent(email))return res.status(400).send({status:false, message : "email is required"})
        
        if(!isPresent(password))return res.status(400).send({status:false, message : "password is required"})
        
        let findUser = await userModel.findOne({email:email , password:password})
        
        if(!findUser)return res.status(404).send({status:false , message: "User Not Found"})

        let token = jwt.sign(
            {
                userId : findUser._id.toString(),
                groupNumber : 54,
                organisation : "FunctionUP",
                "iat": (new Date().getTime())
            },
            "Aniket-Subhadeep-Vandana",
            { expiresIn: '30mins' }
        
        )

        //how to get exp and iat in response ??
        req.header('x-api-key',token)
        res.status(200).send({status:true , message : "success" ,data: token})
    } catch (error) {
        res.status(500).send({status:false , message : error.message})
    }
}

module.exports = {createUser,loginUser}



