const authorModel = require("../model/authorModel");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const { validValue, valid, validPassword } = require("../validation/validators");

const createAuthor = async function (req, res) {
  try {

// -------------------------------------------fname------------------------------------------------------
    const data = req.body;

    const {password, email, fname, lname, title} = data

    if (!valid(fname)) {return res.status(404).send({ status: false, msg: "User first name is required" });}

    if (!validValue(fname)) return res.status(404).send({ status: false, msg: "First name is invalid" });
    
    // ----------------------------------------lname------------------------------------------------------

    if (!valid(lname)) {return res.status(404).send({ status: false, msg: "User last name is required" });}
      
    if (!validValue(lname)) {return res.status(404).send({ status: false, msg: "Last name is invalid" });}

    // ----------------------------------------password------------------------------------------------------

    if (!validPassword(password)) {return res.status(400).send({status: false, msg: "minimum 8 character,a number special character and should have both upper and lowercase alphabet",});}

// ----------------------------------------tittle------------------------------------------------------

    if (!data.title && typeof data.title != "string") { return res.status(400).send({ status: false, msg: "Tittle must be required" });}

    data.title=data.title.trim()
    
    
    if (data.title !== "Mr" && data.title !== "Mrs" && data.title !== "Miss") {return res.status(400).send({ status: false, msg: "Tittle is not valid" });}

// ----------------------------------------email------------------------------------------------------

    if (!data.email || typeof data.email != "string") {res.status(404).send({ status: false, msg: "Email-Id is not avilable" });}

    if (!validator.validate(data.email)) {return res.status(400).send({status: false, msg: "Email-Id is invalid",});
}

    let checkEmail = await authorModel.findOne({ email: data.email });
    if (checkEmail) {return res.status(404).send({ msg: "no duplicate email entered" });}

// ---------------------------------------------create-------------------------------------------------------------

    let savedata = await authorModel.create(data);
    res.status(201).send({ status: true,data: savedata });
  } catch (error) {res.status(500).send({ status: false, msg: error.message });}
};

//----------------------------------------------loginCheck------------------------------------------------------
const loginCheck = async function (req, res) {
  try {
  let Username = req.body.email;
  let password = req.body.password;
  let user = await authorModel.findOne({email: Username, password: password});
  if(!user){return res.status(400).send({msg: "email or paaword is wrong"})}
  let token = jwt.sign({ userId: user._id.toString(), group: 52 },"Chetan-Shubhadip-Priyanka-Rajiv-group-52");
  res.setHeader("x-api-key", token);
  res.status(201).send({ status: true, data:{token:token} });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports.createAuthor = createAuthor;
module.exports.loginCheck = loginCheck;