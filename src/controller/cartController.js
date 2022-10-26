const { toCollectionName } = require('mongoose/lib/utils')
const cartModel = require('../models/cartModels')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const { isValid, isValidObjectId,isValidRequestBody, validQuantity} = require('../validation/validation.js')
//------------------------------------create cart--------------------------------------------------------//


const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body;
        const { quantity, productId } = requestBody
        
        const decodedUserId=req.decodedUserId
        
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }

        if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}

        if (!isValidObjectId(productId) || !isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid Product Id" })
        }

        if (!isValid(quantity) || !validQuantity(quantity)) {
            return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." })
        }
        //validation ends.

        const findUser = await userModel.findById({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` })
        }

      

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` })
        }

        const findCartOfUser = await cartModel.findOne({ userId: userId }) //finding cart related to user.

        if (!findCartOfUser) {

            //destructuring for the response body.
            var cartData = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity,
                }],
                totalPrice: findProduct.price * quantity,
                totalItems: 1
            }

            const createCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: `Success`, data: createCart })
        }

        if (findCartOfUser) {

 //reduce           //updating price when products get added or removed.
            let price = findCartOfUser.totalPrice + (req.body.quantity * findProduct.price)
            let itemsArr = findCartOfUser.items

            //updating quantity for same productId.
            for (let i=0;i<itemsArr.length;i++) {
                if (itemsArr[i].productId.toString() === productId) {
                    itemsArr[i].quantity += quantity*1
                    console.log(quantity*1)
                    let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }

                    let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

                    return res.status(201).send({ status: true, message: "Success", data: responseData })
                }
            }
            itemsArr.push({ productId: productId, quantity: quantity }) 
console.log(quantity);
            let updatedCart = { items: itemsArr, totalPrice: price, totalItems: itemsArr.length }
            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true })

            return res.status(201).send({ status: true, message: `Success`, data: responseData })
        }
    } catch (err) {
        res.status(500).send({ status: false, data: err.message });
    }
}

//--------------------------------------update cart---------------------------------------------------//

const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let requestBody = req.body;
      const decodedUserId=req.decodedUserId
        //validation starts.
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in body" })
        }
    //Authentication & authorization

      if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}

     

        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, message: "UserId does not exits" })
        }

      
        //Extract body
        const { cartId, productId, removeProduct } = requestBody
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
        }

        //cart validation
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Invalid cartId in body" })
        }
        let findCart = await cartModel.findById({ _id: cartId })
        if (!findCart) {
            return res.status(400).send({ status: false, message: "cartId does not exists" })
        }

        //product validation
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId in body" })
        }
        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, message: "productId does not exists" })
        }

        //finding if products exits in cart
        let isProductinCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })
        if (!isProductinCart) {
            return res.status(400).send({ status: false, message: `This ${productId} product does not exists in the cart` })
        }

        //removeProduct => 0 for product remove completely, 1 for decreasing its quantity.
        if (!((removeProduct == 0) || (removeProduct == 1))) {
            return res.status(400).send({ status: false, message: 'removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) ' })
        }

        let findQuantity = findCart.items.find(x => x.productId.toString() === productId) //returns object

        if (removeProduct == 0) {
            let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity) // substract the amount of product*quantity

            await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })

            let quantity = findCart.totalItems - 1
            let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true }) //update the cart with total items and totalprice

            return res.status(200).send({ status: true, message:"Success", data: data })
        }

        // decrement quantity
        let totalAmount = findCart.totalPrice - findProduct.price
        let itemsArr = findCart.items

        for (let i=0;i<itemsArr.length;i++) {
            if (itemsArr[i].productId.toString() == productId) {
                itemsArr[i].quantity = itemsArr[i].quantity - 1

                if (itemsArr[i].quantity < 1) {
                    await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true })
                    let quantity = findCart.totalItems - 1

                    let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } },
                        { new: true }) //update the cart with total items and totalprice

                    return res.status(200).send({ status: true, message: "Success", data: data })
                }
            }
        }
        let data = await cartModel.findOneAndUpdate({ _id: cartId }, { items: itemsArr, totalPrice: totalAmount }, { new: true })

        return res.status(200).send({ status: true, message:"Success", data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message:  err.message })
    }
}

//---------------------------------getCart------------------------------------------------------------//
const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const decodedUserId=req.decodedUserId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })

        const userExist = await userModel.findById({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: "user not found.." })
        if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}


        const isCartExist = await cartModel.findOne({ userId: userId })
        if (!isCartExist) return res.status(404).send({ status: false, message: "cart does not exist, create first.." })
        return res.status(200).send({ status: true, message: "Success", data: isCartExist })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}
    //-----------------------------------------delete-----------------------------------------------//

 
    const deleteCart = async function(req, res){
        try {
         const userId = req.params.userId

         const decodedUserId=req.decodedUserId

         if (!isValidRequestBody(userId)) return res.send({ status: false, message: "Please enter valid UserId" })
     
         let userExist = await userModel.findById({ _id: userId })
         if (!userExist) return res.status(404).send({ status: false, message: "user not found" })
     //-------------------------------------[authorisation checking]-----------------------------------------//
         if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}

         let cartExist = await cartModel.findOne({ userId: userId })
         if (!cartExist) return res.status(404).send({ status: false, message: "user not found" })
        if(cartExist.totalItems==0) return res.status(204).send({ status: false, message: "There is no product in cart"})
     
         const cartDeleted = await cartModel.findOneAndUpdate({userId: userId}, {item:[], totalPrice:0, totalItems:0}, {new: true})
         return res.status(404).send({ status: true, message: "Cart is empty", data: cartDeleted })
     
        } catch (error) {
         return res.status(500).send({ status: false, error: error.message })
        }

    }

module.exports={createCart ,updateCart, getCart , deleteCart}