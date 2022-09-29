const express = require('express')
const router = express.Router();
const {} = require('../models/urlModel')
const {} = require('../controllers/urlController')


// router.post("/url/shorten")
// router.get("/:urlCode")

router.get('/testme', function(req,res){
    res.send("testing url ")
})

module.exports = router