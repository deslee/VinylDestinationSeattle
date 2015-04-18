module.exports = function preload() {
	this.ctx = {};
	this.load.image('bullet', 'assets/production/razor.png');
	this.load.image('enemyBullet', 'assets/production/vinyl.png');
	this.load.spritesheet('enemy', 'assets/production/hipsterSpriteSheet1.png', 62, 63);
	this.load.image('ship', 'assets/production/playerCharacter.png');
	this.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
	this.load.image('background', 'assets/production/grass2.jpg');
}
