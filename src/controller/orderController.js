const { isValid, isValidObjectId,isValidRequestBody,isValidStatus, isValidNum} = require('../validation/validation.js')
const userModel = require('../models/userModel');
const cartModel = require('../models/cartModels');
const orderModel = require('../models/orderModels');


const orderCreation = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId } = req.body
        const decodedUserId=req.decodedUserId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })
        const user = await userModel.findOne({ userId: userId })
        if (!user) return res.status(404).send({ status: false, message: "user not found" })

//-----------------------------------------[Authoraisation checking]-----------------------------------------------//

        if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}


        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "invalid cart Id.." })
        const cart = await cartModel.findOne({ _id: cartId }).lean().select({ updatedAt: 0, createdAt: 0, __v: 0, _id: 0 })
        if (!cart) return res.status(404).send({ status: false, message: "cart not found to place an order.." })
        if (cart.items.length == 0) return res.status(404).send({ status: false, message: "Cart is empty... First add Product to Cart." })

        cart.totalQuantity = cart.items.map(x => x.quantity).reduce((x, y) => x + y)

        const orderCreated = await orderModel.create(cart)
        
       
        res.status(201).send({ status: true, message: "Success", data: orderCreated })

        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true })

    }

    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//updateorder-----------------

const updateOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;
        const decodedUserId=req.decodedUserId

        //validating request body.
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: "Invalid request body. Please provide the the input to proceed."});
        }
        //extract params
        const { orderId, status } = requestBody;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }
        const searchUser = await userModel.findOne({ _id: userId });
        if (!searchUser) {
            return res.status(400).send({status: false, message: `user doesn't exists for ${userId}`});
        }

        //Authentication & authorization
        if (searchUser._id.toString() != decodedUserId) {
           return res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            
        }

        if (!orderId) {
            return res.status(400).send({status: false, message: `Order doesn't exists for ${orderId}`});
        }

        //verifying does the order belongs to user or not.
        isOrderBelongsToUser = await orderModel.findOne({ userId: userId });
        if (!isOrderBelongsToUser) {
            return res.status(400).send({status: false, message: `Order doesn't belongs to ${userId}`});
        }

        if (!status) {
            return res.status(400).send({status: false, message: "Mandatory paramaters not provided. Please enter current status of the order."});
        }
        if (!isValidStatus(status)) {
            return res.status(400).send({status: false, message: "Invalid status in request body. Choose either 'pending','completed', or 'cancelled'."});
        }

        //if cancellable is true then status can be updated to any of te choices.
        if (isOrderBelongsToUser["cancellable"] == true) {
            if ((isValidStatus(status))) {
                if (isOrderBelongsToUser['status'] == 'pending') {
                    const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, {
                        $set: { status: status }
                    }, { new: true })
                    return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateStatus })
                }

                //if order is in completed status then nothing can be changed/updated.
                if (isOrderBelongsToUser['status'] == 'completed') {
                    return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in completed status.` })
                }

                //if order is already in cancelled status then nothing can be changed/updated.
                if (isOrderBelongsToUser['status'] == 'cancelled') {
                    return res.status(400).send({ status: false, message: `Unable to update or change the status, because it's already in cancelled status.` })
                }
            }
        }
        //for cancellable : false
        if (isOrderBelongsToUser['status'] == "completed") {
            if (status) {
                return res.status(400).send({ status: false, message: `Cannot update or change the status, because it's already in completed status.` })
            }
        }

        if (isOrderBelongsToUser['status'] == "cancelled") {
            if (status) {
                return res.status(400).send({ status: false, message: `Cannot update or change the status, because it's already in cancelled status.` })
            }
        }

        if (isOrderBelongsToUser['status'] == "pending") {
            if (status) {
                if (status == "cancelled") {
                    return res.status(400).send({ status: false, message: `Cannot cancel the order due to Non-cancellable policy.` })
                }
                if (status == "pending") {
                    return res.status(400).send({ status: false, message: `Cannot update status from pending to pending.` })
                }

                const updatedOrderDetails = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })

                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updatedOrderDetails })
               
            }
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports={orderCreation,updateOrder}