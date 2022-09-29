const express = require('express')
const router = express.Router();
const {shortenUrl, originUrl} = require('../controllers/urlController')

router.post("/url/shorten", shortenUrl)
router.get("/:urlCode", originUrl)


module.exports = router