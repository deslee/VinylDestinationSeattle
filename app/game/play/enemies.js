var projectiles = require('./projectiles');

var firingTimer = 0;
var ENEMY_BULLET_SPEED = 300

function enemyFires(game) {
	var enemies = this.enemies;
	var player = this.player;
	var livingEnemies = [];
	enemies.forEachAlive(function(enemy){
		// put every living enemy in an array
		livingEnemies.push(enemy);
	});


	if (livingEnemies.length > 0) {
		var random=game.rnd.integerInRange(0,livingEnemies.length-1);

		// randomly select one of them
		var shooter=livingEnemies[random];


		//  Grab the first bullet we can from the pool
		var enemyBullet;
		if (shooter.name == 'fedoraHipster') {
			enemyBullet = this.fedoraBullets.getFirstExists(false);
		}
		if (shooter.name == 'hipster') {
			enemyBullet = this.hipsterBullets.getFirstExists(false);
		}
		if (enemyBullet) {
			projectiles.enemyFire.bind(enemyBullet)(game);

			// And fire the bullet from this enemy
			enemyBullet.reset(shooter.body.x+shooter.body.width/2, shooter.body.y+shooter.body.height/2);

			game.physics.arcade.moveToObject(enemyBullet,player,ENEMY_BULLET_SPEED);
			firingTimer = game.time.now + 2000;
		}
	}
}

module.exports = {
	init: function (game) {
		var enemies = this.enemies = game.add.group();
		enemies.enableBody = true
		enemies.physicsBodyType = Phaser.Physics.ARCADE
		for (var i = 0; i < 40; i++)
		{
			var enemyType = game.rnd.integerInRange(0, 2);
			var name = enemyType == 2 ? 'fedoraHipster' : 'hipster'
			var enemy = enemies.create(0, 0, name);
			enemy.kill()
			enemy.name = name;
			enemy.type = 'ground'
			enemy.id = i
			enemy.anchor.setTo(0.5, 0.5);
			enemy.animations.add('move', [ 0, 1 ], 5, true);
			enemy.play('move');
			enemy.hitpoints = enemyType == 2 ? 2 : 1
		}
	},

	update: function(game) {
		if (this.player.alive && game.time.now > firingTimer)
		{
			enemyFires.bind(this)(game);
		}

		this.enemies.forEach(function(enemy) {
			if (enemy.type == 'ground') {
				enemy.body.velocity.x = (enemy.direction == 0 ? -1 : 1) * 100
				if ((enemy.body.x < 0 && enemy.direction == 0) || (enemy.body.x > game.world.width - enemy.width && enemy.direction == 1)) {
					enemy.direction ^= 1
				}
			}

		}.bind(this));
	},

	reset: function(game) {
		this.enemies.forEach(function(enemy) {
			if (enemy.type == 'ground') {
				var x, y;
				x = Math.floor(enemy.id / 4);
				y = enemy.id % 4;
				enemy.reset(x * enemy.width + enemy.width/2, y * enemy.height + enemy.height/2);
				enemy.direction = y % 2 == 0 ? 1 : 0
			}
		});
	},
}
