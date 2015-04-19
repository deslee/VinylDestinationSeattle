module.exports = {
	init: function() {
		var explosions = this.explosions
		explosions.createMultiple(50, 'kaboom');
		explosions.forEach(function(explosion) {
			explosion.anchor.x = 0.5;
			explosion.anchor.y = 0.5;
			explosion.animations.add('kaboom');
		}, this);
	}
}
