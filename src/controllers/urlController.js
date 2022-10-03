const validUrl = require('valid-url')
const shortid = require('shortid')
const Url = require('../models/urlModel')

const redis = require("redis");
const { promisify } = require("util");

const redisClient = redis.createClient(
   14026,
  "redis-14026.c17.us-east-1-4.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("9orH2ONkwQY0JzqcxXD118kxuDJw9x0c", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

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

        let cachedURL = await GET_ASYNC(`${urlCode}`)
        if(cachedURL){
            return res.status(302).redirect(cachedURL)
        }else{
            const data = await Url.findOne({ urlCode: urlCode })
            if (!data) return res.status(404).send({ status: false, message: "Url not found" })
            await SET_ASYNC(`${urlCode}`, data.longUrl)
            return res.status(302).redirect(data.longUrl)
        }
       
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { shortenUrl, originUrl }