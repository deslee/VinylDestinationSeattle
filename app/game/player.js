var bulletTime = 0

var projectiles = require('./projectiles')

function firebullet(game) {
	//  To avoid them being allowed to fire too fast we set a time limit
	if (game.time.now > bulletTime) {
		//  Grab the first bullet we can from the pool
		var bullet = this.playerBullets.getFirstExists(false);
		projectiles.playerFire.bind(bullet)(game);
		var player = this.player;

		if (bullet) {
			//  And fire it
			bullet.reset(player.x, player.y + 8);
			bullet.body.velocity.y = -400;
			bulletTime = game.time.now + 200;
		}
	}
}

module.exports = {
	// put the player on the map
	init: function(game) {
		var player = this.player
		player.revive()
		player.anchor.setTo(.5,.5)
		game.physics.enable(player, Phaser.Physics.ARCADE)
	},

	// update game loop
	update: function(game) {
		var cursors = this.cursors;
		var fireButton = this.fireButton
		var player = this.player;

		if (!player.alive) return;

		player.body.velocity.setTo(0, 0);

		if (cursors.left.isDown) {
			player.body.velocity.x = -200;
		}
		else if (cursors.right.isDown) {
			player.body.velocity.x = 200;
		}
		if (this.fireButton.isDown) {
			firebullet.bind(this)(game);
		}
	},
}
