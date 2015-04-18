var projectiles = require('./projectiles');

module.exports = function create() {
	// set physics engine to arcade
	this.physics.startSystem(Phaser.Physics.ARCADE);


	var ctx = this.ctx;

	ctx.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');

	ctx.playerBullets = this.add.group();
	projectiles.initPlayer.bind(this)(ctx.playerBullets);

	ctx.enemyBullets = this.add.group();
	projectiles.initEnemy.bind(this)(ctx.enemyBullets);

	// create player sprite
	ctx.player = this.add.sprite(400, 500, 'ship')
	require('./player').init.bind(this)(ctx.player)

	// create enemies group
	ctx.enemies = this.add.group()
	require('./enemies').init.bind(this)(ctx.enemies)


	// init ship lives
	//ctx.lives = this.add.group();
	//for (var i = 0; i < 3; i++) 
	//{
		//var ship = ctx.lives.create(this.world.width - 100 + (30 * i), 60, 'ship');
		//ship.anchor.setTo(0.5, 0.5);
		//ship.angle = 90;
		//ship.alpha = 0.4;
	//}

	//  An explosion pool
	ctx.explosions = this.add.group();
	require('./explosions').init.bind(this)(ctx.explosions);

	//  And some controls to play the game with
	ctx.cursors = this.input.keyboard.createCursorKeys();
	ctx.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


	ctx.playing = false;

	var stateText = ctx.stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
	stateText.anchor.setTo(0.5, 0.5);

	ctx.player.lives = 3;
	ctx.player.score = 0;
}
