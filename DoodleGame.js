// Global variables
var doodle = {};
var platforms = [];
var bullets = [];

var background = {};
var platformImg = {};
var sounds = {};
var bump_scroll= 0;
var musicStarted = false;
var gameInProgress = false;

// Constants:
const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 400;
const MAX_Y_VEL = 20;
const MAX_X_VEL = 8;
const NOSE_WIDTH = 14;
const HEAD_BUMP = 100;
const BULLET_VELOCITY = 10;
const BULLET_RADIUS = 10;
const ACC_GRAVITY = 0.5;
const FRAME_RATE = 50;

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;
const KEY_ENTER = 13;


var godMode = false;

// S is Solid
// M is Moving
// B is Breakable
var chunk_library = new Array(
	'70 100 S,140 200 S,210 300 S,280 400 S,210 500 S,140 600 S,70 700 S',
	'70 100 S,210 300 S,70 500 S,210 700 S',
	'70 100 S,140 100 S,210 300 S,280 300 S,70 500 S,140 500 S,210 700 S,280 700 S',
	'70 100 S,70 300 S,70 500 S,70 700 S',
	'70 100 S,140 200 S,210 300 S,280 400 S,210 500 S,140 600 S,70 700 S',
	'70 100 M,140 200 M,210 300 M,280 400 M,210 500 M,140 600 M,70 700 M',
	'70 100 B,140 100 B,210 300 B,280 300 B,70 500 B,140 500 B,210 700 B,280 700 B',
	'70 100 MB,140 200 MB,210 300 MB,280 400 MB,210 500 MB,140 600 MB,70 700 MB'
);

function createPlatformChunk(platformChunk, offset) {
	var platformInfo = platformChunk.split(",");
	platformInfo.forEach( function (item, index, array) {
		var arrInfo = item.split(" ");
		var platform = {};
		platform.x = Number(arrInfo[0]);
		platform.y = Number(SCREEN_HEIGHT - (arrInfo[1]) + offset);
		platform.type = arrInfo[2];
		if (platform.type.includes("M")) {
			platform.xVel = (Math.random() - 0.5) * 6;
		}
		platform.width = 64;
		platform.height = 32;
		platforms.push(platform);
	})
	
}

function keydownHandler(event) {
	if(event.keyCode == KEY_LEFT_ARROW) {
		doodle.left = true;
	}
	else if(event.keyCode == KEY_RIGHT_ARROW) {
		doodle.right = true;
	}
	
	
	
	if (event.keyCode == KEY_ENTER) {
		gameInProgress = true;
		
		// User needs to interact with page before browser will let audio be played
		if (!musicStarted) {
			playSound("music");
			musicStarted = true;
		}
	}
}

function keyupHandler(event) {
	if(event.keyCode == KEY_LEFT_ARROW) {
		doodle.left = false;
	}
	else if(event.keyCode == KEY_RIGHT_ARROW) {
		doodle.right = false;
	}
}

function clickHandler(event) {
	var mouseX = event.pageX;
	var mouseY = event.pageY;
	
	var xDiff = mouseX - doodle.x;
	var yDiff = mouseY - doodle.y;
	var totalDiff = Math.abs(xDiff) + Math.abs(yDiff);
	
	var bullet = {
		x: doodle.x + (doodle.width / 2),
		y: doodle.y,
		xVel: (xDiff / totalDiff) * BULLET_VELOCITY,
		yVel: (yDiff / totalDiff) * BULLET_VELOCITY
	};
	bullets.push(bullet);
}

function inputLogic(){
	if(doodle.left && !doodle.right){
		if(doodle.xVel > - MAX_X_VEL){
			doodle.xVel += -1;
		}
		doodle.image = doodle.leftFace;
	}
	else if(!doodle.left && doodle.right){
		if(doodle.xVel < MAX_X_VEL){
			doodle.xVel += 1;
		}
		doodle.image = doodle.rightFace;
	}
	else if(doodle.left == doodle.right){
		if(doodle.xVel > 0){
			doodle.xVel -= 1;
		}
		else if(doodle.xVel < 0){
			doodle.xVel += 1;
		}
	}

}


function verticalLogic(){
	//acceleration due to gravity:
	doodle.y += doodle.yVel;
	
	doodle.yVel += doodle.yAcc;
	if (doodle.yVel > MAX_Y_VEL) {
		doodle.yVel = MAX_Y_VEL;
	}
	else if (doodle.yVel < -MAX_Y_VEL) {
		doodle.yVel = -MAX_Y_VEL;
	}
	
	if(doodle.y < HEAD_BUMP){//bumps head
		bump_scroll = doodle.y - HEAD_BUMP;
		doodle.y = HEAD_BUMP;
		background.y -= bump_scroll / 2;//pan background
		platforms.forEach(function (item, index, array){
			item.y -= bump_scroll;
		})
		height -= bump_scroll;//records how high you travel
		
		// Remove platforms that have scrolled off screen
		var i = platforms.length;
		var yMinimum = 0;
		while (i--) {
			var yVal = platforms[i].y;
			if (yVal < yMinimum) {
				yMinimum = yVal;
			}
			if (yVal > SCREEN_HEIGHT) {
				platforms.splice(i, 1);
			}
		}
		
		if (yMinimum > -10) {
			var randomIndex = Math.floor(Math.random() * (chunk_library.length - 0.1));
			var chunkInfo = chunk_library[randomIndex];
			createPlatformChunk(chunkInfo, yMinimum-SCREEN_HEIGHT);
		}
	}
	
	
}

var height = 0;
function score(context){
	context.font = '20px calibri';
	context.fillText(Math.round(height/10) + 'm', 16, 30, 100);
}

function updateDoodle(){
	//horizontal movement of character:
	inputLogic();
	doodle.x += doodle.xVel;
	
	//vertical movement of character:
	verticalLogic();
	
	//collision of platform:
	platforms.forEach(function(item) {detectCollision(item)});
		
	//edge warp doodle each side
	if (doodle.x < -doodle.width + NOSE_WIDTH) {
		doodle.x = SCREEN_WIDTH - NOSE_WIDTH;
	}
	else if (doodle.x > SCREEN_WIDTH - NOSE_WIDTH) {
		doodle.x = (-doodle.width + NOSE_WIDTH);
	}
	
	// Game is over
	if (doodle.y > SCREEN_HEIGHT) {
		gameInProgress = false;
		playSound("death");
		cleanupGameState();
		showDeathScreen();
	}
	
	if (godMode) {
		spawnBulletsAtAllAngles();
	}
}

var startAngle = 0;

function spawnBulletsAtAllAngles() {
	var numSteps = 10;
	var step = Math.PI * 2 / numSteps;
	var angle = startAngle;
	for (var i = 0; i < numSteps; i++) {
		angle += step;
		
		var bullet = {
			x: doodle.x + (doodle.width / 2),
			y: doodle.y,
			xVel: Math.sin(angle) * BULLET_VELOCITY,
			yVel: Math.cos(angle) * BULLET_VELOCITY
		};
		bullets.push(bullet);
	}
	startAngle += (Math.PI * 2 / 20.0);
	if (startAngle > Math.PI * 2) {
		startAngle = 0;
	}
}

function detectCollision(myPlatform) {
	if ((myPlatform.x - doodle.width < doodle.x - NOSE_WIDTH) && (doodle.x + NOSE_WIDTH < myPlatform.x + myPlatform.width))
	{
		if (doodle.y + doodle.height - MAX_Y_VEL - 1 < myPlatform.y && myPlatform.y < doodle.y + doodle.height)
		{
			if (doodle.yVel > 0) 
			{
				doodle.yVel = -doodle.jumpPower;
				playSound("jump");
				if (myPlatform.type.includes("B")) {
					myPlatform.broken = true;
				}
				
				if (godMode) {
					if (Math.random() > 0.9) {
						doodle.yAcc = -ACC_GRAVITY;
						doodle.yVel = 0;
						setTimeout(restoreGravity, 6000);
					}
				}
			}
		}
	}
}

function restoreGravity() {
	doodle.yAcc = ACC_GRAVITY;
}

function updateBackground(){
	if(background.y > 1600){
		background.y -= 1600;
	}		
}

function updatePlatforms() {
	// Remove broken platforms
	var i = platforms.length;
	while (i--) {
		var platform = platforms[i];
		if (platform.broken) {
			platforms.splice(i, 1);
		}
		else if (platform.type.includes("M")) {
			platform.x += platform.xVel;
			if (platform.x > SCREEN_WIDTH) {
				platform.x -= (SCREEN_WIDTH + platform.width);
			}
			else if (platform.x + platform.width < 0) {
				platform.x += SCREEN_WIDTH + platform.width;
			}
		}
	}
}

function updateBullets() {
	var i = bullets.length;
	while (i--) {
		bullet = bullets[i];
		bullet.x += bullet.xVel;
		bullet.y += bullet.yVel;
		
		if (bullet.x < 0 || bullet.x > SCREEN_WIDTH ||
		    bullet.y < 0 || bullet.y > SCREEN_HEIGHT) {
			bullets.splice(i, 1);
		}
	}
}

function drawBackground(context){
	context.drawImage(background.image, background.x, background.y);
	context.drawImage(background.image, background.x, background.y - 1600);
}

function drawPlatforms(context) {
	platforms.forEach(function(item, index, array) {
		context.drawImage(platformImg, item.x, item.y);
	})
	
	
}

function drawDoodle(context) {
	context.drawImage(doodle.image, doodle.x, doodle.y);
}

function drawBullets(context) {
	bullets.forEach(function(bullet, index) {
		context.beginPath();
		context.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, 2 * Math.PI);
		context.stroke();
	});
}

function drawARectangle(context, xCoord, yCoord) {//debug square
	context.fillRect(xCoord, yCoord, 100,100);
}

function loadResources() {
	//background
	backgroundImg = new Image();
	backgroundImg.src = "Resources/Background1.png";
	background.image = backgroundImg;
	background.x = 0;
	background.y = 0;
	//left doodle
	doodleImgLeft = new Image();
	doodleImgLeft.src = "Resources/rainbow_left.png";
	//right doodle
	doodleImgRight = new Image();
	doodleImgRight.src = "Resources/rainbow_right.png";
	//platform
	platformImg = new Image();
	platformImg.src = "Resources/Platform.png";
	
	// Sounds
	sounds["music"] = document.getElementById("music");
	sounds["music"].loop = true;
	sounds["music"].volume = 0.15;
	
	sounds["death"] = document.getElementById("death-sound");
	sounds["death"].volume = 0.4;
	
	sounds["jump"] = document.getElementById("jump-sound");
	
	
	setTimeout(showMainMenu, 50);
}

function initializeDoodle() {
	doodle.leftFace = doodleImgLeft;
	doodle.rightFace = doodleImgRight;
	doodle.image = doodleImgLeft;
	doodle.left = false;
	doodle.right = false;
	doodle.xVel = 0;
	doodle.yVel = 0;
	doodle.width = 64;
	doodle.height = 64;
	doodle.x = (SCREEN_WIDTH / 2) - (doodle.width / 2);
	doodle.y = HEAD_BUMP;
	doodle.jumpPower = 16;
	doodle.yAcc = ACC_GRAVITY;
	if (godMode) {
		doodle.jumpPower = 69;
	}
}

function setupGame() {
	initializeDoodle();
	height = 0;
	chunk_library.forEach( function (item, index, array) {
		createPlatformChunk(item, -SCREEN_HEIGHT * index, index);
	})
	
	setTimeout(main, 100, 0);
}

function update() {
	updateDoodle();
	updateBackground();
	updatePlatforms();
	updateBullets();
}

function cleanupGameState() {
	initializeDoodle();
	platforms = [];
	bullets = [];
}

function showDeathScreen() {
	const canvas = document.querySelector("#myCanvas");
	var context = canvas.getContext('2d');
	
	drawBackground(context);
	drawDeathMessage(context);
	
	if (gameInProgress) {
		setupGame();
	} 
	else {
		setTimeout(showDeathScreen, 20)
	}
}

function playSound(soundName) {
	sounds[soundName].play();
}

function drawDeathMessage(context) {
	context.font = '30px serif';
	context.fillText('You traveled ' + Math.round(height)/10.0 + ' meters!', 50, 200);
	context.fillText('Press Enter to play again', 50, 400);
}

function showMainMenu() {
	const canvas = document.querySelector("#myCanvas");
	var context = canvas.getContext('2d');
	
	drawBackground(context);
	drawTitle(context);
	
	if (gameInProgress) {
		setupGame();
	} 
	else {
		setTimeout(showMainMenu, 20)
	}
}

function drawTitle(context) {
	context.font = '50px serif';
	context.fillText('Doodle Jump', 50, 200);
	
	context.font = '30px serif';
	context.fillText('Press Enter to start!', 50, 400);
}

function draw(context) {
	drawBackground(context);
	drawBullets(context);
	drawPlatforms(context);
	drawDoodle(context);
	
	score(context);
}

function main(yCoord) {
	const canvas = document.querySelector("#myCanvas");
	var context = canvas.getContext('2d');
	
	update();
	draw(context);
	
	if (gameInProgress) {
		setTimeout(main, 1000 / FRAME_RATE, yCoord + 5);
	}
}

document.addEventListener('keydown', keydownHandler);
document.addEventListener('keyup', keyupHandler);
document.addEventListener('click', clickHandler);
window.onload = loadResources;