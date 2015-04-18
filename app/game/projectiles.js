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

	fire: function(game) {
		this.penetration = 2;
	},

	hit: function(game) {
		this.penetration--;
		if (this.penetration == 0) {
			console.log('kill bullet');
			this.kill();
		}
	}
}
