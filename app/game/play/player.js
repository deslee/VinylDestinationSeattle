var bulletTime = 0
var bulletVelocity = 400
var bulletDelay = 800

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
			bullet.body.velocity.y = -bulletVelocity;
			bulletTime = game.time.now + bulletDelay;
		}
		this.throw.play();
	}

}

module.exports = {
	// put the player on the map
	init: function(game) {
		var player = this.player = game.add.sprite(0, 0, 'player')
		player.kill()
		player.anchor.setTo(.5,.5)
		game.physics.enable(player, Phaser.Physics.ARCADE)
		player.checkWorldBounds = true
		player.animations.add('move', [ 0, 1 ], 5, true);
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
			player.play('move')
		}
		else if (cursors.right.isDown) {
			player.body.velocity.x = 200;
			player.play('move')
		}
		else {
			var animation = player.animations.currentAnim.stop();
		}
		if (this.fireButton.isDown) {
			firebullet.bind(this)(game);
		}
		if ((player.body.x <= 0 && player.body.velocity.x < 0) || (player.body.x >= game.world.width - player.width && player.body.velocity.x > 0)) {
			player.body.velocity.x = 0;
		}
	},
	reset: function(game) {
		this.player.reset(game.world.width/2, game.world.height-this.player.height/2);
	}
}
