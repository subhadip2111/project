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








const updateOrder = async function (req, res) {
    try { 
        const userId = req.params.userId
      const orderId = req.body.orderId
      const status=req.body.status
      const decodedUserId=req.decodedUserId
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid user Id.." })
      const user = await userModel.findById({ _id: userId })
      if (!user) return res.status(404).send({ status: false, message: "userId not found" })
      //---------------------------------------[Authorisaton]-------------------------------------------//
      if(userId!=decodedUserId){ return res.status(403).send({status:false,message:"you are not authorised"})}
      
      if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid order Id.." })
      const newOrder = await orderModel.findById({ _id: orderId })
      if (!newOrder) return res.status(404).send({ status: false, message: "orderId not found" })
  
      if (newOrder.userId != userId) return res.status(400).send({ status: false, message: "userId not found" })
      if (!status) return res.status(400).send({ status: false, message: "status is mandatory" })
      if (!isValidStatus(status)) return res.status(400).send({ status: false, message: "status should be pending, completed,cancelled" })
  const orderUpdate=await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
  
  return res.status(200).send({ status: true,message:'Success',data:orderUpdate})
  }
  
  catch(err){
      return res.status(500).send({ status: false, message: err.message })
  }
  }


//// order done 


module.exports={orderCreation,updateOrder}