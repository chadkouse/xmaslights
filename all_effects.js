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
var loopCount = 0;
var maxLoopCount = 5;
var offset = 0;
var color = true;

let runEffect = () => {
	if (loopCount >= maxLoopCount) {
		loopCount = 0;
	}
	console.log("Running effect");
	bomb(255, 0, 0, 0, 255, 0, 3, runEffect2);
}
let runEffect2 = () => {
	loopCount++;
	console.log("Running effect");
	bomb(0, 255, 0, 255, 0, 0, 3, () => {
		if (loopCount < maxLoopCount) { setTimeout(runEffect, 1); }
		else {
			loopCount = 0;
			maxLoopCount = 300;
			setTimeout(() => {setAll(0,0,0); runTwinkle();}, 1000);
		}
	});
}

var segments = [
	{id: 0, start: 0, end: 99, reverse: false},
	{id: 1, start: 100, end: 159, reverse: false},
	{id: 2, start: 160, end: 199, reverse: false},
	{id: 3, start: 200, end: 264, reverse: false},
//	{id: 6, start: 235, end: 264, reverse: true},
	{id: 4, start: 265, end: 293, reverse: true},
	{id: 5, start: 294, end: 370, reverse: false},
	//{id: 6, start: 330, end: 359, reverse: false},
	//{id: 7, start: 365, end: 370, reverse: false},
	{id: 8, start: 371, end: 420, reverse: false},
	{id: 9, start: 421, end: 473, reverse: true}
];

let runMeteorRain = () => {
	if (loopCount >= maxLoopCount) {
		loopCount = 0;
	}
	console.log("Running meteorRain");
	loopCount++;
	meteorRain(segments, 0, 0, 255, 10, 64, true, 20, () => {
		if (loopCount < maxLoopCount) { setTimeout(runMeteorRain, 1); }
		else {
			loopCount = 0;
			maxLoopCount = 5;
			setTimeout(runEffect, 1);
		}
	});
}

let runTwinkle = () => {
	console.log("Running twinkle");
	offset = offset > 0 ? 0 : 1;
	loopCount++;
	twinkle(0, 0, 50, 255, 255, 255, 50, () => {
		if (loopCount < maxLoopCount) { setTimeout(runTwinkle, 1); }
		else { 
			loopCount = 0;
			maxLoopCount = 100;
			setTimeout(runMarquee, 1);
		}
	});
	
}
let runMarquee = () => {
	console.log("Running marquee");
	offset = offset > 0 ? 0 : 1;
	loopCount++;
	marquee(255, 255, 255, 0, 0, 255, 125, () => {
		if (loopCount < maxLoopCount) { setTimeout(runMarquee, 1); }
		else { 
			loopCount = 0;
			maxLoopCount = 5;
			setTimeout(runMeteorRain, 1);
		}
	});
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

runMeteorRain();
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
}

function meteorRain(segments, red, green, blue, meteorSize, meteorTrailDecay, meteorRandomDecay, speedDelay, loopCallback) {
	//setAll(0, 0, 0);
	//console.log("Set all to 0");
	var completions = [];
	segments.forEach((segment) => {
		completions[segment.id] = false;
		var start, end, numLeds;
		
		let fade = function(i) {
			if ( (!meteorRandomDecay) || (Math.random() > 0.5)) {
				fadeToBlack(i, meteorTrailDecay);
			}
		}

		if (segment.reverse) {
			start = segment.end;
			end = segment.start;
			numLeds = start-end+1;
			var maxSteps = 100;
			var step = numLeds/100; // NOT QUITE WORKING 100 is my longest segment - scale everything else
	//		console.log("REVERSE: scaling", numLeds, "to 100 stepping by", step);
			var i = 0;

			let loop = () => {

				var led = Math.floor(start-(i*step));

	//console.log("RLooping", segment.id, i);
				for (var j = start; j >= end; j--) {
					fade(j);
				}
				for (var j = 0; j < Math.floor(meteorSize*step); j++) {
					if ( (led+j <= start) && (led+j>=end) ) {
						pixelData[led+j] = rgb2Int(red, green, blue);
					}
				}
				i++;
				if (i < maxSteps) {
					setTimeout(loop, speedDelay);
				} else {
					completions[segment.id] = true;
					var done = true;
					completions.forEach((v) => {
						if (!v) {
							done = false;
						}
					});
					if (done) {
						loopCallback();
					}
				}
			}
			loop();
		} else {
			start = segment.start;
			end = segment.end;
			numLeds = end-start+1;
			var maxSteps = 100;
			var step = numLeds/100; // NOT QUITE WORKING 100 is my longest segment - scale everything else
	//		console.log("FORWARD: scaling", numLeds, "to 100 stepping by", step);
			var i = 0;
			var lastStep = 0;

			let loop = () => {

				var led = Math.floor(start+(i*step));

	//console.log("Looping", segment.id, i);
				for (var j = start; j <= end; j++) {
					fade(j);
				}
				for (var j = 0; j < Math.floor(meteorSize*step); j++) {
					if ( (led-j <= end) && (led-j>=start) ) {
						pixelData[led-j] = rgb2Int(red, green, blue);
					}
				}
				i++;
				if (i < maxSteps) {
					setTimeout(loop, speedDelay);
				} else {
					completions[segment.id] = true;
					var done = true;
					completions.forEach((v) => {
						if (!v) {
							done = false;
						}
					});
					if (done) {
						loopCallback();
					}
				}
			}
			loop();
		}
	});
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
		if (i < middle) {
			setTimeout(loop, speedDelay);
		}
		if (i == Math.floor(middle/2)) {
			loopCallback();
		}
	}
	loop();
}

function rgb2Int(r, g, b) {
  return ((g & 0xff) << 16) + ((r & 0xff) << 8) + (b & 0xff);
}

function fadeToBase(minRed, minGreen, minBlue, ledNo, fadeValue) {
	let oldColor = pixelData[ledNo];
	let r = (oldColor & 0x00ff0000) >> 16;
	let g = (oldColor & 0x0000ff00) >> 8;
	let b = (oldColor & 0x000000ff);

	r=(r<=minRed+10)? minRed : Math.floor(r-(r*fadeValue/256));
	g=(g<=minGreen+10)? minGreen : Math.floor(g-(g*fadeValue/256));
	b=(b<=minBlue+10)? minBlue : Math.floor(b-(b*fadeValue/256));

	pixelData[ledNo] = rgb2Int(r, g, b);
}

function twinkle(red, green, blue, red2, green2, blue2, speedDelay, loopCallback) {
	var i = 0;

	for (var i = 0; i <= end; i++) {
		fadeToBase(red, green, blue, i, 50);
		if (Math.random() > 0.998) {
			pixelData[i] = rgb2Int(red2, green2, blue2);
		}	
	}
	setTimeout(loopCallback, speedDelay);
}

function marquee(red, green, blue, red2, green2, blue2, speedDelay, loopCallback) {
	//setAll(red, green, blue);
	var i = 0;

	for (var i = 0; i <= end; i++) {
		if ((i+offset) % 2 == 0) {
			pixelData[i] = color ? rgb2Int(red, green, blue) : rgb2Int(red2, green2, blue2);
			color = !color;
		} else {
			pixelData[i] = rgb2Int(0, 0, 0);
		}
	}
	setTimeout(loopCallback, speedDelay);
}
