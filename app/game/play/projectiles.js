module.exports = {
	init: function(bullets, spriteName, game) {
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, spriteName);
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
	}
}
