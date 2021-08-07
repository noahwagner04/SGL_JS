var img;
var scene = new SGL.Scene("myScene", 400, 400);
scene.appendTo(document.body);
var screenData = scene.getScreenBuffer();

SGL.loadImage("test.png").then(image => {
	img = image
}).catch(error => {
	console.log(error);
});

function userKeyPressed(e) {
	if (e.key === "a") {
		console.log("a is pressed");
	}
}

function userKeyReleased(e) {
	if (e.key === "a") {
		console.log("a is released");
	}
}

function userMousePressed(e) {
	if (e.button === SGL.mouseTypes.left) {
		console.log("this button is pressed");
	}
}

function userMouseReleased(e) {
	if (e.button === SGL.mouseTypes.left) {
		console.log("this button is released");
	}
}

var oldX, oldY;
function loop() {
	scene.renderer.fillRect(0, 0, scene.canvas.width, scene.canvas.height);
	if (SGL.keyIsDown("a")) console.log("a is down");
	if (SGL.mouseIsDown("left")) console.log("left is down");
	if (SGL.mouseLocation === scene.canvas && (scene.mouseX !== oldX || scene.mouseY !== oldY)) console.log(scene.mouseX, scene.mouseY);
	for (let i = 0; i < screenData.length; i += 4) {
		let x = i / 4 % scene.canvas.width;
		let y = i / 4 / scene.canvas.width;
		screenData[i + 0] = x; // R value
		screenData[i + 1] = y; // G value
		screenData[i + 2] = 100; // B value
		screenData[i + 3] = 255; // A value
	}
	scene.setScreenBuffer(screenData);
	oldX = scene.mouseX;
	oldY = scene.mouseY;
}

function onWheel(e) {
	console.log(e.deltaY);
}

SGL.addEventListener("keypressed", userKeyPressed);
SGL.addEventListener("keyreleased", userKeyReleased);
SGL.addEventListener("mousepressed", userMousePressed);
SGL.addEventListener("mousereleased", userMouseReleased);
SGL.addEventListener("update", loop);
SGL.addEventListener("wheel", onWheel);