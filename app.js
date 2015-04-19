(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var game = new Phaser.Game(400, 600, Phaser.AUTO)
var ctx = require('./play/gameContext')(game);

var play = function(game){} 
play.prototype = {
	preload: function() {
		require('./play/preload').bind(ctx)(this);
	},
	create: function() {
		require('./play/create').bind(ctx)(this);
	},
	update: function() {
		require('./play/update').bind(ctx)(this);
	}
};

var intro = function(game){}
var lose = function(game){}
var win = function(game){}
intro.prototype = require('./screens/intro');
lose.prototype = require('./screens/lose');
win.prototype = require('./screens/win');
game.state.add("intro", intro);
game.state.add("lose", lose);
game.state.add("win", win);
game.state.add("play", play);
game.state.start("intro");

},{"./play/create":2,"./play/gameContext":5,"./play/preload":7,"./play/update":9,"./screens/intro":10,"./screens/lose":11,"./screens/win":12}],2:[function(require,module,exports){
var projectiles = require('./projectiles');

module.exports = function create(game) {
	// set physics engine to arcade
	game.physics.startSystem(Phaser.Physics.ARCADE);

	this.background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');
	this.lines = game.add.tileSprite(game.world.width/2 - 50/2, 0, 50, game.world.height, 'lines');

	this.playerBullets = game.add.group();
	projectiles.init.bind(this)(this.playerBullets, 'razor', game);

	this.hipsterBullets = game.add.group();
	projectiles.init.bind(this)(this.hipsterBullets, 'vinyl', game);

	this.fedoraBullets = game.add.group();
	projectiles.init.bind(this)(this.fedoraBullets, 'fedora', game);

	// create player sprite
	require('./player').init.bind(this)(game);

	// create enemies group
	require('./enemies').init.bind(this)(game);

	//  An explosion pool
	this.explosions = game.add.group();
	require('./explosions').init.bind(this)();

	//  And some controls to play the game with
	this.cursors = game.input.keyboard.createCursorKeys();
	this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	console.log('bam')
	this.startGame();
}

},{"./enemies":3,"./explosions":4,"./player":6,"./projectiles":8}],3:[function(require,module,exports){
var projectiles = require('./projectiles');

var firingTimer = 0;
var ENEMY_BULLET_SPEED = 300

function enemyFires(game) {
	var enemies = this.enemies;
	var player = this.player;
	var livingEnemies = [];
	enemies.forEachAlive(function(enemy){
		// put every living enemy in an array
		livingEnemies.push(enemy);
	});


	if (livingEnemies.length > 0) {
		var random=game.rnd.integerInRange(0,livingEnemies.length-1);

		// randomly select one of them
		var shooter=livingEnemies[random];


		//  Grab the first bullet we can from the pool
		var enemyBullet;
		if (shooter.name == 'fedoraHipster') {
			enemyBullet = this.fedoraBullets.getFirstExists(false);
		}
		if (shooter.name == 'hipster') {
			enemyBullet = this.hipsterBullets.getFirstExists(false);
		}
		if (enemyBullet) {
			projectiles.enemyFire.bind(enemyBullet)(game);

			// And fire the bullet from this enemy
			enemyBullet.reset(shooter.body.x+shooter.body.width/2, shooter.body.y+shooter.body.height/2);

			game.physics.arcade.moveToObject(enemyBullet,player,ENEMY_BULLET_SPEED);
			firingTimer = game.time.now + 2000;
		}
	}
}

module.exports = {
	init: function (game) {
		var enemies = this.enemies = game.add.group();
		enemies.enableBody = true
		enemies.physicsBodyType = Phaser.Physics.ARCADE
		for (var i = 0; i < 40; i++)
		{
			var enemyType = game.rnd.integerInRange(0, 2);
			var name = enemyType == 2 ? 'fedoraHipster' : 'hipster'
			var enemy = enemies.create(0, 0, name);
			enemy.kill()
			enemy.name = name;
			enemy.type = 'ground'
			enemy.id = i
			enemy.anchor.setTo(0.5, 0.5);
			enemy.animations.add('move', [ 0, 1 ], 5, true);
			enemy.play('move');
			enemy.hitpoints = enemyType == 2 ? 2 : 1
		}
	},

	update: function(game) {
		if (this.player.alive && game.time.now > firingTimer)
		{
			enemyFires.bind(this)(game);
		}

		this.enemies.forEach(function(enemy) {
			if (enemy.type == 'ground') {
				enemy.body.velocity.x = (enemy.direction == 0 ? -1 : 1) * 100
				if ((enemy.body.x < 0 && enemy.direction == 0) || (enemy.body.x > game.world.width - enemy.width && enemy.direction == 1)) {
					enemy.direction ^= 1
				}
			}

		}.bind(this));
	},

	reset: function(game) {
		this.enemies.forEach(function(enemy) {
			if (enemy.type == 'ground') {
				var x, y;
				x = Math.floor(enemy.id / 4);
				y = enemy.id % 4;
				enemy.reset(x * enemy.width + enemy.width/2, y * enemy.height + enemy.height/2);
				enemy.direction = y % 2 == 0 ? 1 : 0
			}
		});
	},
}

},{"./projectiles":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
			console.log(enemy.hitpoints)
			enemy.hitpoints -= bullet.penetration
			bullet.penetration--
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
			console.log('hi')
			projectiles.hit.bind(bullet)(player, game);
			bullet.kill();
			player.kill();

			var explosion = this.explosions.getFirstExists(false);
			// calculate explosion location
			explosion.reset(player.body.x+player.width/2, player.body.y+player.height/2);
			explosion.play('kaboom', 30, false, true);


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
			this.score++;
		}
	}
}

},{"./enemies":3,"./player":6,"./projectiles":8}],6:[function(require,module,exports){
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

},{"./projectiles":8}],7:[function(require,module,exports){
module.exports = function preload(game) {
	game.load.image('razor', 'assets/production/razor.png');
	game.load.image('vinyl', 'assets/production/vinyl.png');
	game.load.image('fedora', 'assets/production/fedoraProjectile.png');
	game.load.spritesheet('hipster', 'assets/production/hipsterSpriteSheet1.png', 62, 63);
	game.load.spritesheet('fedoraHipster', 'assets/production/fedoraHipsterSpriteSheet.png', 62, 63);
	game.load.spritesheet('player', 'assets/production/playerCharacterSheet.png', 64, 64);
	game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
	game.load.image('background', 'assets/production/background.png');
	game.load.image('lines', 'assets/production/lines.png');
}

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var enemies = require('./enemies');
var playerImport = require('./player');
var projectiles = require('./projectiles');

module.exports = function update(game) {
	//var domScore = document.getElementById('score')
	//var domLives = document.getElementById('lives')

	//if (domScore.innerText != this.score) {
	//domScore.innerText = this.score;
	//}
	//if (domLives.innerText != this.lives) {
	//domLives.innerText = this.lives;
	//}

	this.background.tilePosition.y += 2;
	this.lines.tilePosition.y += 2;
	playerImport.update.bind(this)(game);
	enemies.update.bind(this)(game);

	game.physics.arcade.overlap(this.playerBullets, this.enemies, this.enemyHit.bind(this), null, game);

	game.physics.arcade.overlap(this.hipsterBullets, this.player, this.playerHit.bind(this), null, game);
	game.physics.arcade.overlap(this.fedoraBullets, this.player, this.playerHit.bind(this), null, game);

	game.physics.arcade.overlap(this.hipsterBullets, this.playerBullets, this.projectileCollision.bind(this), null, game);
	game.physics.arcade.overlap(this.fedoraBullets, this.playerBullets, this.projectileCollision.bind(this), null, game);

	if (this.enemies.countLiving() == 0) {
		this.win();
	}
}


},{"./enemies":3,"./player":6,"./projectiles":8}],10:[function(require,module,exports){
module.exports = {
	preload: function() {
		this.load.image('intro', 'assets/production/VDS_mainScreen.png');
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
		this.scale.refresh()
	},
	create: function() {
		this.add.sprite(0, 0, 'intro');
		var stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = true;
		stateText.text = "Space to start";
		stateText.align = 'center'
	},
	update: function() {
		this.input.keyboard.onDownCallback = function(event) {

			if (this.game.state.getCurrentState().key == 'intro' && event.keyCode == 32 && event.repeat == false) {
				this.game.state.start('play');
			}
		}
	}
}

},{}],11:[function(require,module,exports){
module.exports = {
	preload: function() {
		var stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = true;
		stateText.text = "You lost.\nPress space to try again";
		stateText.align = 'center'
	},
	create: function() {
	},
	update: function() {
		this.input.keyboard.onDownCallback = function(event) {
			if (this.game.state.getCurrentState().key == 'lose' && event.keyCode == 32 && event.repeat == false) {
				this.game.state.start('play');
			}
		}
	}
}

},{}],12:[function(require,module,exports){
module.exports = {
	preload: function() {
		var stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '24px Arial', fill: '#fff' });
		stateText.anchor.setTo(0.5, 0.5);
		stateText.visible = true;
		stateText.text = "You Win.\nPress space to play again";
		stateText.align = 'center'
	},
	create: function() {
	},
	update: function() {
		this.input.keyboard.onDownCallback = function(event) {
			if (this.game.state.getCurrentState().key == 'win' && event.keyCode == 32 && event.repeat == false) {
				this.game.state.start('play');
			}
		}
	}
}

},{}],13:[function(require,module,exports){
var game = require('./game');

},{"./game":1}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcZGVzbW9uZFxcUHJvamVjdHNcXERlc3Ryb3lBbGxIaXBzdGVyc1xcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvZGVzbW9uZC9Qcm9qZWN0cy9EZXN0cm95QWxsSGlwc3RlcnMvYXBwL2dhbWUvaW5kZXguanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L2NyZWF0ZS5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZW5lbWllcy5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZXhwbG9zaW9ucy5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZ2FtZUNvbnRleHQuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L3BsYXllci5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvcHJlbG9hZC5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvcHJvamVjdGlsZXMuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L3VwZGF0ZS5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3NjcmVlbnMvaW50cm8uanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9zY3JlZW5zL2xvc2UuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9zY3JlZW5zL3dpbi5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSg0MDAsIDYwMCwgUGhhc2VyLkFVVE8pXHJcbnZhciBjdHggPSByZXF1aXJlKCcuL3BsYXkvZ2FtZUNvbnRleHQnKShnYW1lKTtcclxuXHJcbnZhciBwbGF5ID0gZnVuY3Rpb24oZ2FtZSl7fSBcclxucGxheS5wcm90b3R5cGUgPSB7XHJcblx0cHJlbG9hZDogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXF1aXJlKCcuL3BsYXkvcHJlbG9hZCcpLmJpbmQoY3R4KSh0aGlzKTtcclxuXHR9LFxyXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXF1aXJlKCcuL3BsYXkvY3JlYXRlJykuYmluZChjdHgpKHRoaXMpO1xyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHJlcXVpcmUoJy4vcGxheS91cGRhdGUnKS5iaW5kKGN0eCkodGhpcyk7XHJcblx0fVxyXG59O1xyXG5cclxudmFyIGludHJvID0gZnVuY3Rpb24oZ2FtZSl7fVxyXG52YXIgbG9zZSA9IGZ1bmN0aW9uKGdhbWUpe31cclxudmFyIHdpbiA9IGZ1bmN0aW9uKGdhbWUpe31cclxuaW50cm8ucHJvdG90eXBlID0gcmVxdWlyZSgnLi9zY3JlZW5zL2ludHJvJyk7XHJcbmxvc2UucHJvdG90eXBlID0gcmVxdWlyZSgnLi9zY3JlZW5zL2xvc2UnKTtcclxud2luLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vc2NyZWVucy93aW4nKTtcclxuZ2FtZS5zdGF0ZS5hZGQoXCJpbnRyb1wiLCBpbnRybyk7XHJcbmdhbWUuc3RhdGUuYWRkKFwibG9zZVwiLCBsb3NlKTtcclxuZ2FtZS5zdGF0ZS5hZGQoXCJ3aW5cIiwgd2luKTtcclxuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHBsYXkpO1xyXG5nYW1lLnN0YXRlLnN0YXJ0KFwiaW50cm9cIik7XHJcbiIsInZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKGdhbWUpIHtcclxuXHQvLyBzZXQgcGh5c2ljcyBlbmdpbmUgdG8gYXJjYWRlXHJcblx0Z2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XHJcblxyXG5cdHRoaXMuYmFja2dyb3VuZCA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgZ2FtZS53b3JsZC53aWR0aCwgZ2FtZS53b3JsZC5oZWlnaHQsICdiYWNrZ3JvdW5kJyk7XHJcblx0dGhpcy5saW5lcyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoZ2FtZS53b3JsZC53aWR0aC8yIC0gNTAvMiwgMCwgNTAsIGdhbWUud29ybGQuaGVpZ2h0LCAnbGluZXMnKTtcclxuXHJcblx0dGhpcy5wbGF5ZXJCdWxsZXRzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHRwcm9qZWN0aWxlcy5pbml0LmJpbmQodGhpcykodGhpcy5wbGF5ZXJCdWxsZXRzLCAncmF6b3InLCBnYW1lKTtcclxuXHJcblx0dGhpcy5oaXBzdGVyQnVsbGV0cyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblx0cHJvamVjdGlsZXMuaW5pdC5iaW5kKHRoaXMpKHRoaXMuaGlwc3RlckJ1bGxldHMsICd2aW55bCcsIGdhbWUpO1xyXG5cclxuXHR0aGlzLmZlZG9yYUJ1bGxldHMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cdHByb2plY3RpbGVzLmluaXQuYmluZCh0aGlzKSh0aGlzLmZlZG9yYUJ1bGxldHMsICdmZWRvcmEnLCBnYW1lKTtcclxuXHJcblx0Ly8gY3JlYXRlIHBsYXllciBzcHJpdGVcclxuXHRyZXF1aXJlKCcuL3BsYXllcicpLmluaXQuYmluZCh0aGlzKShnYW1lKTtcclxuXHJcblx0Ly8gY3JlYXRlIGVuZW1pZXMgZ3JvdXBcclxuXHRyZXF1aXJlKCcuL2VuZW1pZXMnKS5pbml0LmJpbmQodGhpcykoZ2FtZSk7XHJcblxyXG5cdC8vICBBbiBleHBsb3Npb24gcG9vbFxyXG5cdHRoaXMuZXhwbG9zaW9ucyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblx0cmVxdWlyZSgnLi9leHBsb3Npb25zJykuaW5pdC5iaW5kKHRoaXMpKCk7XHJcblxyXG5cdC8vICBBbmQgc29tZSBjb250cm9scyB0byBwbGF5IHRoZSBnYW1lIHdpdGhcclxuXHR0aGlzLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcclxuXHR0aGlzLmZpcmVCdXR0b24gPSBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xyXG5cdGNvbnNvbGUubG9nKCdiYW0nKVxyXG5cdHRoaXMuc3RhcnRHYW1lKCk7XHJcbn1cclxuIiwidmFyIHByb2plY3RpbGVzID0gcmVxdWlyZSgnLi9wcm9qZWN0aWxlcycpO1xyXG5cclxudmFyIGZpcmluZ1RpbWVyID0gMDtcclxudmFyIEVORU1ZX0JVTExFVF9TUEVFRCA9IDMwMFxyXG5cclxuZnVuY3Rpb24gZW5lbXlGaXJlcyhnYW1lKSB7XHJcblx0dmFyIGVuZW1pZXMgPSB0aGlzLmVuZW1pZXM7XHJcblx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xyXG5cdHZhciBsaXZpbmdFbmVtaWVzID0gW107XHJcblx0ZW5lbWllcy5mb3JFYWNoQWxpdmUoZnVuY3Rpb24oZW5lbXkpe1xyXG5cdFx0Ly8gcHV0IGV2ZXJ5IGxpdmluZyBlbmVteSBpbiBhbiBhcnJheVxyXG5cdFx0bGl2aW5nRW5lbWllcy5wdXNoKGVuZW15KTtcclxuXHR9KTtcclxuXHJcblxyXG5cdGlmIChsaXZpbmdFbmVtaWVzLmxlbmd0aCA+IDApIHtcclxuXHRcdHZhciByYW5kb209Z2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoMCxsaXZpbmdFbmVtaWVzLmxlbmd0aC0xKTtcclxuXHJcblx0XHQvLyByYW5kb21seSBzZWxlY3Qgb25lIG9mIHRoZW1cclxuXHRcdHZhciBzaG9vdGVyPWxpdmluZ0VuZW1pZXNbcmFuZG9tXTtcclxuXHJcblxyXG5cdFx0Ly8gIEdyYWIgdGhlIGZpcnN0IGJ1bGxldCB3ZSBjYW4gZnJvbSB0aGUgcG9vbFxyXG5cdFx0dmFyIGVuZW15QnVsbGV0O1xyXG5cdFx0aWYgKHNob290ZXIubmFtZSA9PSAnZmVkb3JhSGlwc3RlcicpIHtcclxuXHRcdFx0ZW5lbXlCdWxsZXQgPSB0aGlzLmZlZG9yYUJ1bGxldHMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHNob290ZXIubmFtZSA9PSAnaGlwc3RlcicpIHtcclxuXHRcdFx0ZW5lbXlCdWxsZXQgPSB0aGlzLmhpcHN0ZXJCdWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHRcdH1cclxuXHRcdGlmIChlbmVteUJ1bGxldCkge1xyXG5cdFx0XHRwcm9qZWN0aWxlcy5lbmVteUZpcmUuYmluZChlbmVteUJ1bGxldCkoZ2FtZSk7XHJcblxyXG5cdFx0XHQvLyBBbmQgZmlyZSB0aGUgYnVsbGV0IGZyb20gdGhpcyBlbmVteVxyXG5cdFx0XHRlbmVteUJ1bGxldC5yZXNldChzaG9vdGVyLmJvZHkueCtzaG9vdGVyLmJvZHkud2lkdGgvMiwgc2hvb3Rlci5ib2R5Lnkrc2hvb3Rlci5ib2R5LmhlaWdodC8yKTtcclxuXHJcblx0XHRcdGdhbWUucGh5c2ljcy5hcmNhZGUubW92ZVRvT2JqZWN0KGVuZW15QnVsbGV0LHBsYXllcixFTkVNWV9CVUxMRVRfU1BFRUQpO1xyXG5cdFx0XHRmaXJpbmdUaW1lciA9IGdhbWUudGltZS5ub3cgKyAyMDAwO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0aW5pdDogZnVuY3Rpb24gKGdhbWUpIHtcclxuXHRcdHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHRcdGVuZW1pZXMuZW5hYmxlQm9keSA9IHRydWVcclxuXHRcdGVuZW1pZXMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDQwOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBlbmVteVR5cGUgPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCAyKTtcclxuXHRcdFx0dmFyIG5hbWUgPSBlbmVteVR5cGUgPT0gMiA/ICdmZWRvcmFIaXBzdGVyJyA6ICdoaXBzdGVyJ1xyXG5cdFx0XHR2YXIgZW5lbXkgPSBlbmVtaWVzLmNyZWF0ZSgwLCAwLCBuYW1lKTtcclxuXHRcdFx0ZW5lbXkua2lsbCgpXHJcblx0XHRcdGVuZW15Lm5hbWUgPSBuYW1lO1xyXG5cdFx0XHRlbmVteS50eXBlID0gJ2dyb3VuZCdcclxuXHRcdFx0ZW5lbXkuaWQgPSBpXHJcblx0XHRcdGVuZW15LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcblx0XHRcdGVuZW15LmFuaW1hdGlvbnMuYWRkKCdtb3ZlJywgWyAwLCAxIF0sIDUsIHRydWUpO1xyXG5cdFx0XHRlbmVteS5wbGF5KCdtb3ZlJyk7XHJcblx0XHRcdGVuZW15LmhpdHBvaW50cyA9IGVuZW15VHlwZSA9PSAyID8gMiA6IDFcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHR1cGRhdGU6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdGlmICh0aGlzLnBsYXllci5hbGl2ZSAmJiBnYW1lLnRpbWUubm93ID4gZmlyaW5nVGltZXIpXHJcblx0XHR7XHJcblx0XHRcdGVuZW15RmlyZXMuYmluZCh0aGlzKShnYW1lKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbihlbmVteSkge1xyXG5cdFx0XHRpZiAoZW5lbXkudHlwZSA9PSAnZ3JvdW5kJykge1xyXG5cdFx0XHRcdGVuZW15LmJvZHkudmVsb2NpdHkueCA9IChlbmVteS5kaXJlY3Rpb24gPT0gMCA/IC0xIDogMSkgKiAxMDBcclxuXHRcdFx0XHRpZiAoKGVuZW15LmJvZHkueCA8IDAgJiYgZW5lbXkuZGlyZWN0aW9uID09IDApIHx8IChlbmVteS5ib2R5LnggPiBnYW1lLndvcmxkLndpZHRoIC0gZW5lbXkud2lkdGggJiYgZW5lbXkuZGlyZWN0aW9uID09IDEpKSB7XHJcblx0XHRcdFx0XHRlbmVteS5kaXJlY3Rpb24gXj0gMVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdH0uYmluZCh0aGlzKSk7XHJcblx0fSxcclxuXHJcblx0cmVzZXQ6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uKGVuZW15KSB7XHJcblx0XHRcdGlmIChlbmVteS50eXBlID09ICdncm91bmQnKSB7XHJcblx0XHRcdFx0dmFyIHgsIHk7XHJcblx0XHRcdFx0eCA9IE1hdGguZmxvb3IoZW5lbXkuaWQgLyA0KTtcclxuXHRcdFx0XHR5ID0gZW5lbXkuaWQgJSA0O1xyXG5cdFx0XHRcdGVuZW15LnJlc2V0KHggKiBlbmVteS53aWR0aCArIGVuZW15LndpZHRoLzIsIHkgKiBlbmVteS5oZWlnaHQgKyBlbmVteS5oZWlnaHQvMik7XHJcblx0XHRcdFx0ZW5lbXkuZGlyZWN0aW9uID0geSAlIDIgPT0gMCA/IDEgOiAwXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0sXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0aW5pdDogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgZXhwbG9zaW9ucyA9IHRoaXMuZXhwbG9zaW9uc1xyXG5cdFx0ZXhwbG9zaW9ucy5jcmVhdGVNdWx0aXBsZSg1MCwgJ2thYm9vbScpO1xyXG5cdFx0ZXhwbG9zaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGV4cGxvc2lvbikge1xyXG5cdFx0XHRleHBsb3Npb24uYW5jaG9yLnggPSAwLjU7XHJcblx0XHRcdGV4cGxvc2lvbi5hbmNob3IueSA9IDAuNTtcclxuXHRcdFx0ZXhwbG9zaW9uLmFuaW1hdGlvbnMuYWRkKCdrYWJvb20nKTtcclxuXHRcdH0sIHRoaXMpO1xyXG5cdH1cclxufVxyXG4iLCJ2YXIgZW5lbWllcyA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xyXG52YXIgcGxheWVySW1wb3J0ID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcclxudmFyIHByb2plY3RpbGVzID0gcmVxdWlyZSgnLi9wcm9qZWN0aWxlcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihnYW1lKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdHN0YXJ0R2FtZTogZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xyXG5cdFx0XHR0aGlzLmxpdmVzID0gMztcclxuXHRcdFx0dGhpcy5zY29yZSA9IDA7XHJcblx0XHRcdHBsYXllckltcG9ydC5yZXNldC5iaW5kKHRoaXMpKGdhbWUpO1xyXG5cdFx0XHRlbmVtaWVzLnJlc2V0LmJpbmQodGhpcykoZ2FtZSlcclxuXHRcdH0sXHJcblxyXG5cdFx0d2luOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGdhbWUuc3RhdGUuc3RhcnQoJ3dpbicpXHJcblx0XHR9LFxyXG5cclxuXHRcdGxvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Z2FtZS5zdGF0ZS5zdGFydCgnbG9zZScpXHJcblx0XHR9LFxyXG5cclxuXHRcdGVuZW15SGl0OiBmdW5jdGlvbiAoYnVsbGV0LCBlbmVteSkge1xyXG5cdFx0XHRpZiAoYnVsbGV0LnBlbmV0cmF0aW9uIDw9IDApIHtcclxuXHRcdFx0ICBcdHJldHVyblxyXG5cdFx0XHR9XHJcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldCkoZW5lbXksIGdhbWUpO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhlbmVteS5oaXRwb2ludHMpXHJcblx0XHRcdGVuZW15LmhpdHBvaW50cyAtPSBidWxsZXQucGVuZXRyYXRpb25cclxuXHRcdFx0YnVsbGV0LnBlbmV0cmF0aW9uLS1cclxuXHRcdFx0XHRpZiAoYnVsbGV0LnBlbmV0cmF0aW9uIDwgMCkge1xyXG5cdFx0XHRcdGJ1bGxldC5raWxsKClcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoZW5lbXkuaGl0cG9pbnRzIDw9IDApIHtcclxuXHRcdFx0XHRlbmVteS5raWxsKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5zY29yZSsrO1xyXG5cclxuXHRcdFx0dmFyIGV4cGxvc2lvbiA9IHRoaXMuZXhwbG9zaW9ucy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcblx0XHRcdC8vIGNhbGN1bGF0ZSBleHBsb3Npb24gbG9jYXRpb25cclxuXHRcdFx0ZXhwbG9zaW9uLnJlc2V0KGVuZW15LmJvZHkueCtlbmVteS53aWR0aC8yLCBlbmVteS5ib2R5LnkrZW5lbXkuaGVpZ2h0LzIpO1xyXG5cdFx0XHRleHBsb3Npb24ucGxheSgna2Fib29tJywgMzAsIGZhbHNlLCB0cnVlKTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHRcdHBsYXllckhpdDogZnVuY3Rpb24gKHBsYXllciwgYnVsbGV0KSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdoaScpXHJcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldCkocGxheWVyLCBnYW1lKTtcclxuXHRcdFx0YnVsbGV0LmtpbGwoKTtcclxuXHRcdFx0cGxheWVyLmtpbGwoKTtcclxuXHJcblx0XHRcdHZhciBleHBsb3Npb24gPSB0aGlzLmV4cGxvc2lvbnMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG5cdFx0XHQvLyBjYWxjdWxhdGUgZXhwbG9zaW9uIGxvY2F0aW9uXHJcblx0XHRcdGV4cGxvc2lvbi5yZXNldChwbGF5ZXIuYm9keS54K3BsYXllci53aWR0aC8yLCBwbGF5ZXIuYm9keS55K3BsYXllci5oZWlnaHQvMik7XHJcblx0XHRcdGV4cGxvc2lvbi5wbGF5KCdrYWJvb20nLCAzMCwgZmFsc2UsIHRydWUpO1xyXG5cclxuXHJcblx0XHRcdGlmICh0aGlzLmxpdmVzID4gMCkge1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR0aGlzLmxpdmVzLS07XHJcblx0XHRcdFx0XHRwbGF5ZXJJbXBvcnQucmVzZXQuYmluZCh0aGlzKShnYW1lKTtcclxuXHRcdFx0XHR9LmJpbmQodGhpcyksIDEwMDApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMubG9zZSgpXHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0cHJvamVjdGlsZUNvbGxpc2lvbjogZnVuY3Rpb24gKGJ1bGxldDEsIGJ1bGxldDIpIHtcclxuXHRcdFx0YnVsbGV0MS5wZW5ldHJhdGlvbi0tO1xyXG5cdFx0XHRidWxsZXQyLnBlbmV0cmF0aW9uLS07XHJcblx0XHRcdGlmIChidWxsZXQxLnBlbmV0cmF0aW9uIDw9IDApIHtcclxuXHRcdFx0XHRidWxsZXQxLmtpbGwoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoYnVsbGV0Mi5wZW5ldHJhdGlvbiA8PSAwKSB7XHJcblx0XHRcdFx0YnVsbGV0Mi5raWxsKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cHJvamVjdGlsZXMuaGl0LmJpbmQoYnVsbGV0MSkoYnVsbGV0MiwgZ2FtZSk7XHJcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldDIpKGJ1bGxldDEsIGdhbWUpO1xyXG5cdFx0XHR2YXIgZXhwbG9zaW9uID0gdGhpcy5leHBsb3Npb25zLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHRcdFx0Ly8gY2FsY3VsYXRlIGV4cGxvc2lvbiBsb2NhdGlvblxyXG5cdFx0XHRleHBsb3Npb24ucmVzZXQoYnVsbGV0MS5ib2R5LngrYnVsbGV0MS53aWR0aC8yLCBidWxsZXQxLmJvZHkueStidWxsZXQxLmhlaWdodC8yKTtcclxuXHRcdFx0ZXhwbG9zaW9uLnBsYXkoJ2thYm9vbScsIDMwLCBmYWxzZSwgdHJ1ZSk7XHJcblx0XHRcdHRoaXMuc2NvcmUrKztcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwidmFyIGJ1bGxldFRpbWUgPSAwXHJcblxyXG52YXIgcHJvamVjdGlsZXMgPSByZXF1aXJlKCcuL3Byb2plY3RpbGVzJylcclxuXHJcbmZ1bmN0aW9uIGZpcmVidWxsZXQoZ2FtZSkge1xyXG5cdC8vICBUbyBhdm9pZCB0aGVtIGJlaW5nIGFsbG93ZWQgdG8gZmlyZSB0b28gZmFzdCB3ZSBzZXQgYSB0aW1lIGxpbWl0XHJcblx0aWYgKGdhbWUudGltZS5ub3cgPiBidWxsZXRUaW1lKSB7XHJcblx0XHQvLyAgR3JhYiB0aGUgZmlyc3QgYnVsbGV0IHdlIGNhbiBmcm9tIHRoZSBwb29sXHJcblx0XHR2YXIgYnVsbGV0ID0gdGhpcy5wbGF5ZXJCdWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHRcdHByb2plY3RpbGVzLnBsYXllckZpcmUuYmluZChidWxsZXQpKGdhbWUpO1xyXG5cdFx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xyXG5cclxuXHRcdGlmIChidWxsZXQpIHtcclxuXHRcdFx0Ly8gIEFuZCBmaXJlIGl0XHJcblx0XHRcdGJ1bGxldC5yZXNldChwbGF5ZXIueCwgcGxheWVyLnkgKyA4KTtcclxuXHRcdFx0YnVsbGV0LmJvZHkudmVsb2NpdHkueSA9IC00MDA7XHJcblx0XHRcdGJ1bGxldFRpbWUgPSBnYW1lLnRpbWUubm93ICsgMjAwO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Ly8gcHV0IHRoZSBwbGF5ZXIgb24gdGhlIG1hcFxyXG5cdGluaXQ6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAncGxheWVyJylcclxuXHRcdHBsYXllci5raWxsKClcclxuXHRcdHBsYXllci5hbmNob3Iuc2V0VG8oLjUsLjUpXHJcblx0XHRnYW1lLnBoeXNpY3MuZW5hYmxlKHBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxyXG5cdFx0cGxheWVyLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXHJcblx0XHRwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ21vdmUnLCBbIDAsIDEgXSwgNSwgdHJ1ZSk7XHJcblx0fSxcclxuXHJcblx0Ly8gdXBkYXRlIGdhbWUgbG9vcFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24oZ2FtZSkge1xyXG5cdFx0dmFyIGN1cnNvcnMgPSB0aGlzLmN1cnNvcnM7XHJcblx0XHR2YXIgZmlyZUJ1dHRvbiA9IHRoaXMuZmlyZUJ1dHRvblxyXG5cdFx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xyXG5cclxuXHRcdGlmICghcGxheWVyLmFsaXZlKSByZXR1cm47XHJcblxyXG5cdFx0cGxheWVyLmJvZHkudmVsb2NpdHkuc2V0VG8oMCwgMCk7XHJcblxyXG5cdFx0aWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcclxuXHRcdFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0yMDA7XHJcblx0XHRcdHBsYXllci5wbGF5KCdtb3ZlJylcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcblx0XHRcdHBsYXllci5wbGF5KCdtb3ZlJylcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgYW5pbWF0aW9uID0gcGxheWVyLmFuaW1hdGlvbnMuY3VycmVudEFuaW0uc3RvcCgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuZmlyZUJ1dHRvbi5pc0Rvd24pIHtcclxuXHRcdFx0ZmlyZWJ1bGxldC5iaW5kKHRoaXMpKGdhbWUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKChwbGF5ZXIuYm9keS54IDw9IDAgJiYgcGxheWVyLmJvZHkudmVsb2NpdHkueCA8IDApIHx8IChwbGF5ZXIuYm9keS54ID49IGdhbWUud29ybGQud2lkdGggLSBwbGF5ZXIud2lkdGggJiYgcGxheWVyLmJvZHkudmVsb2NpdHkueCA+IDApKSB7XHJcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0cmVzZXQ6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHRoaXMucGxheWVyLnJlc2V0KGdhbWUud29ybGQud2lkdGgvMiwgZ2FtZS53b3JsZC5oZWlnaHQtdGhpcy5wbGF5ZXIuaGVpZ2h0LzIpO1xyXG5cdH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByZWxvYWQoZ2FtZSkge1xyXG5cdGdhbWUubG9hZC5pbWFnZSgncmF6b3InLCAnYXNzZXRzL3Byb2R1Y3Rpb24vcmF6b3IucG5nJyk7XHJcblx0Z2FtZS5sb2FkLmltYWdlKCd2aW55bCcsICdhc3NldHMvcHJvZHVjdGlvbi92aW55bC5wbmcnKTtcclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ2ZlZG9yYScsICdhc3NldHMvcHJvZHVjdGlvbi9mZWRvcmFQcm9qZWN0aWxlLnBuZycpO1xyXG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgnaGlwc3RlcicsICdhc3NldHMvcHJvZHVjdGlvbi9oaXBzdGVyU3ByaXRlU2hlZXQxLnBuZycsIDYyLCA2Myk7XHJcblx0Z2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdmZWRvcmFIaXBzdGVyJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL2ZlZG9yYUhpcHN0ZXJTcHJpdGVTaGVldC5wbmcnLCA2MiwgNjMpO1xyXG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgncGxheWVyJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL3BsYXllckNoYXJhY3RlclNoZWV0LnBuZycsIDY0LCA2NCk7XHJcblx0Z2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdrYWJvb20nLCAnYXNzZXRzL2dhbWVzL2ludmFkZXJzL2V4cGxvZGUucG5nJywgMTI4LCAxMjgpO1xyXG5cdGdhbWUubG9hZC5pbWFnZSgnYmFja2dyb3VuZCcsICdhc3NldHMvcHJvZHVjdGlvbi9iYWNrZ3JvdW5kLnBuZycpO1xyXG5cdGdhbWUubG9hZC5pbWFnZSgnbGluZXMnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vbGluZXMucG5nJyk7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0aW5pdDogZnVuY3Rpb24oYnVsbGV0cywgc3ByaXRlTmFtZSwgZ2FtZSkge1xyXG5cdFx0YnVsbGV0cy5lbmFibGVCb2R5ID0gdHJ1ZTtcclxuXHRcdGJ1bGxldHMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFO1xyXG5cdFx0YnVsbGV0cy5jcmVhdGVNdWx0aXBsZSgzMCwgc3ByaXRlTmFtZSk7XHJcblx0XHRidWxsZXRzLnNldEFsbCgnYW5jaG9yLngnLCAwLjUpO1xyXG5cdFx0YnVsbGV0cy5zZXRBbGwoJ2FuY2hvci55JywgMSk7XHJcblx0XHRidWxsZXRzLnNldEFsbCgnb3V0T2ZCb3VuZHNLaWxsJywgdHJ1ZSk7XHJcblx0XHRidWxsZXRzLnNldEFsbCgnY2hlY2tXb3JsZEJvdW5kcycsIHRydWUpO1xyXG5cdH0sXHJcblxyXG5cdHBsYXllckZpcmU6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHRoaXMucGVuZXRyYXRpb24gPSAxO1xyXG5cdH0sXHJcblxyXG5cdGVuZW15RmlyZTogZnVuY3Rpb24oZ2FtZSkge1xyXG5cdFx0dGhpcy5wZW5ldHJhdGlvbiA9IDE7XHJcblx0fSxcclxuXHJcblx0aGl0OiBmdW5jdGlvbih0YXJnZXQsIGdhbWUpIHtcclxuXHR9XHJcbn1cclxuIiwidmFyIGVuZW1pZXMgPSByZXF1aXJlKCcuL2VuZW1pZXMnKTtcclxudmFyIHBsYXllckltcG9ydCA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XHJcbnZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXBkYXRlKGdhbWUpIHtcclxuXHQvL3ZhciBkb21TY29yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZScpXHJcblx0Ly92YXIgZG9tTGl2ZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGl2ZXMnKVxyXG5cclxuXHQvL2lmIChkb21TY29yZS5pbm5lclRleHQgIT0gdGhpcy5zY29yZSkge1xyXG5cdC8vZG9tU2NvcmUuaW5uZXJUZXh0ID0gdGhpcy5zY29yZTtcclxuXHQvL31cclxuXHQvL2lmIChkb21MaXZlcy5pbm5lclRleHQgIT0gdGhpcy5saXZlcykge1xyXG5cdC8vZG9tTGl2ZXMuaW5uZXJUZXh0ID0gdGhpcy5saXZlcztcclxuXHQvL31cclxuXHJcblx0dGhpcy5iYWNrZ3JvdW5kLnRpbGVQb3NpdGlvbi55ICs9IDI7XHJcblx0dGhpcy5saW5lcy50aWxlUG9zaXRpb24ueSArPSAyO1xyXG5cdHBsYXllckltcG9ydC51cGRhdGUuYmluZCh0aGlzKShnYW1lKTtcclxuXHRlbmVtaWVzLnVwZGF0ZS5iaW5kKHRoaXMpKGdhbWUpO1xyXG5cclxuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5wbGF5ZXJCdWxsZXRzLCB0aGlzLmVuZW1pZXMsIHRoaXMuZW5lbXlIaXQuYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XHJcblxyXG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhpcHN0ZXJCdWxsZXRzLCB0aGlzLnBsYXllciwgdGhpcy5wbGF5ZXJIaXQuYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XHJcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuZmVkb3JhQnVsbGV0cywgdGhpcy5wbGF5ZXIsIHRoaXMucGxheWVySGl0LmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xyXG5cclxuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oaXBzdGVyQnVsbGV0cywgdGhpcy5wbGF5ZXJCdWxsZXRzLCB0aGlzLnByb2plY3RpbGVDb2xsaXNpb24uYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XHJcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuZmVkb3JhQnVsbGV0cywgdGhpcy5wbGF5ZXJCdWxsZXRzLCB0aGlzLnByb2plY3RpbGVDb2xsaXNpb24uYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XHJcblxyXG5cdGlmICh0aGlzLmVuZW1pZXMuY291bnRMaXZpbmcoKSA9PSAwKSB7XHJcblx0XHR0aGlzLndpbigpO1xyXG5cdH1cclxufVxyXG5cclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0cHJlbG9hZDogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ2ludHJvJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL1ZEU19tYWluU2NyZWVuLnBuZycpO1xyXG5cdFx0dGhpcy5zY2FsZS5zY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMXHJcblx0XHR0aGlzLnNjYWxlLnJlZnJlc2goKVxyXG5cdH0sXHJcblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuYWRkLnNwcml0ZSgwLCAwLCAnaW50cm8nKTtcclxuXHRcdHZhciBzdGF0ZVRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCx0aGlzLndvcmxkLmNlbnRlclksJyAnLCB7IGZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmYnIH0pO1xyXG5cdFx0c3RhdGVUZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcblx0XHRzdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XHJcblx0XHRzdGF0ZVRleHQudGV4dCA9IFwiU3BhY2UgdG8gc3RhcnRcIjtcclxuXHRcdHN0YXRlVGV4dC5hbGlnbiA9ICdjZW50ZXInXHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5pbnB1dC5rZXlib2FyZC5vbkRvd25DYWxsYmFjayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG5cdFx0XHRpZiAodGhpcy5nYW1lLnN0YXRlLmdldEN1cnJlbnRTdGF0ZSgpLmtleSA9PSAnaW50cm8nICYmIGV2ZW50LmtleUNvZGUgPT0gMzIgJiYgZXZlbnQucmVwZWF0ID09IGZhbHNlKSB7XHJcblx0XHRcdFx0dGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdwbGF5Jyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0cHJlbG9hZDogZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgc3RhdGVUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLndvcmxkLmNlbnRlclgsdGhpcy53b3JsZC5jZW50ZXJZLCcgJywgeyBmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmJyB9KTtcclxuXHRcdHN0YXRlVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xyXG5cdFx0c3RhdGVUZXh0LnZpc2libGUgPSB0cnVlO1xyXG5cdFx0c3RhdGVUZXh0LnRleHQgPSBcIllvdSBsb3N0LlxcblByZXNzIHNwYWNlIHRvIHRyeSBhZ2FpblwiO1xyXG5cdFx0c3RhdGVUZXh0LmFsaWduID0gJ2NlbnRlcidcclxuXHR9LFxyXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5pbnB1dC5rZXlib2FyZC5vbkRvd25DYWxsYmFjayA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdGlmICh0aGlzLmdhbWUuc3RhdGUuZ2V0Q3VycmVudFN0YXRlKCkua2V5ID09ICdsb3NlJyAmJiBldmVudC5rZXlDb2RlID09IDMyICYmIGV2ZW50LnJlcGVhdCA9PSBmYWxzZSkge1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncGxheScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHN0YXRlVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy53b3JsZC5jZW50ZXJYLHRoaXMud29ybGQuY2VudGVyWSwnICcsIHsgZm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZicgfSk7XHJcblx0XHRzdGF0ZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuXHRcdHN0YXRlVGV4dC52aXNpYmxlID0gdHJ1ZTtcclxuXHRcdHN0YXRlVGV4dC50ZXh0ID0gXCJZb3UgV2luLlxcblByZXNzIHNwYWNlIHRvIHBsYXkgYWdhaW5cIjtcclxuXHRcdHN0YXRlVGV4dC5hbGlnbiA9ICdjZW50ZXInXHJcblx0fSxcclxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRpZiAodGhpcy5nYW1lLnN0YXRlLmdldEN1cnJlbnRTdGF0ZSgpLmtleSA9PSAnd2luJyAmJiBldmVudC5rZXlDb2RlID09IDMyICYmIGV2ZW50LnJlcGVhdCA9PSBmYWxzZSkge1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncGxheScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyk7XHJcbiJdfQ==
