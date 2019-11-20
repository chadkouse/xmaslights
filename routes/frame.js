var express = require('express');
var router = express.Router();
const sleep = require('sleep');
const Gpio = require('onoff').Gpio;
const pin13 = new Gpio(13, 'out');

/* GET home page. */
router.post('/', (req, res, next) => {
    console.log("Got frame data", req.body);
    let g = g35String(13, 36);
    g.set_color(0, 0xcc, g.COLOR_RED);
    res.send(200);
});

let g35String = function(pin, light_count) {
    this.pin : pin;
    this.light_count: light_count;
    this.MAX_INTENSITY: 0xcc;
    this.DELAYSHORT = 7;
    this.DELAYLONG = 17;
    this.DELAYEND = 40;

    COLOR_RED: let r = ((0xF) + ((0) << 4) + ((0) << 8));

    ZERO: (x) => {
        x.writeSync(Gpio.LOW);
        sleep.usleep(this.DELAYSHORT);
        x.writeSync(Gpio.HIGH);
        sleep.usleep(this.DELAYLONG);
    };

    ONE: (x) => {
        x.writeSync(Gpio.LOW);
        sleep.usleep(this.DELAYLONG);
        x.writeSync(Gpio.HIGH);
        sleep.usleep(this.DELAYSHORT);
    };

    set_color: (bulb, intensity, color) => {
        let r = color & 0x0F;
        let g = (color >> 4) & 0x0F;
        let b = (color >> 8) & 0x0F;

        if (intensity > this.MAX_INTENSITY) {
            intensity = this.MAX_INTENSITY;
        }
        sleep.usleep(this.DELAYSHORT);

        //LED Address
        if (bulb & 0x20) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (bulb & 0x10) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (bulb & 0x08) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (bulb & 0x04) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (bulb & 0x02) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (bulb & 0x01) { this.ONE(this.pin); } else { ZERO(this.pin); }

        // Brightness
        if (intensity & 0x80) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x40) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x20) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x10) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x08) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x04) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x02) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (intensity & 0x01) { this.ONE(this.pin); } else { ZERO(this.pin); }

        //Blue
        if (b & 0x08) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (b & 0x04) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (b & 0x02) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (b & 0x01) { this.ONE(this.pin); } else { ZERO(this.pin); }

        //Green
        if (g & 0x08) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (g & 0x04) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (g & 0x02) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (g & 0x01) { this.ONE(this.pin); } else { ZERO(this.pin); }

        //Red
        if (r & 0x08) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (r & 0x04) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (r & 0x02) { this.ONE(this.pin); } else { ZERO(this.pin); }
        if (r & 0x01) { this.ONE(this.pin); } else { ZERO(this.pin); }

        this.pin.writeSync(Gpio.LOW);
        sleep.usleep(this.DELAYEND);


    }
}

module.exports = router;
