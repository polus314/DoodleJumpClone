var frames = 0;
var doodle = {};
var platform = {};


function keydownHandler(event) {
	if(event.keyCode == 37) {
		doodle.left = true;
	}
	else if(event.keyCode == 39) {
		doodle.right = true;
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
		doodle.xVel = -5;
		doodle.image = doodle.leftFace;
	}
	else if(!doodle.left && doodle.right){
		doodle.xVel = 5;
		doodle.image = doodle.rightFace;
	}
	else if(doodle.left == doodle.right){
		doodle.xVel = 0;
	}

}

const MAX_Y_VEL = 20;
const SCREEN_WIDTH = 400;
const NOSE_WIDTH = 14;

function updateDoodle() {
	if (platform.x - doodle.width < doodle.x - NOSE_WIDTH && doodle.x + NOSE_WIDTH < platform.x + platform.width)
	{
		if (doodle.y + doodle.height - MAX_Y_VEL - 1 < platform.y && platform.y < doodle.y + doodle.height)
		{
			doodle.yVel = -20;
		}
	}
	inputLogic();
	doodle.x += doodle.xVel;

	doodle.y += doodle.yVel;
	if (doodle.yVel < MAX_Y_VEL) {
		doodle.yVel += 0.5;
	}
	
	if (doodle.x < -doodle.width / 2) {
		doodle.x = SCREEN_WIDTH - (doodle.width / 2) - 5;
	}
	else if (doodle.x > SCREEN_WIDTH - (doodle.width / 2)) {
		doodle.x = (-doodle.width / 2) + 5;
	}
	
	//DEBUG
	if (doodle.y > 1000) {
		doodle.y = 0;
		doodle.x = 0;
	}
}

function drawPlatform(context) {
	context.drawImage(platformImg, platform.x, platform.y);
}

function drawDoodle(context) {
	context.drawImage(doodle.image, doodle.x, doodle.y);
}

function drawARectangle(context, xCoord, yCoord) {
	context.fillRect(xCoord, yCoord, 100,100);
}

function setupGame() {
	doodleImgLeft = new Image();
	doodleImgLeft.src = "jump_left_face.png";
	doodleImgRight = new Image();
	doodleImgRight.src = "jump_right_face.png";
	
	
	platformImg = new Image();
	platformImg.src = "Platform.png";
	
	platform.image = platformImg;
	platform.x = 0;
	platform.y = 700;
	platform.width = 64;
	platform.height = 32;
	
	doodle.leftFace = doodleImgLeft;
	doodle.rightFace = doodleImgRight;
	doodle.image = doodleImgLeft;
	doodle.x = 0;
	doodle.left = false;
	doodle.right = false;
	doodle.xVel = 0;
	doodle.y = 530;
	doodle.yVel = 0;
	doodle.width = 64;
	doodle.height = 64;
	
	setTimeout(main, 100, 0);
}

function update() {
	updateDoodle();
	
}

function draw(context) {
	drawDoodle(context);
	drawPlatform(context);
}

function main(yCoord) {
	const canvas = document.querySelector("#myCanvas");
	var context = canvas.getContext('2d');
	
	context.clearRect(0,0,1000,1000);
	context.fillStyle = 'green';
	drawARectangle(context, 350, yCoord);
	
	update();
	draw(context);
	
	setTimeout(main, 20, yCoord + 5);
}

document.addEventListener('keydown', keydownHandler);
document.addEventListener('keyup', keyupHandler);
window.onload = setupGame;