const express = require('express')
const router = express.Router()

const collegeController = require("../controllers/collegeControllers")

const internController = require("../controllers/internControllers")

// -----------------------Create college---------------------------------//
router.post("/functionup/colleges", collegeController.createCollege)

//--------------------------Create Intern--------------------------------//
router.post("/functionup/interns", internController.createIntern)

//--------------------------college Details-------------------------------//
router.get("/functionup/collegeDetails", collegeController.CollegeDetails)
module.exports = router


router.all('/*',(req,res)=>{return res.status(400).send({status : false , message : "Endpoint Is Incorrect"})})



//

