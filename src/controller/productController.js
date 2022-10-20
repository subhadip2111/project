const productModel = require("../models/productModel")
//const aws = require("../util/aws")
const { uploadFile } = require("../util/aws")

const mongoose = require("mongoose")
const { isValidBody, validBoolean, isValid1, isValidSize, validFormat, isValid2, validSize5, validipic, isValidPrice, isValidObjectId, isValidString } = require("../validation/validation")

const createProduct = async function (req, res) {
    try {
        let requestBody = req.body
        let files = req.files
        let { title, description, price, currencyId, style, availableSizes, installments, isFreeShipping } = requestBody

        if (!isValidBody(requestBody)) return res.status(400).send({ status: false, msg: "provide details" })

        //-------------------------------title--------------------------//
        if (!title) return res.status(400).send({ status: false, message: "title is mandatory" })
        if (!isValid1(title)) return res.status(400).send({ status: false, message: "title Should be Valid" })
        if (!isValidString(title)) return res.status(400).send({ status: false, message: "title Should be fgdValid" })
        if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "title Should be Unique" })

        //-----------------------------description----------------------------//

        if (!description) return res.status(400).send({ status: false, message: "description is mandatory" })
        if (!isValid1(description)) return res.status(400).send({ status: false, message: "description  Should be Valid" })

        //-------------------------------------  validprice--------------------------------//
        if (!price) return res.status(400).send({ status: false, message: "price is mandatory" })
        if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be Valid" })

        //-------------------------------------currencyId-----------------------------------//

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is mandatory" })
        if (currencyId.toUpperCase() != "INR") return res.status(400).send({ status: false, message: "currencyId Should be Valid" })
        requestBody.currencyId = currencyId.toUpperCase()
        requestBody.currencyFormat = "₹"
        //------------------------------------style----------------------------

        if (!style) return res.status(400).send({ status: false, message: "style is mandatory" })
        if (!isValid1(style)) return res.status(400).send({ status: false, message: "style Should be Valid" })
        if (!isValidString(style)) return res.status(400).send({ status: false, message: "style Should Not Contain Numbers" })

        //---------------------------------------------availableSizes---------------------------------------//

        if (!availableSizes) return res.status(400).send({ status: false, message: "availableSizes is mandatory" })
        if (availableSizes !== "S" && availableSizes !== "XS" && availableSizes !== "M" && availableSizes !== "X" && availableSizes !== "L" && availableSizes !== "XXL" && availableSizes !== "XL") { return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" }); }


      //  if(!validipic(requestBody.productImage))return res.status(400).send({ status: false, message: "profileImage is not valid " })

        //---------------------------------------------------isFreeShipping---------------------------------------------------//
        

        if (isFreeShipping != null) {

            if (!(isFreeShipping == "true" || isFreeShipping == "false" || isFreeShipping === Boolean)) {
                return res.status(400).send({ status: false, message: "isFreeShipping in valid" })
            }
        }
        //------------------------------------------installments-----------------------------//
        if (!installments) return res.status(400).send({ status: false, message: "installments is mandatory" })
        if (!(/^-?(0|[1-9]\d*)$/).test(installments)) return res.status(400).send({ status: false, message: "installments contant only number" })
        if (!(files && files.length > 0)) return res.status(400).send({ status: false, message: "product image is mandatory" })
        let imageUrl = await uploadFile(files[0])
       // if(!validipic(requestBody.productImage))return res.status(400).send({ status: false, message: "profileImage is not valid " })
        requestBody.productImage = imageUrl
        
        let productCreated = await productModel.create(requestBody)
        return res.status(201).send({ status: true, message: "Success", data: productCreated })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



const getProduct = async function (req, res) {
    try {
        let data = req.query
        let { size, priceSort, priceLessThan, priceGreaterThan, name } = data

        let filter = { isDeleted: false }
        if (Object.keys(data).length > 0) {
            if (data.size != null) {
                if (size.length > 0) {
                    size = size.toUpperCase()
                    if (size !== "S" && size !== "XS" && size !== "M" && size !== "X" && size !== "L" && size !== "XXL" && size !== "XL") { return res.status(400).send({ status: false, message: "AvailableSizes should be among ['S','XS','M','X','L','XXL','XL']" }); }
                    filter["availableSizes"] = { $in: size };
                } else {
                    return res.status(400).send({ status: false, message: "Provide The size as u have selected" });
                }
            }

            //filtering through name key(title)
            if (name != null) {
                if (name.trim().length > 0) {
                    filter["title"] = { $regex: name };
                } else {
                    return res.status(400).send({ status: false, message: "Provide The name as u have selected" });
                }
            }

            if (priceGreaterThan && priceLessThan) {
                filter.price = { $gt: priceGreaterThan, $lt: priceLessThan }
            }
            if (priceGreaterThan && !priceLessThan) {
                filter.price = { $gt: priceGreaterThan }
            }
            if (priceLessThan && !priceGreaterThan) {
                filter.price = { $lt: priceLessThan }
            }

        } else
            return res.status(200).send({ status: true, message: 'Plese give some data for filter' })
        const findProduct = await productModel.find(filter).sort({ price: priceSort })
        if (!findProduct || findProduct.length <= 0) { return res.status(400).send({ message: "product not found" }) }
        else {
            return res.status(200).send({ status: true, message: 'Success', data: findProduct })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

// size && name  not done 




//-----------------------------------------------getbyid-----------------------------------------------------------------------------//
const getProductsById = async function (req, res) {
    try {
        const productId = req.params.productId


        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!product) {
            return res.status(404).send({ status: false, message: `product does not exists or alreday deleted` })
        }

        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//-----------------------------------------------uodateproduct------------------------------------------------------------------//
const updateProductDetails = async function (req, res) {
    try {
        const productId = req.params.productId
        const files = req.files
        const updateData = req.body
        let { title, description, price, style, availableSizes, installments, isFreeShipping } = updateData
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "invalid product Id" })

        let findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(404).send({ status: false, msg: "Product not found" })
        if ((Object.keys(updateData).length == 0)) return res.status(400).send({ status: false, msg: "please provide data for update" })
        if (files && files.length > 0) {
            let image = await uploadFile(files[0])
            updateData.profileImage = image
            if (!validipic(updateData.profileImage)) return res.status(400).send({ status: false, message: "profileImage is not valid " })
        }

        //---------------------------------title-validations-------------------------------------------------------//
        if (typeof title != "undefined") {
            if (!isValid1(title)) return res.status(400).send({ status: false, message: "title Should be Valid" })
            if (!isValidString(title)) return res.status(400).send({ status: false, message: "title should not contain number" })
            if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "title Should be Unique" })
        }

        //-----------------------------------------description-----------------------------------------------------------------------//

        if (description != undefined) {
            if (!isValid1(description)) return res.status(400).send({ status: false, message: "description Should be Valid" })
        }
        //-------------------------------------------------------price----------------------------------------------------------------//
        if (price != undefined) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be Valid" })
        }
        //-----------------------------------------------------style--------------------------------------------------------------------//
        if (style != undefined) {
            if (!isValid1(style)) return res.status(400).send({ status: false, message: "style Should be Valid" })
            if (!isValidString(style)) return res.status(400).send({ status: false, message: "style Should Not Contain Numbers" })

        }
        //-------------------------------------------isFreeShipping-----------------------------------------------//

        if (isFreeShipping != null) {
            if (!(isFreeShipping == "true" || isFreeShipping == "false" || isFreeShipping === Boolean)) {
                return res.status(400).send({ status: false, message: "isFreeShipping in valid" })
            }
        }
        //------------------installment-------------------------------------------------//
        if (installments != undefined) {
            if (!(/^-?(0|[1-9]\d*)$/).test(installments)) return res.status(400).send({ status: false, message: "installments contant only number" })

        }
        //------------------------------------availableSizes--------------------------------------------//

        if (availableSizes != undefined) {

            let size = availableSizes.toUpperCase()
            console.log(size);
            availableSizes = size
            if (!isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, msg: "not a valid size" })
            }
            availableSizes = { $slice: size }
            req.body["availableSizes"] = size
            console.log(availableSizes)
        }
        const updateDetails = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, updateData, { new: true }).select({ __v: 0 })
        return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//---------------------------------------------deletedproduct---------------------------------------------------------------------------//
const deleteProduct = async function (req, res) {
    try {

        const productId = req.params.productId
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
        }


        const product = await productModel.findOne({ _id: productId })

        if (!product) {
            return res.status(400).send({ status: false, message: `Product doesn't exists by ${productId}` })
        }
        if (product.isDeleted == false) {
            await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })

            return res.status(200).send({ status: true, message: "Product deleted successfully." })
        }
        return res.status(400).send({ status: true, message: "Product has been already deleted." })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//create ,getProductsById,deleteProduct, done 


module.exports = { createProduct, getProductsById, deleteProduct, updateProductDetails, getProduct }