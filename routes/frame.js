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
    rpio.open(_pin, 'rpio.OUTPUT', rpio.LOW);

    this.COLOR_RED = ((0xF) + ((0) << 4) + ((0) << 8));

    this.ZERO = function(x) {
        console.log("0");
        x.writeSync(rpio.LOW);
        rpio.usleep(this.DELAYSHORT);
        x.writeSync(rpio.HIGH);
        rpio.usleep(this.DELAYLONG);
    }

    this.ONE = function (x) {
        console.log("1");
        x.writeSync(rpio.LOW);
        rpio.usleep(this.DELAYLONG);
        x.writeSync(rpio.HIGH);
        rpio.usleep(this.DELAYSHORT);
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
        waveform.push({ gpioOn:(1 << this.pin), gpioOff: 0, usDelay:this.DELAYSHORT});

        //LED Address
        if (bulb & 0x20) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (bulb & 0x10) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (bulb & 0x08) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (bulb & 0x04) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (bulb & 0x02) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (bulb & 0x01) { this.ONE(this.pin); } else { this.ZERO(this.pin); }

        // Brightness
        if (intensity & 0x80) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x40) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x20) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x10) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x08) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x04) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x02) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (intensity & 0x01) { this.ONE(this.pin); } else { this.ZERO(this.pin); }

        //Blue
        if (b & 0x08) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (b & 0x04) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (b & 0x02) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (b & 0x01) { this.ONE(this.pin); } else { this.ZERO(this.pin); }

        //Green
        if (g & 0x08) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (g & 0x04) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (g & 0x02) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (g & 0x01) { this.ONE(this.pin); } else { this.ZERO(this.pin); }

        //Red
        if (r & 0x08) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (r & 0x04) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (r & 0x02) { this.ONE(this.pin); } else { this.ZERO(this.pin); }
        if (r & 0x01) { this.ONE(this.pin); } else { this.ZERO(this.pin); }

        this.write(this.pin, rpio.LOW);
        rpio.usleep(this.DELAYEND);
    }
}

module.exports = router;
