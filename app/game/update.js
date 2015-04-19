var enemies = require('./enemies');
var playerImport = require('./player');
var projectiles = require('./projectiles');

module.exports = function update(game) {
	var domScore = document.getElementById('score')
	var domLives = document.getElementById('lives')

	if (domScore.innerText != this.score) {
		domScore.innerText = this.score;
	}
	if (domLives.innerText != this.lives) {
		domLives.innerText = this.lives;
	}

	if (this.playing) {
		this.background.tilePosition.y += 2;
		playerImport.update.bind(this)(game);
		enemies.update.bind(this)(game);

		game.physics.arcade.overlap(this.playerBullets, this.enemies, this.enemyHit.bind(this), null, game);
		game.physics.arcade.overlap(this.enemyBullets, this.player, this.playerHit.bind(this), null, game);

		game.physics.arcade.overlap(this.enemyBullets, this.playerBullets, this.projectileCollision, null, game);

		if (this.enemies.countLiving() == 0) {
			this.win();
		}
	}
	else {
		// start the game when the action button is pressed
		if (this.fireButton.isDown) {
			this.startGame();
		}
	}


}

