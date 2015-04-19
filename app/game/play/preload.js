module.exports = function preload(game) {
	game.load.audio('boom', 'assets/production/boom.wav');
	game.load.audio('throw', 'assets/production/throw.mp3');
	game.load.image('razor', 'assets/production/razor.png');
	game.load.image('vinyl', 'assets/production/vinyl.png');
	game.load.image('fedora', 'assets/production/fedoraProjectile.png');
	game.load.spritesheet('hipster', 'assets/production/hipsterSpriteSheet1.png', 62, 63);
	game.load.spritesheet('fedoraHipster', 'assets/production/fedoraHipsterSpriteSheet.png', 62, 63);
	game.load.spritesheet('player', 'assets/production/playerCharacterSheet.png', 64, 64);
	game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
	game.load.image('background', 'assets/production/background.png');
	game.load.image('lines', 'assets/production/lines.png');
}
