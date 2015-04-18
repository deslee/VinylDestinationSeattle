firingTimer = 0;

function enemyFires(game) {
	//  Grab the first bullet we can from the pool
	var enemyBullet = this.enemyBullets.getFirstExists(false);
	var aliens = this.aliens;
	var player = this.player;

	var livingEnemies = [];

	aliens.forEachAlive(function(alien){
		// put every living enemy in an array
		livingEnemies.push(alien);
	});


	if (enemyBullet && livingEnemies.length > 0) {
		var random=game.rnd.integerInRange(0,livingEnemies.length-1);

		// randomly select one of them
		var shooter=livingEnemies[random];
		// And fire the bullet from this enemy
		enemyBullet.reset(shooter.body.x, shooter.body.y);

		game.physics.arcade.moveToObject(enemyBullet,player,120);
		firingTimer = game.time.now + 2000;
	}
}

module.exports = {
	init: function (aliens) {
		aliens.enableBody = true
		aliens.physicsBodyType = Phaser.Physics.ARCADE
		for (var y = 0; y < 4; y++)
		{
			for (var x = 0; x < 10; x++)
			{
				var alien = aliens.create(x * 48, y * 50, 'invader');
				alien.anchor.setTo(0.5, 0.5);
				alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
				alien.play('fly');
				alien.body.moves = false;
			}
		}

		aliens.x = 100;
		aliens.y = 50;

		var tween = this.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

		//  When the tween loops it calls descend
		tween.onLoop.add(function() {
			aliens.y += 10;
		}, this);
	},

	update: function(game) {
		if (!this.player.alive) return;

		if (game.time.now > firingTimer)
		{
			enemyFires.bind(this)(game);
		}
	},

	hit: function(game) {
		// kill the alien
		this.kill();

		//  And create an explosion :)
		var explosion = game.ctx.explosions.getFirstExists(false);
		explosion.reset(this.body.x, this.body.y);
		explosion.play('kaboom', 30, false, true);
	}
}
