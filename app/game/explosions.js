module.exports = {
	init: function(explosions) {
		explosions.createMultiple(30, 'kaboom');
		explosions.forEach(function(explosion) {
			explosion.anchor.x = 0.5;
			explosion.anchor.y = 0.5;
			explosion.animations.add('kaboom');
		}, this);
	}
}
