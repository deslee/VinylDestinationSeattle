module.exports = function preload(game) {
	game.load.image('bullet', 'assets/production/razor.png');
	game.load.image('enemyBullet', 'assets/production/vinyl.png');
	game.load.spritesheet('enemy', 'assets/production/hipsterSpriteSheet1.png', 62, 63);
	game.load.image('ship', 'assets/production/playerCharacter.png');
	game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
	game.load.image('background', 'assets/production/grass2.jpg');
}
