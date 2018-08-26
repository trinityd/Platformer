let player;
let playerWidth = 20;
let playerHeight = 20;
let playerToBulletRatio = 6;
let playerToBloodRatio = 6;
let playerColor = 'green';
let wallJumps = true;

let bulletColor = 'red';
let bulletReps = [];

let spikeChecks = 10;

class Character extends Rectangle {
	constructor(x, y, w, h, color) {
		super(x, y, w, h, color);
		this.spawnX = x;
		this.spawnY = y;
		this.alive = true;
	}

	respawn() {
		this.alive = true;
		this.x = this.spawnX;
		this.y = this.spawnY;
		this.show();
	}

	update() {
		super.update();
	}
}

class Player extends Character {
	constructor(x, y, w, h, color) {
		super(x, y, w, h, color);
		this.gravity = universalGravity;
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
		this.blood = [];
		for(let i = 0; i < 100; i++) {
			let drop = new SimplePhysicsRectangle(0, 0, playerWidth/playerToBloodRatio, playerHeight/playerToBloodRatio, 'red');
			this.blood.push(drop);
		}
	}

	checkLeftwardsCollision() {
		for(let platform of platforms) {
			if(this.x == platform.x + platform.w && this.y + this.h >= platform.y && this.y <= platform.y + platform.h) return true;
		}
		for(let spike of spikes) {
			for(let i = 0; i <= spikeChecks; i++) {	
				if(spike.includesPoint(this.x, this.y + this.h/spikeChecks * i)) {
					this.die();
					return true;
				}
			}
		}
		return (this.x == 0);
	}

	checkRightwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w == platform.x && this.y + this.h >= platform.y && this.y <= platform.y + platform.h) return true;
		}
		for(let spike of spikes) {
			for(let i = 0; i <= spikeChecks; i++) {	
				if(spike.includesPoint(this.x + this.w, this.y + this.h/spikeChecks * i)) {
					this.die();
					return true;
				}
			}
		}
		return (this.x + this.w == canvasWidth-1);
	}

	checkDownwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w > platform.x && this.x < platform.x + platform.w && this.y + this.h == platform.y) return true;
		}
		for(let spike of spikes) {
			for(let i = 0; i <= spikeChecks; i++) {	
				if(spike.includesPoint(this.x + this.w/spikeChecks * i, this.y + this.h)) {
					this.die(); 
					return true;
				}
			}
		}
		return (this.y + this.h == canvasHeight-1);
	}

	checkUpwardsCollision() {
		for(let platform of platforms) {
			if(this.x + this.w > platform.x && this.x < platform.x + platform.w && this.y == platform.y + platform.h) return true;
		}
		for(let spike of spikes) {
			for(let i = 0; i <= spikeChecks; i++) {	
				if(spike.includesPoint(this.x + this.w/spikeChecks * i, this.y)) {
					this.die();
					return true;
				} 
			}
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
			if(this.checkLeftwardsCollision()) {
				if(wallJumps) this.jumpsUsed = 1;
				break;
			}
			this.x--;
		}
	}

	moveRight() {
		for(let i = 0; i < this.moveSpeed; i++) {
			if(this.checkRightwardsCollision()) {
				if(wallJumps) this.jumpsUsed = 1;
				break;
			}
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

	die() {
		this.alive = false;
		this.hide();
		for(let drop of this.blood) {
			drop.x = this.x + this.w/2;
			drop.y = this.y + this.h/2;
			drop.xVel = random(-30, 30);
			drop.yVel = random(-10, -20);
			drop.terminalyVel = 20;
			drop.stat = false;
			drop.hidden = false;
		}
	}

	respawn() {
		super.respawn();
		this.yVel = 0;
		this.yAccel = 0;
		for(let drop of this.blood) {
			drop.stat = true;
			drop.hidden = true;
		}
	}

	update() {
		super.update();

		for(let bullet of this.bullets) {
			bullet.update();
		}

		if(this.alive) {
			this.verticalMovement();
			
			if(keyIsDown(LEFT_ARROW)) this.moveLeft();
			if(keyIsDown(RIGHT_ARROW)) this.moveRight();

			this.y = constrain(this.y, 0, canvasHeight - playerHeight - 1);
			this.x = constrain(this.x, 0, canvasWidth - playerWidth - 1);
		} else {
			for(let drop of this.blood) {
				if(!drop.isOffScreen()) drop.update();
			}
		}
	}

	draw() {
		super.draw();
		for(let bullet of this.bullets) {
			bullet.draw();
		}

		if(!this.alive) {
			for(let drop of this.blood) {
				drop.draw();
			}
		}
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

		if(!this.hidden && !this.isOffScreen()) {
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
		super.hide();
		this.active = false;
	}

	draw() {
		if(!this.hidden) super.draw();
	}
}