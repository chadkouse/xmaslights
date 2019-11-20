var express = require('express');
var router = express.Router();
const Gpio = require('pigpio').Gpio;

/* GET home page. */
router.post('/', (req, res, next) => {
    //console.log("Got frame data", req.body);
    let g = new G35String(13, 36);
    let colors = [
	    g.COLOR_RED,
	    g.COLOR_YELLOW,
	    g.COLOR_BLUE
    ];
	for (let i = 0; i < 36; i++) {
    g.set_color(i, 0xcc, colors[Math.floor(Math.random()*colors.length)]);
	}
    res.send(200);
});

function G35String(_pin, _light_count) {
    this.MAX_INTENSITY = 0xcc;
    this.DELAYSHORT = 7;
    this.DELAYLONG = 17;
    this.DELAYEND = 40;
	this.pinNumber = _pin;
    this.pin = new Gpio(_pin, {mode: Gpio.OUTPUT});
    this.light_count = _light_count;

    this.COLOR_RED = ((0xF) + ((0) << 4) + ((0) << 8));
    this.COLOR_YELLOW = ((0xF) + ((0xF) << 4) + ((0) << 8));
    this.COLOR_BLUE = ((0) + ((0) << 4) + ((0xF) << 8));

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
        let r = color & 0x0F;
        let g = (color >> 4) & 0x0F;
        let b = (color >> 8) & 0x0F;

        if (intensity > this.MAX_INTENSITY) {
            intensity = this.MAX_INTENSITY;
        }

        var waveform = [];

        waveform.push({ gpioOn:(1 << this.pinNumber), gpioOff: 0, usDelay:this.DELAYSHORT});

        //LED Address
        if (bulb & 0x20) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (bulb & 0x10) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (bulb & 0x08) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (bulb & 0x04) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (bulb & 0x02) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (bulb & 0x01) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }

        // Brightness
        if (intensity & 0x80) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x40) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x20) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x10) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x08) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x04) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x02) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (intensity & 0x01) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }

        //Blue
        if (b & 0x08) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (b & 0x04) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (b & 0x02) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (b & 0x01) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }

        //Green
        if (g & 0x08) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (g & 0x04) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (g & 0x02) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (g & 0x01) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }

        //Red
        if (r & 0x08) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (r & 0x04) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (r & 0x02) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }
        if (r & 0x01) { waveform = waveform.concat(this.ONE(this.pinNumber)); } else { waveform = waveform.concat(this.ZERO(this.pinNumber)); }

        waveform.push({ gpioOn:0, gpioOff: (1 << this.pinNumber), usDelay:this.DELAYEND});

        this.pin.waveClear();
        this.pin.waveAddGeneric(waveform);
        var waveId = this.pin.waveCreate();
        if (waveId >= 0) {
            this.pin.waveTxSend(waveId, Gpio.WAVE_MODE_ONE_SHOT);
        }

        while (this.pin.waveTxBusy()) {}
        this.pin.waveDelete(waveId);
    }
}

module.exports = router;
