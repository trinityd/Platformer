let currentlyDragging = false;
let platforms = [];
let spikes = [];
let spikeWidth = 40;
let spikeHeight = 40;
let allObjects = [];
let universalGravity = 1;

class Shape {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.hidden = false;
		this.isBeingDragged = false;
	}

	hide() {
		this.hidden = true;
	}

	show() {
		this.hidden = false;
	}

	update() {
		
	}

	draw() {
		allObjects.push(this);
	}
}

class Rectangle extends Shape {
	constructor(x, y, w, h, color) {
		super(x, y, color)
		this.w = w;
		this.h = h;
	}

	handleDrag() {
		if(this.isBeingDragged) {
			if(mouseIsPressed) {
				this.x = mouseX - this.w/2;
				this.y = mouseY - this.h/2;
			} else {
				this.isBeingDragged = false;
				currentlyDragging = false;
			}
		}
	}

	includesPoint(pointX, pointY) {
		return (pointX >= this.x && pointX <= this.x + this.w && pointY >= this.y && pointY <= this.y + this.h);
	}

	intersects(rect) {
		return !(rect.x > this.x + this.w || this.x > rect.x + rect.w || rect.y > this.y + this.h || this.y > rect.y + rect.h)
	}

	isOffScreen() {
		return (this.x + this.w < 0 || this.x > canvasWidth || this.y + this.h < 0 || this.y > canvasHeight);
	}

	update() {
		super.update();

		this.handleDrag();
	}

	draw() {
		super.draw();

		if(!this.hidden)
		{
			fill(this.color);
			rect(this.x, this.y, this.w, this.h);
		}
	}
}

class Triangle extends Shape {
	constructor(x1, y1, x2, y2, x3, y3, color) {
		super(x1, y1, color);
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.x3 = x3;
		this.y3 = y3;
	}

	area() {
		return abs((this.x1 * (this.y2 - this.y3) + this.x2 * (this.y3 - this.y1) + this.x3 * (this.y1 - this.y2))/2);
	}

	areaWithinPoints(x1, y1, x2, y2, x3, y3) {
		return abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))/2);
	}

	includesPoint(pointX, pointY) {
		let areaOfWholeTriangle = this.area();
		let area1P2 = this.areaWithinPoints(this.x1, this.y1, pointX, pointY, this.x2, this.y2);
		let area1P3 = this.areaWithinPoints(this.x1, this.y1, pointX, pointY, this.x3, this.y3);
		let area2P3 = this.areaWithinPoints(this.x2, this.y2, pointX, pointY, this.x3, this.y3);

		return (areaOfWholeTriangle == area1P2 + area1P3 + area2P3);
	}

	handleDrag() {
		if(this.isBeingDragged) {
			if(mouseIsPressed) {
				let dx2 = mouseX - this.x2;
				let dy2 = mouseY - this.y2;
				this.x1 += dx2;
				this.y1 += dy2;
				this.x2 = mouseX;
				this.y2 = mouseY;
				this.x3 += dx2;
				this.y3 += dy2;
			} else {
				this.isBeingDragged = false;
				currentlyDragging = false;
			}
		}
	}

	draw() {
		super.draw();

		if(!this.hidden) {
			fill(this.color);
			triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
		}
	}

	update() {
		super.update();

		this.handleDrag();
	}
}

class Platform extends Rectangle {
	constructor(x, y, w, h, color) {
		super(x, y, w, h, color);
	}

	update() {
		super.update();
	}
}

class Spike extends Triangle {
	constructor(x, y, w, h, color) {
		super(x, y, x+w/2, y-h, x+w, y, color);
		this.w = w;
		this.h = h;
	}

	update() {
		super.update();

		// Movement?
	}

	draw() {
		super.draw();
	}
}

class SimplePhysicsRectangle extends Rectangle {
	constructor(x, y, w, h, color, gravity = universalGravity, xVel = 0, yVel = 0, terminalYVel = 0, stat = true) {
		super(x, y, w, h, color);
		this.gravity = gravity;
		this.xVel = xVel;
		this.yVel = yVel;
		this.terminalYVel = terminalYVel;
		this.stat = stat;
		this.airResistance = 1;
		this.interactWithPlatforms = true;
	}

	update() {
		if(this.interactWithPlatforms) {
			for(let platform of platforms) {
				if(this.intersects(platform)) this.stat = true;
			}
		}

		if(!this.stat) {
			this.x += this.xVel;
			// if(this.xVel > 0) this.xVel -= this.airResistance;
			// if(this.xVel < 0) this.xVel += this.airResistance;
			this.y += this.yVel;
			this.yVel += this.gravity;
			// if(this.yVel > 0) this.yVel = constrain(this.yVel, 0, this.terminalYVel);
		}
	}
}