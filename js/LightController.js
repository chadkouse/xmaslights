class Bulb {
    red = 0;
    green = 0;
    blue = 0;

    getHexColor() {
        let r = this.red * 16 - 1;
        if (r < 0) r = 0;
        let g = this.green * 16 - 1;
        if (g < 0) g = 0;
        let b = this.blue * 16 - 1;
        if (b < 0) b = 0;

        r = ("00" + r.toString(16)).substr(-2);
        g = ("00" + g.toString(16)).substr(-2);
        b = ("00" + b.toString(16)).substr(-2);

        return "#" + r + g + b;
    }

    setHexColor(hex) {
        let c = hex.substr(1);

        let h = c.charAt(0) + c.charAt(1);
        let d = parseInt(h, 16);
        let b = Math.floor((d+1)/16);
        if (b < 0) { b = 0 };
        this.red = b;

        h = c.charAt(2) + c.charAt(3);
        d = parseInt(h, 16);
        b = Math.floor((d+1)/16);
        if (b < 0) { b = 0 };
        this.green = b;

        h = c.charAt(4) + c.charAt(5);
        d = parseInt(h, 16);
        b = Math.floor((d+1)/16);
        if (b < 0) { b = 0 };
        this.blue = b;
    }


    constructor(address, posX, posY) {
        this.address = address;
        this.posX = posX;
        this.posY = posY;
    }
}

class LightString {
    constructor(bulbs) {
        this.bulbs = bulbs;
    }
}

class LightController {
    bulbRadius = 5;
    bulbLineWidth = 2;
    elements = [];
    selectedItem = {};
    frameNumber = 0;
    play = true;

    positionLocked = false;
    canMouseX = 0;
    canMouseY = 0;
    offsetX = 0;
    offsetY = 0;
    isDragging = false;
    gridImage = null;
    showGrid = false;

    constructor(canvas) {
        this.canvas = canvas;
        if (canvas.getContext) {
            this.ctx = canvas.getContext("2d");
        }

        var data = '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"> \
            <defs> \
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse"> \
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" stroke-width="0.5" /> \
                </pattern> \
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"> \
                    <rect width="200" height="200" fill="url(#smallGrid)" /> \
                    <path d="M 200 0 L 0 0 0 200" fill="none" stroke="gray" stroke-width="1" /> \
                </pattern> \
            </defs> \
            <rect width="100%" height="100%" fill="url(#smallGrid)" /> \
        </svg>';

        var DOMURL = window.URL || window.webkitURL || window;
        
        var img = new Image();
        var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
        var url = DOMURL.createObjectURL(svg);

        img.onload = () => {
            this.gridImage = img;
            DOMURL.revokeObjectURL(url);
        }
        img.src = url;

        let c = $(canvas);
        let co = c.offset();
        this.offsetX = co.left;
        this.offsetX = co.top;

        c.mousedown((e) => {
            this.canMouseX = parseInt(e.clientX-this.offsetX);
            this.canMouseY = parseInt(e.clientY-this.offsetY);
            this.elements = [];
            for (let i = 0; i < this.program.getFrame(this.frameNumber).lightStrings.length; i++) {
                for (let bulb of this.program.getFrame(this.frameNumber).lightStrings[i].bulbs) {
                    let x = bulb.posX;
                    let y = bulb.posY;
                    let w = (this.bulbRadius + this.bulbLineWidth)*2;
                    let h = w;
                    this.elements.push({stringIdx: i, bulb: bulb, x: x, y: y, width: w, height: h});
                }
            }
            for(let e of this.elements) {
                if (this.canMouseY > e.y &&
                    this.canMouseY < e.y + e.height &&
                    this.canMouseX > e.x &&
                    this.canMouseX < e.x + e.width) {
                    console.log("DOWN frame # ", this.frameNumber, "string # ", e.stringIdx, "bulb # ", e.bulb.address);
                    this.selectedItem = {frameNumber: this.frameNumber, element: e};
                    if (!this.positionLocked) this.isDragging = true;
                }
            }
        });

        c.mouseup((e) => {
            this.canMouseX = parseInt(e.clientX-this.offsetX);
            this.canMouseY = parseInt(e.clientY-this.offsetY);
            this.isDragging = false;
        });

        c.mouseout((e) => {
            this.canMouseX = parseInt(e.clientX-this.offsetX);
            this.canMouseY = parseInt(e.clientY-this.offsetY);
        });

        c.mousemove((e) => {
            this.canMouseX = parseInt(e.clientX-this.offsetX);
            this.canMouseY = parseInt(e.clientY-this.offsetY);
            if (this.isDragging && this.selectedItem && this.selectedItem.element) {
                console.log("Dragging");
                for (let frame of this.program.frames) {
                    let s = frame.lightStrings[this.selectedItem.element.stringIdx];
                    for (let b of s.bulbs) {
                        if (b.address == this.selectedItem.element.bulb.address) {
                            b.posX = this.canMouseX-this.bulbRadius-this.bulbLineWidth;
                            b.posY = this.canMouseY-this.bulbRadius*2-this.bulbLineWidth;
                        }
                    }
                }
            }
        });

    }

    setLightStrings(s) {
        this.lightStrings = s;
        this.elements = [];
        for (let i = 0; i < this.lightStrings.length; i++) {
            for (let bulb of this.lightStrings[i].bulbs) {
                let x = bulb.posX;
                let y = bulb.posY;
                let w = (this.bulbRadius + this.bulbLineWidth)*2;
                let h = w;
                this.elements.push({stringIdx: i, bulb: bulb, x: x, y: y, width: w, height: h});
            }
        }
    }

    updateSelectedBulbColor(color) {
        if (!this.selectedItem || !this.selectedItem.element) return;
        let s = this.program.getFrame(this.selectedItem.frameNumber).lightStrings[this.selectedItem.element.stringIdx];
        for (let b of s.bulbs) {
            if (b.address == this.selectedItem.element.bulb.address) {
                b.red = color.red;
                b.green = color.green;
                b.blue = color.blue;
            }
        }
    }

    insertFrame() {
        let oldFrame = this.program.getFrame(this.frameNumber);
        let lightStrings = [];
        for(let lightString of oldFrame.lightStrings) {
            let lights = [];
            for(let bulb of lightString.bulbs) {
                const b = new Bulb(bulb.address, bulb.posX, bulb.posY);
                b.setHexColor(bulb.getHexColor());
                lights.push(b);
            }
            const newLightString = new LightString(lights);
            lightStrings.push(newLightString);
        }

        let newFrame = new LightProgramFrame(lightStrings);
        this.program.frames.splice(this.frameNumber+1, 0, newFrame);
    }

    deleteFrame() {
        this.program.frames.splice(this.frameNumber, 1);
    }

    scrollFrames() {
        let startFrame = this.program.getFrame(this.frameNumber);
        let lightStrings = [];
        const totalFrames = startFrame.lightStrings[0].bulbs.length;
        for (let x = 1; x < totalFrames; x++) {
            this.insertFrame();
            this.frameNumber++;
            this.scrollFrame();
        }
    }

    addLightString() {
        let lightCount = prompt("Number of lights", "50");
        if (lightCount > 0 && lightCount <= 50) {
            for (var s = 0; s < 1; s++) {
                //add to all frames
                if (this.program.frames.length <= 0) {
                    let lights = [];
                    for (var i = 0; i < lightCount; i++) {

                        const b = new Bulb(i, i*18, 0);
                        b.setHexColor('#000000');
                        lights.push(b);
                    }
                    const lightString = new LightString(lights);
                    console.log("no frames");
                    const myProgram = new LightProgram([new LightProgramFrame([lightString])], 100);
                    this.program = myProgram;
                    this.runProgram();
                }
                for (let f = 0; f < this.program.frames.length; f++) {
                    let frame = this.program.frames[f];
                    let lights = [];
                    for (var i = 0; i < lightCount; i++) {

                        const b = new Bulb(i, i*18, 0);
                        b.setHexColor('#000000');
                        lights.push(b);
                    }
                    let lightString = new LightString(lights);
                    let lightStrings = frame.lightStrings.concat(lightString);
                    let newFrame = new LightProgramFrame(lightStrings);
                    this.program.frames.splice(f, 1, newFrame);
                }
            }
        }
    }

    scrollFrame() {
        let frame = this.program.getFrame(this.frameNumber);
        let lightStrings = [];
        for (let string of frame.lightStrings) {
            let lights = [];
            for (let i = 0; i < string.bulbs.length; i++) {
                let bulb = string.bulbs[i];
                let nextBulb = null;
                if (i < string.bulbs.length-1) {
                    nextBulb = string.bulbs[i+1];
                } else {
                    nextBulb = string.bulbs[0];
                }
                const b = new Bulb(bulb.address, bulb.posX, bulb.posY);
                b.red = nextBulb.red;
                b.green = nextBulb.green;
                b.blue = nextBulb.blue;
                lights.push(b);
            }
            console.log(lights);

            const newLightString = new LightString(lights);
            lightStrings.push(newLightString);
        }
        const newFrame = new LightProgramFrame(lightStrings);
        this.program.frames.splice(this.frameNumber, 1, newFrame);
    }

    loadProgram(json) {
        let data = JSON.parse(json);
        let frames = [];
        for (let frame of data.frames) {
            let lightStrings = [];
            for (let string of frame.lightStrings) {
                let lights = [];
                for (let bulb of string.bulbs) {
                    const b = new Bulb(bulb.address, bulb.posX, bulb.posY);
                    b.red = bulb.red;
                    b.green = bulb.green;
                    b.blue = bulb.blue;
                    lights.push(b);
                }
                const newLightString = new LightString(lights);
                lightStrings.push(newLightString);
            }
            const newFrame = new LightProgramFrame(lightStrings);
            frames.push(newFrame);
        }
        let myProgram = new LightProgram(frames, data.delay || 100, data.reverse || false);
        this.program = myProgram;
    }
    getProgram() {
        return JSON.stringify(this.program);
    }
    getFrameData() {
        return JSON.stringify(this.program.getFrame(this.frameNumber));
    }
    pasteFrameData(data) {
        let frame = JSON.parse(data);
        let lightStrings = [];
        for (let string of frame.lightStrings) {
            let lights = [];
            for (let bulb of string.bulbs) {
                const b = new Bulb(bulb.address, bulb.posX, bulb.posY);
                b.red = bulb.red;
                b.green = bulb.green;
                b.blue = bulb.blue;
                lights.push(b);
            }
            const newLightString = new LightString(lights);
            lightStrings.push(newLightString);
        }
        const newFrame = new LightProgramFrame(lightStrings);
        this.program.frames.splice(this.frameNumber, 1, newFrame);
    }

    runProgram() {
        let runLoop = () => {
    //        console.log(this.program.frames);
            try {
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                $('.frameNumber').text(this.frameNumber);
                if (this.program.frames && this.program.frames.length >= this.frameNumber 
                    && this.program.getFrame(this.frameNumber) && 
                    this.program.getFrame(this.frameNumber).lightStrings) {
                    for (let stringIdx = 0; stringIdx < this.program.getFrame(this.frameNumber).lightStrings.length; stringIdx++) {
                        let string = this.program.getFrame(this.frameNumber).lightStrings[stringIdx];
                        for (let bulb of string.bulbs) {
                            if (this.showGrid && this.gridImage) {
                                this.ctx.drawImage(this.gridImage, 0, 0);
                            }
                            this.ctx.beginPath();
                            this.ctx.arc(bulb.posX+(this.bulbRadius)+this.bulbLineWidth,
                                bulb.posY+(this.bulbRadius)+this.bulbLineWidth, 
                                this.bulbRadius,
                                0, 2*Math.PI, false);
                            this.ctx.lineWidth = this.bulbLineWidth;
                            if (this.selectedItem && this.selectedItem.element && 
                                bulb.address == this.selectedItem.element.bulb.address &&
                                stringIdx == this.selectedItem.element.stringIdx) {
                                this.ctx.strokeStyle = "#FF0000";
                            } else {
                                this.ctx.strokeStyle = '#000000';
                            }
                            this.ctx.stroke();
                            this.ctx.fillStyle = bulb.getHexColor();
                            this.ctx.fill();

                            if (this.showBulbText) {
                                this.ctx.beginPath();
                                this.ctx.fillStyle = 'white';
                                this.ctx.textAlign = 'center';
                                this.ctx.font = '12pt Impact';
                                this.ctx.lineWidth = 0.25;
                                this.ctx.strokeStyle = '#000000';
                                this.ctx.fillText(bulb.address, bulb.posX+this.bulbRadius+this.bulbLineWidth, bulb.posY + this.bulbRadius + this.bulbLineWidth+6);
                                this.ctx.strokeText(bulb.address, bulb.posX+this.bulbRadius+this.bulbLineWidth, bulb.posY + this.bulbRadius + this.bulbLineWidth+6);
                                this.ctx.fill();
                            }
                        }
                    }
                }
                if (this.play) {
                    this.frameNumber++;
                }
                if (this.frameNumber >= this.program.frames.length) { this.frameNumber = 0; }
            }
            } catch (e) {
                console.log(e);
            }
     //       console.log(this.selectedItem);
            if (this.selectedItem && this.selectedItem.element) {
                $('.selectedBulbInfo').text(" Selected Bulb: String " + this.selectedItem.element.stringIdx + " Buld Addr: " + this.selectedItem.element.bulb.address);
                setTimeout(runLoop, 0);
            } else {
                $('.selectedBulbInfo').text("");
                setTimeout(runLoop, this.program.delay);
            }
        };
        runLoop();
    }

    moveProgramFrameNumber(i) {
        i += this.frameNumber;
        if (i < 0) {
            i = this.program.frames.length - 1;
        }

        if (this.program && i >= this.program.frames.length) {
            i = 0;
        }

        this.frameNumber = i;
    }

    drawFrame() {
        if (!this.ctx) { return; }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let string of this.lightStrings) {
            for (let bulb of string.bulbs) {
                this.ctx.beginPath();
                this.ctx.arc(bulb.posX+(this.bulbRadius)+this.bulbLineWidth,
                    bulb.posY+(this.bulbRadius)+this.bulbLineWidth, 
                    this.bulbRadius,
                    0, 2*Math.PI, false);
                this.ctx.lineWidth = this.bulbLineWidth;
                this.ctx.strokeStyle = '#000000';
                this.ctx.stroke();
                this.ctx.fillStyle = bulb.getHexColor();
                this.ctx.font = '8pt Calibri';
                this.ctx.fill();
                this.ctx.fillStyle = 'white';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(bulb.address, bulb.posX, bulb.posY);
            }
        }
    }

    click(x, y) {
        this.elements = [];
        for (let i = 0; i < this.program.getFrame(this.frameNumber).lightStrings.length; i++) {
            for (let bulb of this.program.getFrame(this.frameNumber).lightStrings[i].bulbs) {
                let x = bulb.posX;
                let y = bulb.posY;
                let w = (this.bulbRadius + this.bulbLineWidth)*2;
                let h = w;
                this.elements.push({stringIdx: i, bulb: bulb, x: x, y: y, width: w, height: h});
            }
        }
        for(let e of this.elements) {
            if (y > e.y &&
                y < e.y + e.height &&
                x > e.x &&
                x < e.x + e.width) {
                console.log("Clicked frame # ", this.frameNumber, "string # ", e.stringIdx, "bulb # ", e.bulb.address);
                this.selectedItem = {frameNumber: this.frameNumber, element: e};
            }
        }
    }
}

class LightProgramFrame {
    constructor(lightStrings) {
        this.lightStrings = lightStrings;
    }
}

class LightProgram {
    constructor(frames, delay, reverse) {
        this.frames = frames;
        if (reverse) {
            this.frames.reverse();
        }
        this.delay = delay;
        this.reverse = reverse;
    }

    getFrame(idx) { return this.frames[idx]; }
    getFrameAtTime(ts) { return this.frames[ts/delay]; }
    setFrame(idx, frame) { this.frames[idx] = frame; }
    appendFrame(frame) { this.frames.push(frame); }
}
