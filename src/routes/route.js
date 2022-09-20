const userController = require('../controllers/userController')
const express= require('express')
const router = express.Router();

router.post('/register' , userController.createUser)

router.post('/login',userController.loginUser)

router.all('/*',(req,res)=>{return res.status(400).send({status : false , message : "Endpoint Is Incorrect"})})




module.exports=router;
