const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const aws = require("../util/aws")
const jwt = require("jsonwebtoken")
const { uploadFile } = require("../util/aws")

const mongoose = require("mongoose")
const { isValidRequestBody, ValidName, validipic, isValidPassword, validPincode, isValidString, ValidEmail, ValidPhone, isValid, isValidObjectId } = require("../validation/validation")

const createUser = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        if (!isValidRequestBody(data)) return res.send({ status: false, message: "body can not be empty" })
        const { fname, lname, email, phone, profileImage, password, address } = data

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "first name required " })
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is required" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is required" })
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })

        if (!ValidName(fname)) return res.status(400).send({ status: false, message: "first name is incorrect" })
        if (!ValidName(lname)) return res.status(400).send({ status: false, message: "last name is incorrect" })
        if (!ValidEmail(email)) return res.status(400).send({ status: false, message: "email is incorrect" })
        if (!ValidPhone(phone)) return res.status(400).send({ status: false, message: "phone is incorrect" })
        if (!isValidPassword.test(password)) return res.status(400).send({ status: false, message: "enter correct password type" })

        const newemail = await userModel.findOne({ email });
        if (newemail) return res.status(200).send({ status: false, message: " email  is already present" })
        const newphone = await userModel.findOne({ phone });
        if (newphone) return res.status(200).send({ status: false, message: "phone number is already present" })
        const bcryptPassword = await bcrypt.hash(password, 10)
        data.password = bcryptPassword
        if (files.length == 0) { return res.status(400).send({ status: false, message: "profile Image isrequired" }) }
        if (files && files.length > 0) {
            if (!validipic(files[0].mimetype)) return res.status(400).send({ status: false, message: "profileImage is required gf" })
        }
        let imagenew = await uploadFile(files[0])
        data["profileImage"] = imagenew

        if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "city is required" })
        if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "street is required" })
        if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: " shipping pincode is required" })
        if (!validPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: " invalid  shipping pincode" })

        if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "billing.city is required" })
        if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "billing street is required..!!" })
        if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "billing pincode is required..!!" })
        if (!validPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: " invalid pincode billing" })

        let savedData = await userModel.create(data)
        res.status(201).send({ status: true, message: "success", data: savedData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//-------------------------------------------------------------------------------

const loginUser = async function (req, res) {
    try {
        let requestBody = req.body
        const { email, password } = requestBody
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is  required" })
        if (!ValidEmail(email)) return res.status(400).send({ status: false, message: "email is incorrect" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })

        let userLogin = await userModel.findOne({ email: email })
        if (!userLogin) return res.status(404).send({ status: false, message: "Not found" })
        let checkPassword = await bcrypt.compare(password, userLogin.password)
        if (!checkPassword) return res.status(404).send({ status: false, message: "Password not valid" })

        let token = jwt.sign({
            userId: userLogin._id
        }, "e-website@project5", { expiresIn: '24h' }
        )
        res.setHeader("Authorization", token)
        return res.status(200).send({ status: true, message: "User loged in successfully", data: token })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//----------------------------------------------------------------------------------------------------


const getUser = async function (req, res) {
    try {
        const userId = req.params.userId
        const decodedUserId = req.decodedUserId
       
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id" })

        const findUserId = await userModel.findById({ _id: userId })
        if (!findUserId) return res.status(404).send({ status: false, message: "user details not found" })
        if (userId != decodedUserId) { return res.status(403).send({ status: false, message: "you are not authorised" }) }
        return res.status(200).send({ status: true, message: "User profile details", data: findUserId })

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//-----------------------------------------------------updateUserDetails--------------------------------------------/

const updateUserDetails = async function (req, res) {
    try {
        const userId = req.params.userId
        const files = req.files
        const updateData = req.body
        const decodedUserId = req.decodedUserId
    
       
        const { address, fname, lname, email, phone, password } = updateData

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "invalid user Id" })
        let findUserId = await userModel.findById({ _id: userId })
        if (!findUserId) return res.status(404).send({ status: false, msg: "user not found" })
        //authorisation
        if (userId != decodedUserId) { return res.status(403).send({ status: false, message: "you are not authorised" }) }
        if ((Object.keys(updateData).length == 0)) return res.status(400).send({ status: false, msg: "please provide data to update" })///
        if (files.length != 0) {
            let updateProfileImage = await uploadFile(files[0])
            updateData.profileImage = updateProfileImage
        }
        if (fname != null) {
            if (!isValid(fname)) return res.status(400).send({ status: false, msg: "fname is not valid" })
            if (!isValidString(fname)) return res.status(400).send({ status: false, msg: "fname should not contain number" })
        }
        if (lname != null) {
            if (!isValid(lname)) return res.status(400).send({ status: false, msg: "lname is not valid" })
            if (!isValidString(lname)) return res.status(400).send({ status: false, msg: "lname should not contain number" })
        }
        if (email != null) {
            if (!ValidEmail(email)) return res.status(400).send({ status: false, msg: "email is not valid" })
        }

        if (phone != null) {
            if (!ValidPhone(phone)) return res.status(400).send({ status: false, msg: "phone is not valid" })
        }
        if (password != null) {
            if (!isValid(password)) return res.status(400).send({ status: false, msg: "password is not valid" })
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password not valid..password length should be min 8 max 15 charavters " })
            updateData.password = await bcrypt.hash(password, 10)
        }

        if (req.body.profileImage && !validipic(req.body.profileImage)) {
            if (files.length == 0) return res.status(400).send({ status: false, msg: "image d" })
            return res.status(400).send({ status: false, msg: "image forrmat is not valid" })
        }

        //  if(req.body.profileImage == null) return res.status(400).send({ status: false, msg: "image forrmat isvsvs not valid" })
        if (address && address.shipping) {
            if (address.shipping.street !== undefined && !isValid(address.shipping.street)) return res.status(400).send({ status: false, msg: "street is required" })
            if (!isValidString(address.shipping.street)) return res.status(400).send({ status: false, msg: "give street in string format " })
            if (address.shipping.city !== undefined && !isValid(address.shipping.city)) return res.status(400).send({ status: false, msg: "city is required" })
            if (!isValidString(address.shipping.city)) return res.status(400).send({ status: false, msg: "city in string format" })
            if (address.shipping.pincode !== undefined && !isValid(address.shipping.pincode)) return res.status(400).send({ status: false, msg: "pincode is required" })
            if (!isValidString(address.shipping.pincode)) return res.status(400).send({ status: false, msg: " pincode in string format" })
        }

        if (address && address.billing) {
            if (address.billing.street !== undefined && !isValid(address.billing.street)) return res.status(400).send({ status: false, msg: "billing is required" })
            if (!isValidString(address.billing.street)) return res.status(400).send({ status: false, msg: "street in string format only" })
            if (address.billing.city !== undefined && !isValid(address.billing.city)) return res.status(400).send({ status: false, msg: "billing city" })
            if (!isValidString(address.billing.city)) return res.status(400).send({ status: false, msg: "city in string format only" })
            if (address.billing.pincode !== undefined && !isValid(address.billing.pincode)) return res.status(400).send({ status: false, msg: "pincode billing" })
            if (!isValidString(address.billing.pincode)) return res.status(400).send({ status: false, msg: "pincode in string format only" })
        }

        const updateDetails = await userModel.findByIdAndUpdate({ _id: userId }, updateData, { new: true },)

        return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


module.exports = { createUser, loginUser, getUser, updateUserDetails }