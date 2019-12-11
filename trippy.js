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

let runEffect = () => {
	console.log("Running effect");
	trippy(255, 0, 0, 0, 255, 0, 3, runEffect2);
}
let runEffect2 = () => {
	console.log("Running effect");
	trippy(0, 255, 0, 255, 0, 0, 3, runEffect);
}
/*
let runMeteorRain2 = () => {
	console.log("Running meteorRain2");
	meteorRain([segments[1]], 255, 255, 255, 10, 64, true, 30, runMeteorRain2);
}
let runMeteorRain3 = () => {
	console.log("Running meteorRain3");
	meteorRain([segments[2]], 255, 255, 255, 10, 64, true, 30, runMeteorRain3);
}
let runMeteorRain4 = () => {
	console.log("Running meteorRain4");
	meteorRain([segments[3]], 255, 255, 255, 10, 64, true, 30, runMeteorRain4);
}
let runMeteorRain5 = () => {
	console.log("Running meteorRain5");
	meteorRain([segments[4]], 255, 255, 255, 10, 64, true, 30, runMeteorRain5);
}
let runMeteorRain6 = () => {
	console.log("Running meteorRain6");
	meteorRain([segments[5]], 255, 255, 255, 10, 64, true, 30, runMeteorRain6);
}
let runMeteorRain7= () => {
	console.log("Running meteorRain7");
	meteorRain([segments[6], segments[7]], 255, 255, 255, 10, 64, true, 30, runMeteorRain7);
}
*/

runEffect();
/*
runMeteorRain2();
runMeteorRain3();
runMeteorRain4();
runMeteorRain5();
runMeteorRain6();
runMeteorRain7();
*/

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

function setAll(r, g, b) {
	for(var i = 0; i < pixelData.length; i++) {
		pixelData[i] = rgb2Int(r, g, b);
	}

	ws281x.render(pixelData);
}

function bomb(red, green, blue, red2, green2, blue2, speedDelay, loopCallback) {
	//setAll(red, green, blue);
	var middle = Math.floor((end-start)/2);
	var i = 0;

	let loop = () => {

		var led1 = middle+i;
		var led2 = middle-i;
		if (led2 < 0) led2 = 0;
		pixelData[led1] = pixelData[led2] = rgb2Int(red2, green2, blue2);
		i++;
		if (i <= middle) {
			setTimeout(loop, speedDelay);
		} else {
			loopCallback();
		}
	}
	loop();
}

function rgb2Int(r, g, b) {
  return ((g & 0xff) << 16) + ((r & 0xff) << 8) + (b & 0xff);
}
