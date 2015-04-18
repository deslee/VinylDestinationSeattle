module.exports = {
	initPlayer: function(bullets) {
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'bullet');
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 1);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);
	},

	initEnemy: function(bullets) {
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'enemyBullet');
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 1);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);
	},

	playerFire: function(game) {
		this.penetration = 1;
	},

	enemyFire: function(game) {
		this.penetration = 1;
	},

	hit: function(target, game) {
		this.penetration--;
		if (this.penetration == 0) {
			console.log('kill bullet');

			var explosion = game.ctx.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(target.body.x+target.width/2, target.body.y+target.height/2);
			explosion.play('kaboom', 30, false, true);
			this.kill();
		}
	}
}
