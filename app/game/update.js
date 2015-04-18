var enemies = require('./enemies');
var player = require('./player');
var projectiles = require('./projectiles');

function startGame() {
	var ctx = this.ctx;
	ctx.playing = true;
	ctx.player.lives = 3;
	ctx.player.score = 0;
}

function win() {
	var ctx = this.ctx
	ctx.playing = false
	ctx.stateText.text = "You win"
	ctx.stateText.visible = true;
}

function lose() {

}

module.exports = function update() {
	var ctx = this.ctx;

	var domScore = document.getElementById('score')
	var domLives = document.getElementById('lives')

	if (domScore.innerText != ctx.player.score) {
		domScore.innerText = ctx.player.score;
	}
	if (domLives.innerText != ctx.player.lives) {
		domLives.innerText = ctx.player.lives;
	}

	if (ctx.playing) {
		ctx.background.tilePosition.y += 2;
		player.update.bind(ctx)(this);
		enemies.update.bind(ctx)(this);

		this.physics.arcade.overlap(ctx.playerBullets, ctx.enemies, function enemyHit(bullet, enemy) {
			enemies.hit.bind(enemy)(this);
			projectiles.hit.bind(bullet)(enemy, this);
		}.bind(this), null, this);
		this.physics.arcade.overlap(ctx.enemyBullets, ctx.player, function playerHit(ship, bullet) {
			player.hit.bind(ship)(this);
			projectiles.hit.bind(bullet)(ship, this);
		}.bind(this), null, this);
		this.physics.arcade.overlap(ctx.enemyBullets, ctx.playerBullets, function playerHit(bullet1, bullet2) {
			projectiles.hit.bind(bullet1)(bullet2, this);
			projectiles.hit.bind(bullet2)(bullet1, this);
			ctx.player.score++;
		}.bind(this), null, this);

		if (ctx.enemies.countLiving() == 0) {
			win.bind(this)();
		}
	}
	else {
		var stateText = ctx.stateText;
		stateText.visible = true;
		stateText.text = "Space to start";
		if (ctx.fireButton.isDown) {
			stateText.visible = false;
			startGame.bind(this)();
		}
	}

}
