const proc = require('process');
const Nanotimer = require('nanotimer');
const timer = new Nanotimer();

function doSomething(postDelay, callback) {
	timer.setTimeout(callback, '', postDelay);
}

const start = process.hrtime.bigint();
doSomething('20u', () => {
	const end = process.hrtime.bigint();
	doSomething('20u', () => {
		const end2 = process.hrtime.bigint();
		console.log("Delay1:", end-start, "Delay2:", end2-end);
	});
});
