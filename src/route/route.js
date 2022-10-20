const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");
const { authentication } = require("../middleware/auth");
const productController=require("../controller/productController")
const cartController=require("../controller/cartController")
//-------------------------userApi------------------------//
router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile",authentication,userController.getUser)
router.put("/user/:userId/profile",authentication,userController.updateUserDetails)
//-----------------------productApi-------------------------------/

router.post('/products', productController.createProduct)
router.get('/products/:productId',productController.getProductsById)
router.delete('/products/:productId',productController.deleteProduct)
router.get('/products', productController.getProduct)
router.put('/products/:productId',productController.updateProductDetails);

//-----------------------------------cart-------------------------------------------//
router.post('/users/:userId/cart',authentication,cartController.createCart)
router.put('/users/:userId/cart',authentication,cartController.updateCart)
router.get('/users/:userId/cart',authentication,cartController.getCart)
router.delete('/users/:userId/cart',authentication,cartController.deleteCart)

//------------------------order---------------------------------------//
router.post('/users/:userId/orders',authentication,orderController.orderCreation)
router.put('/users/:userId/orders',authentication,orderController.updateOrder)



router.all("/*", function (req, res) {
  res.status(400).send("Invalid request....!!!");
});

module.exports = router;