// Global variables
var frames = 0;
var doodle = {};
var background = {};
var platformImg = {};
var platforms = [];
var bump_scroll= 0;
var musicStarted = false;

// Constants:
const SCREEN_HEIGHT = 720;
const SCREEN_WIDTH = 400;
const MAX_Y_VEL = 20;
const MAX_X_VEL = 8;
const NOSE_WIDTH = 14;
const HEAD_BUMP = 200;

// S is Solid
// M is Moving
// B is Breakable
var chunk_library = new Array(
	//'70 100 S,140 200 S,210 300 S,280 400 S,210 500 S,140 600 S,70 700 S',
	//'70 100 S,210 300 S,70 500 S,210 700 S',
	//'70 100 S,140 100 S,210 300 S,280 300 S,70 500 S,140 500 S,210 700 S,280 700 S',
	//'70 100 S,70 300 S,70 500 S,70 700 S',
	//'70 100 S,140 200 S,210 300 S,280 400 S,210 500 S,140 600 S,70 700 S',
	//'70 100 M,140 200 M,210 300 M,280 400 M,210 500 M,140 600 M,70 700 M',
	//'70 100 B,140 100 B,210 300 B,280 300 B,70 500 B,140 500 B,210 700 B,280 700 B',
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
			platform.xVel = Math.random() * 3;
		}
		platform.width = 64;
		platform.height = 32;
		platforms.push(platform);
	})
	
}

function keydownHandler(event) {
	if(event.keyCode == 37) {
		doodle.left = true;
	}
	else if(event.keyCode == 39) {
		doodle.right = true;
	}
	
	// User needs to interact with page before browser will let audio be played
	if (!musicStarted) {
		var music = document.getElementById("music");
		music.play();
		musicStarted = true;
	}
}

function keyupHandler(event) {
	if(event.keyCode == 37) {
		doodle.left = false;
	}
	else if(event.keyCode == 39) {
		doodle.right = false;
	}
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
	if (doodle.yVel < MAX_Y_VEL) {
		doodle.yVel += 0.5;
	}
	if(doodle.y < HEAD_BUMP){//bumps head
		bump_scroll = doodle.y - HEAD_BUMP;
		doodle.y = HEAD_BUMP;
		background.y -= bump_scroll / 2;//pan background
		platforms.forEach(function (item, index, array){
			item.y -= bump_scroll;
		})
		
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


function updateDoodle(){
	//horizontal movement of character:
	inputLogic();
	doodle.x += doodle.xVel;
	
	//vertical movement of character:
	verticalLogic();
	
	//collision of platform:
	platforms.forEach(function(item) {detectCollision(item)});
		
	//edge warp doodle each side
	if (doodle.x < -doodle.width / 2) {
		doodle.x = SCREEN_WIDTH - (doodle.width / 2) - 5;
	}
	else if (doodle.x > SCREEN_WIDTH - (doodle.width / 2)) {
		doodle.x = (-doodle.width / 2) + 5;
	}
		//DEBUG (respawn)
	if (doodle.y > 720) {
		doodle.y = HEAD_BUMP;
		doodle.x = 0;
	}
}


function detectCollision(myPlatform) {
	if ((myPlatform.x - doodle.width < doodle.x - NOSE_WIDTH) && (doodle.x + NOSE_WIDTH < myPlatform.x + myPlatform.width))
	{
		if (doodle.y + doodle.height - MAX_Y_VEL - 1 < myPlatform.y && myPlatform.y < doodle.y + doodle.height)
		{
			if (doodle.yVel > 0) 
			{
				doodle.yVel = -16;
				if (myPlatform.type.includes("B")) {
					myPlatform.broken = true;
				}
			}
		}
	}
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
			if ((platform.x + platform.width / 2) > SCREEN_WIDTH) {
				platform.x -= (SCREEN_WIDTH);
			}
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

function drawARectangle(context, xCoord, yCoord) {//debug square
	context.fillRect(xCoord, yCoord, 100,100);
}

function setupGame() {
	//background
	backgroundImg = new Image();
	backgroundImg.src = "Resources/Background1.png";
	background.image = backgroundImg;
	background.x = 0;
	background.y = 0;
	//left doodle
	doodleImgLeft = new Image();
	doodleImgLeft.src = "Resources/jump_left_face.png";
	//right doodle
	doodleImgRight = new Image();
	doodleImgRight.src = "Resources/jump_right_face.png";
	//platform
	platformImg = new Image();
	platformImg.src = "Resources/Platform.png";
	
	doodle.leftFace = doodleImgLeft;
	doodle.rightFace = doodleImgRight;
	doodle.image = doodleImgLeft;
	doodle.x = 0;
	doodle.left = false;
	doodle.right = false;
	doodle.xVel = 0;
	doodle.y = HEAD_BUMP;
	doodle.yVel = 0;
	doodle.width = 64;
	doodle.height = 64;
	
	chunk_library.forEach( function (item, index, array) {
		createPlatformChunk(item, -SCREEN_HEIGHT * index, index);
	})
	
	setTimeout(main, 100, 0);
}

function update() {
	updateDoodle();
	updateBackground();
	updatePlatforms();
}

function draw(context) {
	drawBackground(context);
	drawPlatforms(context);
	drawDoodle(context);
}

function main(yCoord) {
	const canvas = document.querySelector("#myCanvas");
	var context = canvas.getContext('2d');
	
	update();
	draw(context);
	
	setTimeout(main, 20, yCoord + 5);
}

document.addEventListener('keydown', keydownHandler);
document.addEventListener('keyup', keyupHandler);
window.onload = setupGame;