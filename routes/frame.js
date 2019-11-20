var express = require('express');
var router = express.Router();
const Gpio = require('pigpio').Gpio;

/* GET home page. */
router.post('/', (req, res, next) => {
    //console.log("Got frame data", req.body);
    let g = new G35String(13, 36);
    g.set_color(0, 0xcc, g.COLOR_RED);
    res.send(200);
});

function G35String(_pin, _light_count) {
    this.MAX_INTENSITY = 0xcc;
    this.DELAYSHORT = 7;
    this.DELAYLONG = 17;
    this.DELAYEND = 40;
    this.pin = new Gpio(_pin, {mode: Gpio.OUTPUT});
    this.light_count = _light_count;

    this.COLOR_RED = ((0xF) + ((0) << 4) + ((0) << 8));

    this.ZERO = function(x) {
        var waveform = [];
        waveform.push({ gpioOn:0, gpioOff: (1 << x), usDelay:this.DELAYSHORT});
        waveform.push({ gpioOn:(1 << x), gpioOff: 0, usDelay:this.DELAYLONG});
        return waveform;
    }

    this.ONE = function (x) {
        var waveform = [];
        waveform.push({ gpioOn:0, gpioOff: (1 << x), usDelay:this.DELAYLONG});
        waveform.push({ gpioOn:(1 << x), gpioOff: 0, usDelay:this.DELAYSHORT});
        return waveform;
    }

    this.write = function(pin, value) {
        rpio.Write(pin, value);
    }

    this.set_color = function(bulb, intensity, color) {
        //let r = color & 0x0F;
        //let g = (color >> 4) & 0x0F;
        //let b = (color >> 8) & 0x0F;
        let r = 0xF;
        let g = 0;
        let b = 0;
        let intensity = 0xcc;

        if (intensity > this.MAX_INTENSITY) {
            intensity = this.MAX_INTENSITY;
        }

        var waveform = [];

        waveform.push({ gpioOn:(1 << this.pin), gpioOff: 0, usDelay:this.DELAYSHORT});
        waveform.push({ gpioOn:0, gpioOff: (1 << this.pin), usDelay:1});

        //LED Address
        if (bulb & 0x20) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (bulb & 0x10) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (bulb & 0x08) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (bulb & 0x04) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (bulb & 0x02) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (bulb & 0x01) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }

        // Brightness
        if (intensity & 0x80) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x40) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x20) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x10) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x08) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x04) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x02) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (intensity & 0x01) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }

        //Blue
        if (b & 0x08) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (b & 0x04) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (b & 0x02) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (b & 0x01) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }

        //Green
        if (g & 0x08) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (g & 0x04) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (g & 0x02) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (g & 0x01) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }

        //Red
        if (r & 0x08) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (r & 0x04) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (r & 0x02) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }
        if (r & 0x01) { waveform = waveform.concat(this.ONE(this.pin)); } else { waveform = waveform.concat(this.ZERO(this.pin)); }

        waveform.push({ gpioOn:0, gpioOff: (1 << this.pin), usDelay:this.DELAYEND});

        Gpio.waveClear();
        Gpio.waveAddGeneric(waveform.length, waveform);
        var waveId = Gpio.waveCreate();
        if (waveId >= 0) {
            console.log("Wave ID: ", waveId);
            Gpio.waveTxSend(waveId, Gpio.WAVE_MODE_ONE_SHOT);
        }

        while (Gpio.waveTxBusy()) {}
        Gpio.waveDelete(waveId());
    }
}

module.exports = router;
