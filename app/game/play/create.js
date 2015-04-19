var projectiles = require('./projectiles');

module.exports = function create(game) {
	// set physics engine to arcade
	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');
	this.lines = game.add.tileSprite(game.world.width/2 - 50/2, 0, 50, game.world.height, 'lines');

	this.playerBullets = game.add.group();
	projectiles.init.bind(this)(this.playerBullets, 'razor', game);

	this.hipsterBullets = game.add.group();
	projectiles.init.bind(this)(this.hipsterBullets, 'vinyl', game);

	this.fedoraBullets = game.add.group();
	projectiles.init.bind(this)(this.fedoraBullets, 'fedora', game);

	// create player sprite
	require('./player').init.bind(this)(game);

	// create enemies group
	require('./enemies').init.bind(this)(game);

	//  An explosion pool
	this.explosions = game.add.group();
	require('./explosions').init.bind(this)();

	//  And some controls to play the game with
	this.cursors = game.input.keyboard.createCursorKeys();
	this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	console.log('bam')
	this.startGame();
}
