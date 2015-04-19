var enemies = require('./enemies');
var playerImport = require('./player');
var projectiles = require('./projectiles');

module.exports = function(game) {
	return {
		startGame: function startGame() {
			this.playing = true;
			this.lives = 3;
			this.score = 0;
			this.stateText.visible = false;
			playerImport.init.bind(this)(game);
			enemies.init.bind(this)(game)
		},

		win: function () {
			this.playing = false
			this.stateText.text = "You win"
			this.stateText.visible = true;
		},

		lose: function () {
			this.playing = false
			this.stateText.text = "You lose"
			this.stateText.visible = true;
		},

		enemyHit: function (bullet, enemy) {
			projectiles.hit.bind(bullet)(enemy, game);
			enemy.kill();
			this.player.score++;

			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(enemy.body.x+enemy.width/2, enemy.body.y+enemy.height/2);
			explosion.play('kaboom', 30, false, true);

		},

		playerHit: function (player, bullet) {
			projectiles.hit.bind(bullet)(player, game);
			player.kill();

			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(player.body.x+player.width/2, player.body.y+player.height/2);
			explosion.play('kaboom', 30, false, true);


			if (this.lives > 0) {
				setTimeout(function() {
					this.lives--;
					playerImport.init.bind(this)(game);
				}.bind(this), 1000);
			}
			else {
				this.lose()
			}
		},

		projectieCollision: function (bullet1, bullet2) {
			projectiles.hit.bind(bullet1)(bullet2, game);
			projectiles.hit.bind(bullet2)(bullet1, game);
			this.player.score++;
		}
	}
}
