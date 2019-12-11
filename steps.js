var ws281x = require('rpi-ws281x-native');
var async = require('async');

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
ws281x.init(475);

var pixelData= [];
var start = 0;
var end = 473;
var offset = 0;
var color = true;

var colors = [
    {red: 255, green: 0, blue: 0},
    {red: 255, green: 255, blue: 255},
    {red: 0, green: 0, blue: 255}
];

let runEffect = () => {
	offset = offset > 0 ? 0 : 1;
	steps(colors, 10, 1, 125, runEffect);
}

runEffect();

setInterval(() => {
	ws281x.render(pixelData);
}, 20);


function fadeToBlack(ledNo, fadeValue) {
	let oldColor = pixelData[ledNo];
	let r = (oldColor & 0x00ff0000) >> 16;
	let g = (oldColor & 0x0000ff00) >> 8;
	let b = (oldColor & 0x000000ff);

	r=(r<=10)? 0 : Math.floor(r-(r*fadeValue/256));
	g=(g<=10)? 0 : Math.floor(g-(g*fadeValue/256));
	b=(b<=10)? 0 : Math.floor(b-(b*fadeValue/256));

	pixelData[ledNo] = rgb2Int(r, g, b);
}

function fadeColorToBlack(color, fadeValue) {
    if (fadeValue <= 0) {
        return color;
    }
	let r = (color & 0x00ff0000) >> 16;
	let g = (color & 0x0000ff00) >> 8;
	let b = (color & 0x000000ff);

	r=(r<=10)? 0 : Math.floor(r-(r*fadeValue/256));
	g=(g<=10)? 0 : Math.floor(g-(g*fadeValue/256));
	b=(b<=10)? 0 : Math.floor(b-(b*fadeValue/256));

        return rgb2Int(r, g, b);
}

function setAll(r, g, b) {
	for(var i = 0; i < pixelData.length; i++) {
		pixelData[i] = rgb2Int(r, g, b);
	}

	ws281x.render(pixelData);
}

function steps(color, stepLength, spacing, speedDelay, loopCallback) {
	var i = 0;
    var colorStep = 0;
    var leftToSkip = spacing;
    var currentSteps = 0;
    var fadeValue = 10;

	for (var i = 0; i <= end; i++) {
            if (leftToSkip > 0) {
                leftToSkip--;
                pixelData[i] = rgb2Int(0, 0, 0);
                continue;
            } else {
                leftToSkip = spacing;
            }
            var rgbToUse = color[colorStep];
            var colorToUse = fadeColorToBlack(rgb2Int(rgbToUse.red, rgbToUse.green, rgbToUse.blue), currentStep*fadeValue);
            pixelData[i] = colorToUse;
            
            currentSteps++;
            if (currentSteps > stepLength) {
                currentSteps = 0;
                colorStep++;
                if (colorStep > color.length) {
                    colorStep = 0;
                }
            }
	}
	setTimeout(loopCallback, speedDelay);
}

function rgb2Int(r, g, b) {
  return ((g & 0xff) << 16) + ((r & 0xff) << 8) + (b & 0xff);
}
