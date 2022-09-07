const authorModel = require("../model/authorModel");
const validator = require("email-validator");
const jwt = require("jsonwebtoken")

const createAuthor = async function (req, res) {
  try {
    const data = req.body;
    if (data.fname == null || data.fname == "undefined") {
      return res.status(404).send({status:false, msg: "User first name is required" });
    }

    if (
      (typeof data.fname !== "String" && data.fname.trim().length == 0) ||
      !data.fname.match(/^[A-Za-z]+$/)
    ) {
      return res.status(404).send({status:false, msg: "First name is invalid"});
    }
    // ---------------------------------fname----------------------------------
    if (data.lname == null || data.lname == "undefined") {
      return res.status(404).send({status:false, msg: "User last name is required" });
    }

    // ------------------------------------lname--------------------------------
    if (
      (typeof data.lname !== "String" && data.lname.trim().length == 0) ||
      !data.lname.match(/^[A-Za-z]+$/)
    ) {
      return res.status(404).send({status:false, msg: "Last name is invalid" });
    }

    // ----------------------------------------password--------------------------------
    if (
      !data.password ||
      typeof data.password != "string" ||
      !data.password.match(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
    ) {
      return res.status(400).send({
        status: false,
        msg: "minimum 8 character, a number special charecter and should have both upper and lowercase alphabet",
      });
    }

    // ------------------------------------------------tittle-----------------------------

    if (!data.title || typeof data.title != "string") {
      return res.status(400).send({ status:false, msg: "Tittle must be required" });
    }
    if (data.title != "Mr" && data.title != "Mrs" && data.title != "Miss") {
      return res.status(400).send({status:false, msg: "Tittle is not valid" });
    }

    // ----------------------------------------------email--------------------------------------
    if (!data.email || typeof data.email != "string") {
      res.status(404).send({status:false, msg: "Email-Id is not avilable" });
    }

    if (!validator.validate(data.email)) {
      return res.status(400).send({
        status: false,
        msg: "Email-Id is invalid",
      });
    }

    let checkEmail = await authorModel.findOne({ email: data.email });
    if (checkEmail) {
      return res.status(404).send({ msg: "no duplicate email entered" });
    }
    //  ---------------------------------------------------------------------------------------------

    let savedata = await authorModel.create(data);
    res.status(201).send({ data: savedata });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};




const loginCheck = async function(req,res){
  try{
    let Username = req.body.email
    let password = req.body.password
    let user = await authorModel.findOne({ email : Username, password : password})
    let token = jwt.sign({ userId : user._id.toString(), group: 52},
    "Chetan-Shubhadip-Priyanka-Rajiv-group-52"
    )
    res.setHeader("x-api-key",token)
    res.status(200).send({status : true, msg : token})
    }
    catch (err) {
      console.log(err)
      return res.status(500).send({ status: false, msg: err.message })
    }
 }





module.exports.createAuthor = createAuthor;
module.exports.loginCheck =loginCheck;