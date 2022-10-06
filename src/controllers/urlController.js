//----------------------Module Requiring-----------------------//
const validUrl = require('valid-url')
const shortid = require('shortid')
const Url = require('../models/urlModel')

const redis = require("redis");
const { promisify } = require("util");
const timeLimit = 20 * 60;


//--------------------RegeX Validation-----------------//
const regexUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;


//--------------------Redis Connection---------------------------//
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
//--------------------Redis Connection---------------------------//




const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//-----------------------Shortening URL-------------------//
const shortenUrl = async (req, res) => {
    const baseUrl = "http://" + req.get("host")
    const { longUrl } = req.body
    if (!validUrl.isUri(baseUrl)) return res.status(400).send({ status: false, message: "Invalid baseUrl" })
    let urlCode = shortid.generate().toLowerCase()

    if (regexUrl.test(longUrl)) {
        try {
            let cahcelongUrl = await GET_ASYNC(`${longUrl}`);
            if (cahcelongUrl) {
                return res.status(200).send({ status: true, message: "Data from Redis", data: JSON.parse(cahcelongUrl), });
            }
            let url = await Url.findOne({ longUrl }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 });
            if (url) {
                await SET_ASYNC(`${longUrl}`, JSON.stringify(url), "EX", timeLimit);
                return res.status(200).send({ status: true, message: "Already Exist", data: url })
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
        return res.status(400).send({ status: false, message: "longUrl must be present and valid" })
    }
}


//-----------------------Redirecting URL-------------------//
const originUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let cachedURL = await GET_ASYNC(`${urlCode}`)
        if (cachedURL) {
            return res.status(302).redirect(cachedURL)
        } else {
            const data = await Url.findOne({ urlCode: urlCode })
            if (!data) return res.status(404).send({ status: false, message: "Url not found" })
            await SET_ASYNC(`${urlCode}`, data.longUrl, "EX", timeLimit)
            return res.status(302).redirect(data.longUrl)
        }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { shortenUrl, originUrl }