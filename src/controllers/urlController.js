const validUrl = require('valid-url')
const shortid = require('shortid')
const Url = require('../models/urlModel')

const shortenUrl = async (req, res) => {
    const baseUrl = "http://" + req.get("host")
    
    const { longUrl } = req.body
    if (!validUrl.isUri(baseUrl)) return res.status(400).send({ status: false, message: "Invalid baseUrl" })
    let urlCode = shortid.generate().toLowerCase()
    if (validUrl.isUri(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl })
            if (url) {
                return res.status(200).send({ status: false, message: "Already Exist", data: url })
            } else {
                const shortUrl = baseUrl + '/' + urlCode
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                })
                await url.save()
                return res.status(201).send({ status: true, message: "Success", data: url })
            }
        }
        catch (err) {
            console.log(err)
            return res.status(500).send({ status: false, message: err.message })
        }
    } else {
        return res.status(400).send({ status: false, message: "Invalid longUrl" })
    }
}

const originUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        urlCode = urlCode.toLowerCase()
        const data = await Url.findOne({ urlCode: urlCode })
        if (!data) return res.status(404).send({ status: false, message: "Url not found" })
        return res.status(302).redirect(data.longUrl)
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { shortenUrl, originUrl }