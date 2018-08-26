let canvasWidth = 800;
let canvasHeight = 600;

let paused = false;
let pauseButtons = [];

let pauseKey = 27;
let jumpKey = 90; // Z
let shootKey = 88; // X
let spawnPlatformKey = 81; // Q
let spawnMiscKey = 87; // W
let spawnSpikeKey = 69; // E
let dieKey = 82; // R
let respawnKey = 84; // T

function spawnPlatform() {
	let platform = new Platform(canvasWidth/2-50, canvasHeight-100, 100, 50, 'blue');
	platforms.push(platform);
}

function spawnSpike() {
	let spike = new Spike(5 * canvasWidth/6, canvasHeight, spikeWidth, spikeHeight, 'red');
	// let spike = new Spike(canvasWidth/2 - playerWidth, canvasHeight, spikeWidth, spikeHeight, 'red');
	for(let i = 0; i < canvasWidth/spikeWidth; i++) {
		let spike = new Spike(spikeWidth * i, canvasHeight, spikeWidth, spikeHeight, 'red');
	spikes.push(spike);
	}
}

function spawnMisc() {
	let platform1 = new Platform(canvasWidth/2-250, 200, 100, 400, 'blue');
	let platform2 = new Platform(canvasWidth/2+150, 200, 100, 400, 'blue');
	platforms.push(platform1);
	platforms.push(platform2);
}

function keyPressed() {
	if(keyCode == pauseKey) togglePause();

	if(keyCode == dieKey) player.die();
	if(keyCode == respawnKey) player.respawn();
	if(keyCode == jumpKey) player.jump();
	if(keyCode == shootKey) player.shoot();
	if(keyCode == LEFT_ARROW) player.dir = -1;
	if(keyCode == RIGHT_ARROW) player.dir = 1;

	if(keyCode == spawnPlatformKey) spawnPlatform();
	if(keyCode == spawnMiscKey) spawnMisc();
	if(keyCode == spawnSpikeKey) spawnSpike();
}

function mouseClicked() {
	if(paused) {
		for(let button of pauseButtons) {
			if(button.includesPoint(mouseX, mouseY)) button.func();
		}
	}
}

function togglePause() {
	paused = !paused;
}

function setup() {
	frameRate(100);
	createCanvas(canvasWidth, canvasHeight);

	let button = new Button(canvasWidth/2-200, canvasHeight/2 - 100, 400, 200, 'white',
	 function() {
	 	togglePause()
	 },
	 'Unpause');
	pauseButtons.push(button);

	player = new Player(canvasWidth/2 - playerWidth/2, canvasHeight/2, playerWidth, playerHeight, playerColor);

	for(let i = 0; i < player.maxBullets; i++) {
		let bulletRep = new Rectangle(10 + i * 10, 10, player.w/playerToBulletRatio, player.h/playerToBulletRatio, bulletColor);
		bulletReps.push(bulletRep);
	}

	spawnPlatform();
	spawnSpike();
}

function draw() {
	background('grey');
	allObjects = [];

	for(let i = 0; i < player.maxBullets - player.bulletsActive(); i++) {
		bulletReps[i].draw();
	}

	for(let platform of platforms) {
		if(!paused) platform.update();
		platform.draw();
	}

	for(let spike of spikes) {
		if(!paused) spike.update();
		spike.draw();
	}

	if(!paused) player.update();
	player.draw();

	allObjects.reverse();
	if(!paused) {
		for(let i = 0; i < allObjects.length; i++) {
			let thing = allObjects[i];
			if(!currentlyDragging && !thing.isBeingDragged && mouseIsPressed && thing.includesPoint(mouseX, mouseY)) {
				thing.isBeingDragged = true;
				currentlyDragging = true;
				break;
			}
		}
	}
	
	if(paused) {
		fill(0, 0, 0, 255 * .5)
		rect(0, 0, canvasWidth, canvasHeight);
		displayPauseMenu();
	}
}