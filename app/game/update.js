var aliens = require('./aliens');
var player = require('./player');
var projectiles = require('./projectiles');

module.exports = function update() {
	var ctx = this.ctx;
	ctx.starfield.tilePosition.y += 2;

	player.update.bind(ctx)(this);
	aliens.update.bind(ctx)(this);

	this.physics.arcade.overlap(ctx.playerBullets, ctx.aliens, function enemyHit(bullet, alien) {
		aliens.hit.bind(alien)(this);
		projectiles.hit.bind(bullet)(this);
	}.bind(this), null, this);
	this.physics.arcade.overlap(ctx.enemyBullets, ctx.player, function playerHit(ship, bullet) {
		player.hit.bind(ship)(this);
		projectiles.hit.bind(bullet)(this);
	}.bind(this), null, this);
}
