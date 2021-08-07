(function(SGL) {
	var scenes = [];
	var lastFrameTime = 0;
	var downKeys = {};

	var numToMouse = {
		0: "left",
		1: "middle",
		2: "right",
		3: "extra1",
		4: "extra2"
	};

	SGL.mouseTypes = {
		left: 0,
		middle: 1,
		right: 2,
		extra1: 3,
		extra2: 4
	};

	var downMouse = {};

	var mousePressedCallbacks = [];

	var mouseReleasedCallbacks = [];

	var mouseWheelCallbacks = [];

	var keyPressedCallbacks = [];

	var keyReleasedCallbacks = [];

	var updateCallbacks = [];

	SGL.FPS = 0;
	SGL.frameDelay = 0;

	SGL.mouseIsPressed = false;

	SGL.mouseX = 0;
	SGL.mouseY = 0;

	SGL.mouseLocation;

	SGL.mouseIsDown = function(str) {
		if (typeof str !== "string") {
			console.log("SGL.mouseIsDown must recieve a string, but instead recieved " + str);
			return;
		}
		var keys = Object.keys(downMouse);
		if (keys === undefined) return;
		return keys.includes(str);
	}

	function mouseDown(e) {
		mousePressedCallbacks.forEach(callback => callback(e));
		downMouse[numToMouse[e.button]] = true;
		mouseIsPressed = true;
	}
	window.addEventListener("mousedown", (e) => mouseDown.call(SGL, e));

	function mouseUp(e) {
		mouseReleasedCallbacks.forEach(callback => callback(e));
		delete downMouse[numToMouse[e.button]];
		mouseIsPressed = false;
	}
	window.addEventListener("mouseup", (e) => mouseUp.call(SGL, e));

	function mouseMoveWindow(e) {
		this.mouseX = e.pageX;
		this.mouseY = e.pageY;
		this.mouseLocation = e.target;
	}
	window.addEventListener("mousemove", (e) => mouseMoveWindow.call(SGL, e));

	function wheel(e) {
		mouseWheelCallbacks.forEach(callback => callback(e));
	}
	window.addEventListener("wheel", (e) => wheel.call(SGL, e));

	SGL.keyIsDown = function(key) {
		if (typeof key !== "string" || (typeof key === "string" && key.length !== 1)) {
			console.log("SGL.keyIsDown must recieve a string of length one, but instead recieved " + key);
			return;
		}
		let keys = Object.keys(downKeys);
		if (keys === undefined) return;
		return keys.includes(key);
	}

	function keyDown(e) {
		if (!downKeys[e.key]) {
			keyPressedCallbacks.forEach(callback => callback(e));
		}
		downKeys[e.key] = true;
	}
	window.addEventListener("keydown", (e) => keyDown.call(SGL, e));

	function keyUp(e) {
		delete downKeys[e.key];
		keyReleasedCallbacks.forEach(callback => callback(e));
	}
	window.addEventListener("keyup", (e) => keyUp.call(SGL, e));

	// user manually assigns the resolve with their variable of choosing in a .then() statment (also a good place to put getPixelBuffer func)
	SGL.loadImage = function(path, width, height) {
		if (typeof path !== "string") {
			console.log("image source must be a string");
		}
		return new Promise((resolve, reject) => {
			let image;
			image = new Image();
			if (width) image.width = width;
			if (height) image.height = height;

			image.onload = function() {
				resolve(image);
			}

			image.onerror = function(e) {
				reject(`${e.type}: Loading image with path ${path}`);
			}
			image.src = path;
		});
	}

	// relies on the provided image to be fully loaded (should run in a .then statment after loadImage func)
	SGL.getPixelBuffer = function(image) {
		if (!(image instanceof HTMLImageElement)) {
			console.log("SGL.getPixelBuffer must recieve a loaded image, but instead got " + image);
			return;
		}
		let tempCanvas = document.createElement("canvas");
		let ctx = tempCanvas.getContext("2d");

		tempCanvas.width = image.width;
		tempCanvas.height = image.height;

		ctx.drawImage(image, 0, 0, image.width, image.height)
		return ctx.getImageData(0, 0, image.width, image.height).data;
	}

	async function update() {
		let now = performance.now();
		SGL.FPS = 1000.0 / (now - lastFrameTime);
		lastFrameTime = now;
		if (SGL.frameDelay > 0) {
			await new Promise(r => setTimeout(r, SGL.frameDelay * 1000));
		}
		scenes.forEach(scene => scene.renderer.clearRect(0, 0, scene.canvas.width, scene.canvas.height));
		updateCallbacks.forEach(callback => callback());
		window.requestAnimationFrame(update);
	}
	update();

	SGL.addEventListener = function(type, callback) {
		if (typeof callback !== "function") {
			console.log("SGL.addEventListener must recieve a function, but instead recieved " + callback);
			return;
		}
		switch (type) {
			case "mousepressed":
				mousePressedCallbacks.push(callback);
				break;
			case "mousereleased":
				mouseReleasedCallbacks.push(callback);
				break;
			case "wheel":
				mouseWheelCallbacks.push(callback);
				break;
			case "keypressed":
				keyPressedCallbacks.push(callback);
				break;
			case "keyreleased":
				keyReleasedCallbacks.push(callback);
				break;
			case "update":
				updateCallbacks.push(callback);
				break;
			default:
				console.log("event type: " + type + " does not exist");
		}
	}

	SGL.removeEventListener = function(type, callback) {
		if (typeof callback !== "function") {
			console.log("SGL.removeEventListener must recieve a function, but instead recieved " + callback);
			return;
		}
		switch (type) {
			case "mousepressed":
				let mousePressedIndex = mousePressedCallbacks.indexOf(callback);
				if (mousePressedIndex === -1) break;
				mousePressedCallbacks.splice(mousePressedIndex, 1);
				break;
			case "mousereleased":
				let mouseReleasedIndex = mouseReleasedCallbacks.indexOf(callback);
				if (mouseReleasedIndex === -1) break;
				mouseReleasedCallbacks.splice(mouseReleasedIndex, 1);
				break;
			case "wheel":
				let wheelIndex = mouseWheelCallbacks.indexOf(callback);
				if (wheelIndex === -1) break;
				mouseWheelCallbacks.splice(wheelIndex, 1);
				break;
			case "keypressed":
				let keyPressedIndex = keyPressedCallbacks.indexOf(callback);
				if (keyPressedIndex === -1) break;
				keyPressedCallbacks.splice(keyPressedIndex, 1);
				break;
			case "keyreleased":
				let keyReleasedIndex = keyReleasedCallbacks.indexOf(callback);
				if (keyReleasedIndex === -1) break;
				keyReleasedCallbacks.splice(keyReleasedIndex, 1);
				break;
			case "update":
				let updateIndex = updateCallbacks.indexOf(callback);
				if (updateIndex === -1) break;
				updateCallbacks.splice(updateIndex, 1);
				break;
			default:
				console.log("event type: " + type + " does not exist");
		}
	}

	SGL.Scene = (function() {

		function mouseMoveScene(e) {
			this.mouseX = e.offsetX;
			this.mouseY = e.offsetY;
		}

		function Scene (id, width, height) {
			this.canvas = document.createElement("canvas");

			if (id) this.canvas.id = id;
			if (width) this.canvas.width = width;
			if (height) this.canvas.height = height;

			this.renderer = this.canvas.getContext("2d");

			this.mouseX;
			this.mouseY;

			this.canvas.addEventListener("mousemove", (e) => mouseMoveScene.call(this, e));

			scenes.push(this);
		}

		Scene.prototype.getScreenBuffer = function() {
			return this.renderer.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
		}

		Scene.prototype.setScreenBuffer = function(buffer, x = 0, y = 0, dx = 0, dy = 0, dw, dh) {
			var newImageData = new ImageData(buffer, this.canvas.width);
			dw = dw || this.canvas.width;
			dh = dh || this.canvas.height;
			this.renderer.putImageData(newImageData, x, y, dx, dy, dw, dh);
		}

		Scene.prototype.appendTo = function(element) {
			if (!(element instanceof Node)) {
				console.log("cannot append scene to " + element + " of type: " + typeof element);
				return;
			}
			element.appendChild(this.canvas);
		}
		return Scene;
	})();

})(window.SGL = window.SGL || {});