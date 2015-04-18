var projectiles = require('./projectiles');

var firingTimer = 0;

function enemyFires(game) {
	//  Grab the first bullet we can from the pool
	var enemyBullet = this.enemyBullets.getFirstExists(false);
	projectiles.enemyFire.bind(enemyBullet)(game);
	var enemies = this.enemies;
	var player = this.player;

	var livingEnemies = [];

	enemies.forEachAlive(function(enemy){
		// put every living enemy in an array
		livingEnemies.push(enemy);
	});


	if (enemyBullet && livingEnemies.length > 0) {
		var random=game.rnd.integerInRange(0,livingEnemies.length-1);

		// randomly select one of them
		var shooter=livingEnemies[random];
		// And fire the bullet from this enemy
		enemyBullet.reset(shooter.body.x+shooter.body.width/2, shooter.body.y+shooter.body.height/2);

		game.physics.arcade.moveToObject(enemyBullet,player,120);
		firingTimer = game.time.now + 2000;
	}
}

module.exports = {
	init: function (enemies) {
		enemies.enableBody = true
		enemies.physicsBodyType = Phaser.Physics.ARCADE
		for (var y = 0; y < 4; y++)
		{
			for (var x = 0; x < 10; x++)
			{
				var enemy = enemies.create(x * 48, y * 50, 'enemy');
				enemy.anchor.setTo(0.5, 0.5);
				enemy.animations.add('move', [ 0, 1 ], 5, true);
				enemy.play('move');
				enemy.body.moves = false;
			}
		}

		enemies.x = 100;
		enemies.y = 50;

		var tween = enemies.tween = this.add.tween(enemies).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

		//  When the tween loops it calls descend
		tween.onLoop.add(function() {
			if (this.ctx.playing) {
				enemies.y += 10;
			}
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
		// kill the enemy
		game.ctx.player.score++;
		this.kill();

		//  And create an explosion :)
		//var explosion = game.ctx.explosions.getFirstExists(false);
		//explosion.reset(this.body.x, this.body.y);
		//explosion.play('kaboom', 30, false, true);
	}
}
