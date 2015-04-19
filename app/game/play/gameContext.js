var enemies = require('./enemies');
var playerImport = require('./player');
var projectiles = require('./projectiles');

module.exports = function(game) {
	return {
		startGame: function startGame() {
			this.lives = 3;
			this.score = 0;
			playerImport.reset.bind(this)(game);
			enemies.reset.bind(this)(game)
		},

		win: function () {
			game.state.start('win')
		},

		lose: function () {
			game.state.start('lose')
		},

		enemyHit: function (bullet, enemy) {
			if (bullet.penetration <= 0) {
			  	return
			}
			projectiles.hit.bind(bullet)(enemy, game);
			enemy.hitpoints -= bullet.penetration
			bullet.penetration--;
			this.boom.play();
				if (bullet.penetration < 0) {
				bullet.kill()
			}
			if (enemy.hitpoints <= 0) {
				enemy.kill();
			}
			this.score++;

			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(enemy.body.x+enemy.width/2, enemy.body.y+enemy.height/2);
			explosion.play('kaboom', 30, false, true);

		},

		playerHit: function (player, bullet) {
			projectiles.hit.bind(bullet)(player, game);
			bullet.kill();
			player.kill();

			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(player.body.x+player.width/2, player.body.y+player.height/2);
			explosion.play('kaboom', 30, false, true);
			this.boom.play();


			if (this.lives > 0) {
				setTimeout(function() {
					this.lives--;
					playerImport.reset.bind(this)(game);
				}.bind(this), 1000);
			}
			else {
				this.lose()
			}
		},

		projectileCollision: function (bullet1, bullet2) {
			bullet1.penetration--;
			bullet2.penetration--;
			if (bullet1.penetration <= 0) {
				bullet1.kill();
			}
			if (bullet2.penetration <= 0) {
				bullet2.kill();
			}
			projectiles.hit.bind(bullet1)(bullet2, game);
			projectiles.hit.bind(bullet2)(bullet1, game);
			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(bullet1.body.x+bullet1.width/2, bullet1.body.y+bullet1.height/2);
			explosion.play('kaboom', 30, false, true);
			this.boom.play();
			this.score++;
		}
	}
}
