var projectiles = require('./projectiles');

module.exports = function create(game) {
	// set physics engine to arcade
	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.background = game.add.tileSprite(0, 0, game.scale.width, game.scale.height, 'background');

	this.playerBullets = game.add.group();
	projectiles.init.bind(this)(this.playerBullets, 'bullet', game);

	this.enemyBullets = game.add.group();
	projectiles.init.bind(this)(this.enemyBullets, 'enemyBullet', game);

	// create player sprite
	this.player = game.add.sprite(400, 500, 'ship')
	this.player.kill();

	// create enemies group
	this.enemies = game.add.group()

	//  An explosion pool
	this.explosions = game.add.group();
	require('./explosions').init.bind(game)(this.explosions);

	//  And some controls to play the game with
	this.cursors = game.input.keyboard.createCursorKeys();
	this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	this.playing = false;

	this.stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
	this.stateText.anchor.setTo(0.5, 0.5);
	this.stateText.visible = true;
	this.stateText.text = "Space to start";
}
