const express = require('express')
const router = express.Router();
const {} = require('../models/urlModel')
const {} = require('../controllers/urlController')


router.post("/url/shorten")
router.get("/:urlCode")


module.exports = router