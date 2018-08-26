let canvasWidth = 800;
let canvasHeight = 600;

let player;
let playerWidth = 40;
let playerHeight = 20;
let playerToBulletRatio = 6;
let playerColor = 'green';

let bulletColor = 'red';
let bulletReps = [];

let currentlyDragging = false;
let platforms = [];
let spikes = [];
let allObjects = [];

let jumpKey = 90; // Z
let shootKey = 88; // X
let spawnPlatformKey = 81; // Q
let spawnPlatformGroupKey = 87; // W
let spawnSpikeKey = 69; // E


class Shape {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
	}
}

class Rectangle {
	constructor(x, y, w, h, color) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.color = color;
		this.isBeingDragged = false;
		this.zIndex = undefined;
	}

	includesPoint(pointX, pointY) {
		return(pointX >= this.x && pointX <= this.x + this.w && pointY >= this.y && pointY <= this.y + this.h);
	}

	intersects(rect) {
		return !(rect.x > this.x + this.w || this.x > rect.x + rect.w || rect.y > this.y + this.h || this.y > rect.y + rect.h)
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

	update() {
		this.handleDrag();
	}

	draw() {
		allObjects.push(this);

		fill(this.color);
		rect(this.x, this.y, this.w, this.h);
	}
}

class Triangle {
	constructor(x1, y1, x2, y2, x3, y3, color) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.x3 = x3;
		this.y3 = y3;
		this.color = color;
	}

	is

	draw() {
		fill(this.color);
		triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
	}

	update() {

	}
}

class Bullet extends Rectangle {
	constructor(x, y, w, h, color, vel) {
		super(x, y, w, h, color);
		this.startingX = x;
		this.startingY = y;
		this.yVel = vel;
		this.isOnScreen = true;
		this.hidden = true;
		this.active = false;
	}

	update() {
		super.update();

		this.isOnScreen = (this.x > 0 && this.x < canvasWidth + this.w && this.y > 0 && this.y < canvasHeight - this.h);

		if(!this.hidden && this.isOnScreen) {
			this.x += this.vel;
		} else {
			this.reset();
		}
	}

	reset() {
		this.x = this.startingX;
		this.y = this.startingY;
		this.vel = 0;
		this.hide();
	}

	shoot(x, y, vel) {
		this.show();
		this.active = true;
		this.x = x;
		this.y = y;
		this.vel = vel;
	}

	isActive() {
		return this.active;
	}

	hide() {
		this.hidden = true;
		this.active = false;
	}

	show() {
		this.hidden = false;
	}

	draw() {
		if(!this.hidden) super.draw();
	}
}

class Character extends Rectangle {
	constructor(x, y, w, h, color) {
		super(x, y, w, h, color);
		this.spawnX = x;
		this.spawnY = y;
		this.alive = true;
	}

	respawn() {
		this.x = spawnX;
		this.y = spawnY;
	}

	update() {
		super.update();
	}
}

class Player extends Character {
	constructor(x, y, w, h, color) {
		super(x, y, w, h, color);
		this.gravity = 1;
		this.moveSpeed = 10;
		this.yAccel = this.gravity;
		this.yVel = 0;
		this.terminalYVel = 20;
		this.dir = 1;
		this.jumpYVel = -20;
		this.jumpCount = 2;
		this.jumpsUsed = 0;
		this.isJumping = false;
		this.bulletsShot = 0;
		this.maxBullets = 5;
		this.bulletXVel = 20;
		this.bullets = [];
		for(let i = 0; i < this.maxBullets; i++) {
			let bullet = new Bullet(10 + i * 10, 10, this.w/playerToBulletRatio, this.h/playerToBulletRatio, 'red', 0);
			this.bullets.push(bullet);
		}
	}

	checkLeftwardsCollision() {
		for(let platform of platforms) {
			if(this.x == platform.x + platform.w && this.y + this.h >= platform.y && this.y <= platform.y + platform.h) return true;
		}
		return (this.x == 0);
	}

	checkRightwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w == platform.x && this.y + this.h >= platform.y && this.y <= platform.y + platform.h) return true;
		}
		return (this.x + this.w == canvasWidth-1);
	}

	checkDownwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w > platform.x && this.x < platform.x + platform.w && this.y + this.h == platform.y) return true;
		}
		return (this.y + this.h == canvasHeight-1);
	}

	checkUpwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w > platform.x && this.x < platform.x + platform.w && this.y == platform.y + platform.h) return true;
		}
		return (this.y == 0);
	}

	jump() {
		if(this.jumpsUsed < this.jumpCount) {
			this.yVel = this.jumpYVel;
			this.yAccel = this.gravity;
			this.jumpsUsed++;
			this.isJumping = true;
		}
	}

	verticalMovement() {
		let uColl = false;
		let dColl = false;
		let absYVel = abs(this.yVel);
		this.yAccel = this.gravity;
		for(let i = 0; i < absYVel; i++) {
			if(this.checkUpwardsCollision()) {
				this.y++;
				this.yVel = 0;
				break;
			}
			if(this.yVel >= 0 && this.checkDownwardsCollision()) {
				this.isJumping = false;
				this.jumpsUsed = 0;
				this.yVel = 0;
				this.yAccel = 0;
				break;
			}
			if(this.yVel > 0) this.y++;
			else if(this.yVel < 0) this.y--;
		}
		this.yVel += this.yAccel;
		if(this.yVel > 0) this.yVel = constrain(this.yVel, 0, this.terminalYVel);
	}

	moveLeft() {
		for(let i = 0; i < this.moveSpeed; i++) {
			if(this.checkLeftwardsCollision()) break;
			this.x--;
		}
	}

	moveRight() {
		for(let i = 0; i < this.moveSpeed; i++) {
			if(this.checkRightwardsCollision()) break;
			this.x++;
		}
	}

	shoot() {
		if(this.bulletsShot < this.maxBullets) {
			for(let i = this.bullets.length-1; i >= 0; i--) {
				if(!this.bullets[i].isActive()) {
					this.bullets[i].shoot(this.x + this.w/2, this.y + this.h/2, this.bulletXVel * player.dir);
					break;
				}
			}
		}
	}

	bulletsActive() {
		let c = 0;
		for(let bullet of this.bullets) {
			if(bullet.isActive()) c++;
		}
		return c;
	}

	update() {
		super.update();

		for(let bullet of this.bullets) {
			bullet.update();
		}

		this.verticalMovement();
		
		if(keyIsDown(LEFT_ARROW)) this.moveLeft();
		if(keyIsDown(RIGHT_ARROW)) this.moveRight();

		this.y = constrain(this.y, 0, canvasHeight - playerHeight - 1);
		this.x = constrain(this.x, 0, canvasWidth - playerWidth - 1)
	}

	draw() {
		super.draw();
		for(let bullet of this.bullets) {
			bullet.draw();
		}
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
	}

	update() {
		super.update();

		// Movement?
	}
}

function spawnPlatform() {
	let platform = new Platform(canvasWidth/2-50, canvasHeight-100, 100, 50, 'blue');
	platforms.push(platform);
}

function spawnSpike() {
	let spike = new Spike(5 * canvasWidth/6, canvasHeight/2, playerWidth * 2, playerHeight * 2, 'red');
	spikes.push(spike);
}

function spawnPlatformGroup() {
	for(let i = 0; i < 8; i++)
	{
		let platform = new Platform(230, 0, 100, 50, 'blue');
		platform.y = canvasHeight - platform.h - platform.h * i;
		platforms.push(platform);
	}
}

function keyPressed() {
	if(keyCode == jumpKey) player.jump();
	if(keyCode == shootKey) player.shoot();
	if(keyCode == LEFT_ARROW) player.dir = -1;
	if(keyCode == RIGHT_ARROW) player.dir = 1;

	if(keyCode == spawnPlatformKey) spawnPlatform();
	if(keyCode == spawnPlatformGroupKey) spawnPlatformGroup();
	if(keyCode == spawnSpikeKey) spawnSpike();
}

function setup() {
	frameRate(100);
	createCanvas(canvasWidth, canvasHeight);

	player = new Player(canvasWidth/2 - playerWidth/2, canvasHeight/2, playerWidth, playerHeight, playerColor);

	for(let i = 0; i < player.maxBullets; i++) {
		let bulletRep = new Rectangle(10 + i * 10, 10, player.w/playerToBulletRatio, player.h/playerToBulletRatio, bulletColor);
		bulletReps.push(bulletRep);
	}

	spawnPlatform();
}

function draw() {
	background('grey');
	allObjects = [];

	for(let i = 0; i < player.maxBullets - player.bulletsActive(); i++) {
		bulletReps[i].draw();
	}

	for(let platform of platforms) {
		platform.draw();
		platform.update();
	}

	for(let spike of spikes) {
		spike.draw();
		spike.update();
	}

	player.draw();
	player.update();

	allObjects.reverse();
	for(let i = 0; i < allObjects.length; i++) {
		let thing = allObjects[i];
		if(!currentlyDragging && !thing.isBeingDragged && mouseIsPressed && thing.includesPoint(mouseX, mouseY)) {
			thing.isBeingDragged = true;
			currentlyDragging = true;
			break;
		}
	}
}