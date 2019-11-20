var express = require('express');
var router = express.Router();
const Gpio = require('onoff').Gpio;
const pin13 = new Gpio(13, 'out');

/* GET home page. */
router.post('/', (req, res, next) => {
    console.log("Got frame data", req.body);
    pin13.writeSync(0);
    res.send(200);
});

module.exports = router;
