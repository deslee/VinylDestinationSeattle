module.exports = function preload() {
	this.ctx = {};
	this.load.image('bullet', 'assets/games/invaders/bullet.png');
	this.load.image('enemyBullet', 'assets/games/invaders/enemy-bullet.png');
	this.load.spritesheet('invader', 'assets/games/invaders/invader32x32x4.png', 32, 32);
	this.load.image('ship', 'assets/games/invaders/player.png');
	this.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
	this.load.image('starfield', 'assets/games/invaders/starfield.png');
	this.load.image('background', 'assets/games/invaders/background2.png');
}
