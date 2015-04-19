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


	this.throw = game.add.audio('throw', 1);
	this.boom = game.add.audio('boom', 1);

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

},{"./enemies":3,"./player":6,"./projectiles":8}],6:[function(require,module,exports){
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

},{"./projectiles":8}],7:[function(require,module,exports){
module.exports = function preload(game) {
	game.load.audio('boom', '/assets/production/boom.wav');
	game.load.audio('throw', '/assets/production/throw.mp3');
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
		this.penetration = 2;
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
		this.load.audio('bgm', '/assets/production/NocturneofHipster.mp3');
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
		var music = this.add.audio('bgm', 1, true);
		music.play();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcZGVzbW9uZFxcUHJvamVjdHNcXERlc3Ryb3lBbGxIaXBzdGVyc1xcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvZGVzbW9uZC9Qcm9qZWN0cy9EZXN0cm95QWxsSGlwc3RlcnMvYXBwL2dhbWUvaW5kZXguanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L2NyZWF0ZS5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZW5lbWllcy5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZXhwbG9zaW9ucy5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvZ2FtZUNvbnRleHQuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L3BsYXllci5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvcHJlbG9hZC5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3BsYXkvcHJvamVjdGlsZXMuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9wbGF5L3VwZGF0ZS5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9nYW1lL3NjcmVlbnMvaW50cm8uanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9zY3JlZW5zL2xvc2UuanMiLCJDOi9Vc2Vycy9kZXNtb25kL1Byb2plY3RzL0Rlc3Ryb3lBbGxIaXBzdGVycy9hcHAvZ2FtZS9zY3JlZW5zL3dpbi5qcyIsIkM6L1VzZXJzL2Rlc21vbmQvUHJvamVjdHMvRGVzdHJveUFsbEhpcHN0ZXJzL2FwcC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDQwMCwgNjAwLCBQaGFzZXIuQVVUTylcclxudmFyIGN0eCA9IHJlcXVpcmUoJy4vcGxheS9nYW1lQ29udGV4dCcpKGdhbWUpO1xyXG5cclxudmFyIHBsYXkgPSBmdW5jdGlvbihnYW1lKXt9IFxyXG5wbGF5LnByb3RvdHlwZSA9IHtcclxuXHRwcmVsb2FkOiBmdW5jdGlvbigpIHtcclxuXHRcdHJlcXVpcmUoJy4vcGxheS9wcmVsb2FkJykuYmluZChjdHgpKHRoaXMpO1xyXG5cdH0sXHJcblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHJlcXVpcmUoJy4vcGxheS9jcmVhdGUnKS5iaW5kKGN0eCkodGhpcyk7XHJcblx0fSxcclxuXHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmVxdWlyZSgnLi9wbGF5L3VwZGF0ZScpLmJpbmQoY3R4KSh0aGlzKTtcclxuXHR9XHJcbn07XHJcblxyXG52YXIgaW50cm8gPSBmdW5jdGlvbihnYW1lKXt9XHJcbnZhciBsb3NlID0gZnVuY3Rpb24oZ2FtZSl7fVxyXG52YXIgd2luID0gZnVuY3Rpb24oZ2FtZSl7fVxyXG5pbnRyby5wcm90b3R5cGUgPSByZXF1aXJlKCcuL3NjcmVlbnMvaW50cm8nKTtcclxubG9zZS5wcm90b3R5cGUgPSByZXF1aXJlKCcuL3NjcmVlbnMvbG9zZScpO1xyXG53aW4ucHJvdG90eXBlID0gcmVxdWlyZSgnLi9zY3JlZW5zL3dpbicpO1xyXG5nYW1lLnN0YXRlLmFkZChcImludHJvXCIsIGludHJvKTtcclxuZ2FtZS5zdGF0ZS5hZGQoXCJsb3NlXCIsIGxvc2UpO1xyXG5nYW1lLnN0YXRlLmFkZChcIndpblwiLCB3aW4pO1xyXG5nYW1lLnN0YXRlLmFkZChcInBsYXlcIiwgcGxheSk7XHJcbmdhbWUuc3RhdGUuc3RhcnQoXCJpbnRyb1wiKTtcclxuIiwidmFyIHByb2plY3RpbGVzID0gcmVxdWlyZSgnLi9wcm9qZWN0aWxlcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGUoZ2FtZSkge1xyXG5cdC8vIHNldCBwaHlzaWNzIGVuZ2luZSB0byBhcmNhZGVcclxuXHRnYW1lLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcclxuXHJcblxyXG5cdHRoaXMudGhyb3cgPSBnYW1lLmFkZC5hdWRpbygndGhyb3cnLCAxKTtcclxuXHR0aGlzLmJvb20gPSBnYW1lLmFkZC5hdWRpbygnYm9vbScsIDEpO1xyXG5cclxuXHR0aGlzLmJhY2tncm91bmQgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIGdhbWUud29ybGQud2lkdGgsIGdhbWUud29ybGQuaGVpZ2h0LCAnYmFja2dyb3VuZCcpO1xyXG5cdHRoaXMubGluZXMgPSBnYW1lLmFkZC50aWxlU3ByaXRlKGdhbWUud29ybGQud2lkdGgvMiAtIDUwLzIsIDAsIDUwLCBnYW1lLndvcmxkLmhlaWdodCwgJ2xpbmVzJyk7XHJcblxyXG5cdHRoaXMucGxheWVyQnVsbGV0cyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblx0cHJvamVjdGlsZXMuaW5pdC5iaW5kKHRoaXMpKHRoaXMucGxheWVyQnVsbGV0cywgJ3Jhem9yJywgZ2FtZSk7XHJcblxyXG5cdHRoaXMuaGlwc3RlckJ1bGxldHMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cdHByb2plY3RpbGVzLmluaXQuYmluZCh0aGlzKSh0aGlzLmhpcHN0ZXJCdWxsZXRzLCAndmlueWwnLCBnYW1lKTtcclxuXHJcblx0dGhpcy5mZWRvcmFCdWxsZXRzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHRwcm9qZWN0aWxlcy5pbml0LmJpbmQodGhpcykodGhpcy5mZWRvcmFCdWxsZXRzLCAnZmVkb3JhJywgZ2FtZSk7XHJcblxyXG5cdC8vIGNyZWF0ZSBwbGF5ZXIgc3ByaXRlXHJcblx0cmVxdWlyZSgnLi9wbGF5ZXInKS5pbml0LmJpbmQodGhpcykoZ2FtZSk7XHJcblxyXG5cdC8vIGNyZWF0ZSBlbmVtaWVzIGdyb3VwXHJcblx0cmVxdWlyZSgnLi9lbmVtaWVzJykuaW5pdC5iaW5kKHRoaXMpKGdhbWUpO1xyXG5cclxuXHQvLyAgQW4gZXhwbG9zaW9uIHBvb2xcclxuXHR0aGlzLmV4cGxvc2lvbnMgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG5cdHJlcXVpcmUoJy4vZXhwbG9zaW9ucycpLmluaXQuYmluZCh0aGlzKSgpO1xyXG5cclxuXHQvLyAgQW5kIHNvbWUgY29udHJvbHMgdG8gcGxheSB0aGUgZ2FtZSB3aXRoXHJcblx0dGhpcy5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XHJcblx0dGhpcy5maXJlQnV0dG9uID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlNQQUNFQkFSKTtcclxuXHR0aGlzLnN0YXJ0R2FtZSgpO1xyXG59XHJcbiIsInZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKTtcclxuXHJcbnZhciBmaXJpbmdUaW1lciA9IDA7XHJcbnZhciBFTkVNWV9CVUxMRVRfU1BFRUQgPSAzMDBcclxuXHJcbmZ1bmN0aW9uIGVuZW15RmlyZXMoZ2FtZSkge1xyXG5cdHZhciBlbmVtaWVzID0gdGhpcy5lbmVtaWVzO1xyXG5cdHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllcjtcclxuXHR2YXIgbGl2aW5nRW5lbWllcyA9IFtdO1xyXG5cdGVuZW1pZXMuZm9yRWFjaEFsaXZlKGZ1bmN0aW9uKGVuZW15KXtcclxuXHRcdC8vIHB1dCBldmVyeSBsaXZpbmcgZW5lbXkgaW4gYW4gYXJyYXlcclxuXHRcdGxpdmluZ0VuZW1pZXMucHVzaChlbmVteSk7XHJcblx0fSk7XHJcblxyXG5cclxuXHRpZiAobGl2aW5nRW5lbWllcy5sZW5ndGggPiAwKSB7XHJcblx0XHR2YXIgcmFuZG9tPWdhbWUucm5kLmludGVnZXJJblJhbmdlKDAsbGl2aW5nRW5lbWllcy5sZW5ndGgtMSk7XHJcblxyXG5cdFx0Ly8gcmFuZG9tbHkgc2VsZWN0IG9uZSBvZiB0aGVtXHJcblx0XHR2YXIgc2hvb3Rlcj1saXZpbmdFbmVtaWVzW3JhbmRvbV07XHJcblxyXG5cclxuXHRcdC8vICBHcmFiIHRoZSBmaXJzdCBidWxsZXQgd2UgY2FuIGZyb20gdGhlIHBvb2xcclxuXHRcdHZhciBlbmVteUJ1bGxldDtcclxuXHRcdGlmIChzaG9vdGVyLm5hbWUgPT0gJ2ZlZG9yYUhpcHN0ZXInKSB7XHJcblx0XHRcdGVuZW15QnVsbGV0ID0gdGhpcy5mZWRvcmFCdWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHRcdH1cclxuXHRcdGlmIChzaG9vdGVyLm5hbWUgPT0gJ2hpcHN0ZXInKSB7XHJcblx0XHRcdGVuZW15QnVsbGV0ID0gdGhpcy5oaXBzdGVyQnVsbGV0cy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZW5lbXlCdWxsZXQpIHtcclxuXHRcdFx0cHJvamVjdGlsZXMuZW5lbXlGaXJlLmJpbmQoZW5lbXlCdWxsZXQpKGdhbWUpO1xyXG5cclxuXHRcdFx0Ly8gQW5kIGZpcmUgdGhlIGJ1bGxldCBmcm9tIHRoaXMgZW5lbXlcclxuXHRcdFx0ZW5lbXlCdWxsZXQucmVzZXQoc2hvb3Rlci5ib2R5Lngrc2hvb3Rlci5ib2R5LndpZHRoLzIsIHNob290ZXIuYm9keS55K3Nob290ZXIuYm9keS5oZWlnaHQvMik7XHJcblxyXG5cdFx0XHRnYW1lLnBoeXNpY3MuYXJjYWRlLm1vdmVUb09iamVjdChlbmVteUJ1bGxldCxwbGF5ZXIsRU5FTVlfQlVMTEVUX1NQRUVEKTtcclxuXHRcdFx0ZmlyaW5nVGltZXIgPSBnYW1lLnRpbWUubm93ICsgMjAwMDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGluaXQ6IGZ1bmN0aW9uIChnYW1lKSB7XHJcblx0XHR2YXIgZW5lbWllcyA9IHRoaXMuZW5lbWllcyA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcblx0XHRlbmVtaWVzLmVuYWJsZUJvZHkgPSB0cnVlXHJcblx0XHRlbmVtaWVzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERVxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA0MDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZW5lbXlUeXBlID0gZ2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoMCwgMik7XHJcblx0XHRcdHZhciBuYW1lID0gZW5lbXlUeXBlID09IDIgPyAnZmVkb3JhSGlwc3RlcicgOiAnaGlwc3RlcidcclxuXHRcdFx0dmFyIGVuZW15ID0gZW5lbWllcy5jcmVhdGUoMCwgMCwgbmFtZSk7XHJcblx0XHRcdGVuZW15LmtpbGwoKVxyXG5cdFx0XHRlbmVteS5uYW1lID0gbmFtZTtcclxuXHRcdFx0ZW5lbXkudHlwZSA9ICdncm91bmQnXHJcblx0XHRcdGVuZW15LmlkID0gaVxyXG5cdFx0XHRlbmVteS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xyXG5cdFx0XHRlbmVteS5hbmltYXRpb25zLmFkZCgnbW92ZScsIFsgMCwgMSBdLCA1LCB0cnVlKTtcclxuXHRcdFx0ZW5lbXkucGxheSgnbW92ZScpO1xyXG5cdFx0XHRlbmVteS5oaXRwb2ludHMgPSBlbmVteVR5cGUgPT0gMiA/IDIgOiAxXHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0dXBkYXRlOiBmdW5jdGlvbihnYW1lKSB7XHJcblx0XHRpZiAodGhpcy5wbGF5ZXIuYWxpdmUgJiYgZ2FtZS50aW1lLm5vdyA+IGZpcmluZ1RpbWVyKVxyXG5cdFx0e1xyXG5cdFx0XHRlbmVteUZpcmVzLmJpbmQodGhpcykoZ2FtZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24oZW5lbXkpIHtcclxuXHRcdFx0aWYgKGVuZW15LnR5cGUgPT0gJ2dyb3VuZCcpIHtcclxuXHRcdFx0XHRlbmVteS5ib2R5LnZlbG9jaXR5LnggPSAoZW5lbXkuZGlyZWN0aW9uID09IDAgPyAtMSA6IDEpICogMTAwXHJcblx0XHRcdFx0aWYgKChlbmVteS5ib2R5LnggPCAwICYmIGVuZW15LmRpcmVjdGlvbiA9PSAwKSB8fCAoZW5lbXkuYm9keS54ID4gZ2FtZS53b3JsZC53aWR0aCAtIGVuZW15LndpZHRoICYmIGVuZW15LmRpcmVjdGlvbiA9PSAxKSkge1xyXG5cdFx0XHRcdFx0ZW5lbXkuZGlyZWN0aW9uIF49IDFcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHR9LmJpbmQodGhpcykpO1xyXG5cdH0sXHJcblxyXG5cdHJlc2V0OiBmdW5jdGlvbihnYW1lKSB7XHJcblx0XHR0aGlzLmVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbihlbmVteSkge1xyXG5cdFx0XHRpZiAoZW5lbXkudHlwZSA9PSAnZ3JvdW5kJykge1xyXG5cdFx0XHRcdHZhciB4LCB5O1xyXG5cdFx0XHRcdHggPSBNYXRoLmZsb29yKGVuZW15LmlkIC8gNCk7XHJcblx0XHRcdFx0eSA9IGVuZW15LmlkICUgNDtcclxuXHRcdFx0XHRlbmVteS5yZXNldCh4ICogZW5lbXkud2lkdGggKyBlbmVteS53aWR0aC8yLCB5ICogZW5lbXkuaGVpZ2h0ICsgZW5lbXkuaGVpZ2h0LzIpO1xyXG5cdFx0XHRcdGVuZW15LmRpcmVjdGlvbiA9IHkgJSAyID09IDAgPyAxIDogMFxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9LFxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIGV4cGxvc2lvbnMgPSB0aGlzLmV4cGxvc2lvbnNcclxuXHRcdGV4cGxvc2lvbnMuY3JlYXRlTXVsdGlwbGUoNTAsICdrYWJvb20nKTtcclxuXHRcdGV4cGxvc2lvbnMuZm9yRWFjaChmdW5jdGlvbihleHBsb3Npb24pIHtcclxuXHRcdFx0ZXhwbG9zaW9uLmFuY2hvci54ID0gMC41O1xyXG5cdFx0XHRleHBsb3Npb24uYW5jaG9yLnkgPSAwLjU7XHJcblx0XHRcdGV4cGxvc2lvbi5hbmltYXRpb25zLmFkZCgna2Fib29tJyk7XHJcblx0XHR9LCB0aGlzKTtcclxuXHR9XHJcbn1cclxuIiwidmFyIGVuZW1pZXMgPSByZXF1aXJlKCcuL2VuZW1pZXMnKTtcclxudmFyIHBsYXllckltcG9ydCA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XHJcbnZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZ2FtZSkge1xyXG5cdHJldHVybiB7XHJcblx0XHRzdGFydEdhbWU6IGZ1bmN0aW9uIHN0YXJ0R2FtZSgpIHtcclxuXHRcdFx0dGhpcy5saXZlcyA9IDM7XHJcblx0XHRcdHRoaXMuc2NvcmUgPSAwO1xyXG5cdFx0XHRwbGF5ZXJJbXBvcnQucmVzZXQuYmluZCh0aGlzKShnYW1lKTtcclxuXHRcdFx0ZW5lbWllcy5yZXNldC5iaW5kKHRoaXMpKGdhbWUpXHJcblx0XHR9LFxyXG5cclxuXHRcdHdpbjogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRnYW1lLnN0YXRlLnN0YXJ0KCd3aW4nKVxyXG5cdFx0fSxcclxuXHJcblx0XHRsb3NlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGdhbWUuc3RhdGUuc3RhcnQoJ2xvc2UnKVxyXG5cdFx0fSxcclxuXHJcblx0XHRlbmVteUhpdDogZnVuY3Rpb24gKGJ1bGxldCwgZW5lbXkpIHtcclxuXHRcdFx0aWYgKGJ1bGxldC5wZW5ldHJhdGlvbiA8PSAwKSB7XHJcblx0XHRcdCAgXHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cdFx0XHRwcm9qZWN0aWxlcy5oaXQuYmluZChidWxsZXQpKGVuZW15LCBnYW1lKTtcclxuXHRcdFx0ZW5lbXkuaGl0cG9pbnRzIC09IGJ1bGxldC5wZW5ldHJhdGlvblxyXG5cdFx0XHRidWxsZXQucGVuZXRyYXRpb24tLTtcclxuXHRcdFx0dGhpcy5ib29tLnBsYXkoKTtcclxuXHRcdFx0XHRpZiAoYnVsbGV0LnBlbmV0cmF0aW9uIDwgMCkge1xyXG5cdFx0XHRcdGJ1bGxldC5raWxsKClcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoZW5lbXkuaGl0cG9pbnRzIDw9IDApIHtcclxuXHRcdFx0XHRlbmVteS5raWxsKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5zY29yZSsrO1xyXG5cclxuXHRcdFx0dmFyIGV4cGxvc2lvbiA9IHRoaXMuZXhwbG9zaW9ucy5nZXRGaXJzdEV4aXN0cyhmYWxzZSk7XHJcblx0XHRcdC8vIGNhbGN1bGF0ZSBleHBsb3Npb24gbG9jYXRpb25cclxuXHRcdFx0ZXhwbG9zaW9uLnJlc2V0KGVuZW15LmJvZHkueCtlbmVteS53aWR0aC8yLCBlbmVteS5ib2R5LnkrZW5lbXkuaGVpZ2h0LzIpO1xyXG5cdFx0XHRleHBsb3Npb24ucGxheSgna2Fib29tJywgMzAsIGZhbHNlLCB0cnVlKTtcclxuXHJcblx0XHR9LFxyXG5cclxuXHRcdHBsYXllckhpdDogZnVuY3Rpb24gKHBsYXllciwgYnVsbGV0KSB7XHJcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldCkocGxheWVyLCBnYW1lKTtcclxuXHRcdFx0YnVsbGV0LmtpbGwoKTtcclxuXHRcdFx0cGxheWVyLmtpbGwoKTtcclxuXHJcblx0XHRcdHZhciBleHBsb3Npb24gPSB0aGlzLmV4cGxvc2lvbnMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG5cdFx0XHQvLyBjYWxjdWxhdGUgZXhwbG9zaW9uIGxvY2F0aW9uXHJcblx0XHRcdGV4cGxvc2lvbi5yZXNldChwbGF5ZXIuYm9keS54K3BsYXllci53aWR0aC8yLCBwbGF5ZXIuYm9keS55K3BsYXllci5oZWlnaHQvMik7XHJcblx0XHRcdGV4cGxvc2lvbi5wbGF5KCdrYWJvb20nLCAzMCwgZmFsc2UsIHRydWUpO1xyXG5cdFx0XHR0aGlzLmJvb20ucGxheSgpO1xyXG5cclxuXHJcblx0XHRcdGlmICh0aGlzLmxpdmVzID4gMCkge1xyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR0aGlzLmxpdmVzLS07XHJcblx0XHRcdFx0XHRwbGF5ZXJJbXBvcnQucmVzZXQuYmluZCh0aGlzKShnYW1lKTtcclxuXHRcdFx0XHR9LmJpbmQodGhpcyksIDEwMDApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMubG9zZSgpXHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cdFx0cHJvamVjdGlsZUNvbGxpc2lvbjogZnVuY3Rpb24gKGJ1bGxldDEsIGJ1bGxldDIpIHtcclxuXHRcdFx0YnVsbGV0MS5wZW5ldHJhdGlvbi0tO1xyXG5cdFx0XHRidWxsZXQyLnBlbmV0cmF0aW9uLS07XHJcblx0XHRcdGlmIChidWxsZXQxLnBlbmV0cmF0aW9uIDw9IDApIHtcclxuXHRcdFx0XHRidWxsZXQxLmtpbGwoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoYnVsbGV0Mi5wZW5ldHJhdGlvbiA8PSAwKSB7XHJcblx0XHRcdFx0YnVsbGV0Mi5raWxsKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cHJvamVjdGlsZXMuaGl0LmJpbmQoYnVsbGV0MSkoYnVsbGV0MiwgZ2FtZSk7XHJcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldDIpKGJ1bGxldDEsIGdhbWUpO1xyXG5cdFx0XHR2YXIgZXhwbG9zaW9uID0gdGhpcy5leHBsb3Npb25zLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcclxuXHRcdFx0Ly8gY2FsY3VsYXRlIGV4cGxvc2lvbiBsb2NhdGlvblxyXG5cdFx0XHRleHBsb3Npb24ucmVzZXQoYnVsbGV0MS5ib2R5LngrYnVsbGV0MS53aWR0aC8yLCBidWxsZXQxLmJvZHkueStidWxsZXQxLmhlaWdodC8yKTtcclxuXHRcdFx0ZXhwbG9zaW9uLnBsYXkoJ2thYm9vbScsIDMwLCBmYWxzZSwgdHJ1ZSk7XHJcblx0XHRcdHRoaXMuYm9vbS5wbGF5KCk7XHJcblx0XHRcdHRoaXMuc2NvcmUrKztcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuIiwidmFyIGJ1bGxldFRpbWUgPSAwXHJcbnZhciBidWxsZXRWZWxvY2l0eSA9IDQwMFxyXG52YXIgYnVsbGV0RGVsYXkgPSA4MDBcclxuXHJcbnZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKVxyXG5cclxuZnVuY3Rpb24gZmlyZWJ1bGxldChnYW1lKSB7XHJcblx0Ly8gIFRvIGF2b2lkIHRoZW0gYmVpbmcgYWxsb3dlZCB0byBmaXJlIHRvbyBmYXN0IHdlIHNldCBhIHRpbWUgbGltaXRcclxuXHRpZiAoZ2FtZS50aW1lLm5vdyA+IGJ1bGxldFRpbWUpIHtcclxuXHRcdC8vICBHcmFiIHRoZSBmaXJzdCBidWxsZXQgd2UgY2FuIGZyb20gdGhlIHBvb2xcclxuXHRcdHZhciBidWxsZXQgPSB0aGlzLnBsYXllckJ1bGxldHMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xyXG5cdFx0cHJvamVjdGlsZXMucGxheWVyRmlyZS5iaW5kKGJ1bGxldCkoZ2FtZSk7XHJcblx0XHR2YXIgcGxheWVyID0gdGhpcy5wbGF5ZXI7XHJcblxyXG5cdFx0aWYgKGJ1bGxldCkge1xyXG5cdFx0XHQvLyAgQW5kIGZpcmUgaXRcclxuXHRcdFx0YnVsbGV0LnJlc2V0KHBsYXllci54LCBwbGF5ZXIueSArIDgpO1xyXG5cdFx0XHRidWxsZXQuYm9keS52ZWxvY2l0eS55ID0gLWJ1bGxldFZlbG9jaXR5O1xyXG5cdFx0XHRidWxsZXRUaW1lID0gZ2FtZS50aW1lLm5vdyArIGJ1bGxldERlbGF5O1xyXG5cdFx0fVxyXG5cdFx0dGhpcy50aHJvdy5wbGF5KCk7XHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Ly8gcHV0IHRoZSBwbGF5ZXIgb24gdGhlIG1hcFxyXG5cdGluaXQ6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAncGxheWVyJylcclxuXHRcdHBsYXllci5raWxsKClcclxuXHRcdHBsYXllci5hbmNob3Iuc2V0VG8oLjUsLjUpXHJcblx0XHRnYW1lLnBoeXNpY3MuZW5hYmxlKHBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxyXG5cdFx0cGxheWVyLmNoZWNrV29ybGRCb3VuZHMgPSB0cnVlXHJcblx0XHRwbGF5ZXIuYW5pbWF0aW9ucy5hZGQoJ21vdmUnLCBbIDAsIDEgXSwgNSwgdHJ1ZSk7XHJcblx0fSxcclxuXHJcblx0Ly8gdXBkYXRlIGdhbWUgbG9vcFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24oZ2FtZSkge1xyXG5cdFx0dmFyIGN1cnNvcnMgPSB0aGlzLmN1cnNvcnM7XHJcblx0XHR2YXIgZmlyZUJ1dHRvbiA9IHRoaXMuZmlyZUJ1dHRvblxyXG5cdFx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xyXG5cclxuXHRcdGlmICghcGxheWVyLmFsaXZlKSByZXR1cm47XHJcblxyXG5cdFx0cGxheWVyLmJvZHkudmVsb2NpdHkuc2V0VG8oMCwgMCk7XHJcblxyXG5cdFx0aWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcclxuXHRcdFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IC0yMDA7XHJcblx0XHRcdHBsYXllci5wbGF5KCdtb3ZlJylcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKGN1cnNvcnMucmlnaHQuaXNEb3duKSB7XHJcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAyMDA7XHJcblx0XHRcdHBsYXllci5wbGF5KCdtb3ZlJylcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgYW5pbWF0aW9uID0gcGxheWVyLmFuaW1hdGlvbnMuY3VycmVudEFuaW0uc3RvcCgpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuZmlyZUJ1dHRvbi5pc0Rvd24pIHtcclxuXHRcdFx0ZmlyZWJ1bGxldC5iaW5kKHRoaXMpKGdhbWUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKChwbGF5ZXIuYm9keS54IDw9IDAgJiYgcGxheWVyLmJvZHkudmVsb2NpdHkueCA8IDApIHx8IChwbGF5ZXIuYm9keS54ID49IGdhbWUud29ybGQud2lkdGggLSBwbGF5ZXIud2lkdGggJiYgcGxheWVyLmJvZHkudmVsb2NpdHkueCA+IDApKSB7XHJcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0cmVzZXQ6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHRoaXMucGxheWVyLnJlc2V0KGdhbWUud29ybGQud2lkdGgvMiwgZ2FtZS53b3JsZC5oZWlnaHQtdGhpcy5wbGF5ZXIuaGVpZ2h0LzIpO1xyXG5cdH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByZWxvYWQoZ2FtZSkge1xyXG5cdGdhbWUubG9hZC5hdWRpbygnYm9vbScsICcvYXNzZXRzL3Byb2R1Y3Rpb24vYm9vbS53YXYnKTtcclxuXHRnYW1lLmxvYWQuYXVkaW8oJ3Rocm93JywgJy9hc3NldHMvcHJvZHVjdGlvbi90aHJvdy5tcDMnKTtcclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ3Jhem9yJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL3Jhem9yLnBuZycpO1xyXG5cdGdhbWUubG9hZC5pbWFnZSgndmlueWwnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vdmlueWwucG5nJyk7XHJcblx0Z2FtZS5sb2FkLmltYWdlKCdmZWRvcmEnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vZmVkb3JhUHJvamVjdGlsZS5wbmcnKTtcclxuXHRnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ2hpcHN0ZXInLCAnYXNzZXRzL3Byb2R1Y3Rpb24vaGlwc3RlclNwcml0ZVNoZWV0MS5wbmcnLCA2MiwgNjMpO1xyXG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZmVkb3JhSGlwc3RlcicsICdhc3NldHMvcHJvZHVjdGlvbi9mZWRvcmFIaXBzdGVyU3ByaXRlU2hlZXQucG5nJywgNjIsIDYzKTtcclxuXHRnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ3BsYXllcicsICdhc3NldHMvcHJvZHVjdGlvbi9wbGF5ZXJDaGFyYWN0ZXJTaGVldC5wbmcnLCA2NCwgNjQpO1xyXG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgna2Fib29tJywgJ2Fzc2V0cy9nYW1lcy9pbnZhZGVycy9leHBsb2RlLnBuZycsIDEyOCwgMTI4KTtcclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vYmFja2dyb3VuZC5wbmcnKTtcclxuXHRnYW1lLmxvYWQuaW1hZ2UoJ2xpbmVzJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL2xpbmVzLnBuZycpO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGluaXQ6IGZ1bmN0aW9uKGJ1bGxldHMsIHNwcml0ZU5hbWUsIGdhbWUpIHtcclxuXHRcdGJ1bGxldHMuZW5hYmxlQm9keSA9IHRydWU7XHJcblx0XHRidWxsZXRzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERTtcclxuXHRcdGJ1bGxldHMuY3JlYXRlTXVsdGlwbGUoMzAsIHNwcml0ZU5hbWUpO1xyXG5cdFx0YnVsbGV0cy5zZXRBbGwoJ2FuY2hvci54JywgMC41KTtcclxuXHRcdGJ1bGxldHMuc2V0QWxsKCdhbmNob3IueScsIDEpO1xyXG5cdFx0YnVsbGV0cy5zZXRBbGwoJ291dE9mQm91bmRzS2lsbCcsIHRydWUpO1xyXG5cdFx0YnVsbGV0cy5zZXRBbGwoJ2NoZWNrV29ybGRCb3VuZHMnLCB0cnVlKTtcclxuXHR9LFxyXG5cclxuXHRwbGF5ZXJGaXJlOiBmdW5jdGlvbihnYW1lKSB7XHJcblx0XHR0aGlzLnBlbmV0cmF0aW9uID0gMjtcclxuXHR9LFxyXG5cclxuXHRlbmVteUZpcmU6IGZ1bmN0aW9uKGdhbWUpIHtcclxuXHRcdHRoaXMucGVuZXRyYXRpb24gPSAxO1xyXG5cdH0sXHJcblxyXG5cdGhpdDogZnVuY3Rpb24odGFyZ2V0LCBnYW1lKSB7XHJcblx0fVxyXG59XHJcbiIsInZhciBlbmVtaWVzID0gcmVxdWlyZSgnLi9lbmVtaWVzJyk7XHJcbnZhciBwbGF5ZXJJbXBvcnQgPSByZXF1aXJlKCcuL3BsYXllcicpO1xyXG52YXIgcHJvamVjdGlsZXMgPSByZXF1aXJlKCcuL3Byb2plY3RpbGVzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHVwZGF0ZShnYW1lKSB7XHJcblx0Ly92YXIgZG9tU2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKVxyXG5cdC8vdmFyIGRvbUxpdmVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpdmVzJylcclxuXHJcblx0Ly9pZiAoZG9tU2NvcmUuaW5uZXJUZXh0ICE9IHRoaXMuc2NvcmUpIHtcclxuXHQvL2RvbVNjb3JlLmlubmVyVGV4dCA9IHRoaXMuc2NvcmU7XHJcblx0Ly99XHJcblx0Ly9pZiAoZG9tTGl2ZXMuaW5uZXJUZXh0ICE9IHRoaXMubGl2ZXMpIHtcclxuXHQvL2RvbUxpdmVzLmlubmVyVGV4dCA9IHRoaXMubGl2ZXM7XHJcblx0Ly99XHJcblxyXG5cdHRoaXMuYmFja2dyb3VuZC50aWxlUG9zaXRpb24ueSArPSAyO1xyXG5cdHRoaXMubGluZXMudGlsZVBvc2l0aW9uLnkgKz0gMjtcclxuXHRwbGF5ZXJJbXBvcnQudXBkYXRlLmJpbmQodGhpcykoZ2FtZSk7XHJcblx0ZW5lbWllcy51cGRhdGUuYmluZCh0aGlzKShnYW1lKTtcclxuXHJcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMucGxheWVyQnVsbGV0cywgdGhpcy5lbmVtaWVzLCB0aGlzLmVuZW15SGl0LmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xyXG5cclxuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oaXBzdGVyQnVsbGV0cywgdGhpcy5wbGF5ZXIsIHRoaXMucGxheWVySGl0LmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xyXG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmZlZG9yYUJ1bGxldHMsIHRoaXMucGxheWVyLCB0aGlzLnBsYXllckhpdC5iaW5kKHRoaXMpLCBudWxsLCBnYW1lKTtcclxuXHJcblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMuaGlwc3RlckJ1bGxldHMsIHRoaXMucGxheWVyQnVsbGV0cywgdGhpcy5wcm9qZWN0aWxlQ29sbGlzaW9uLmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xyXG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmZlZG9yYUJ1bGxldHMsIHRoaXMucGxheWVyQnVsbGV0cywgdGhpcy5wcm9qZWN0aWxlQ29sbGlzaW9uLmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xyXG5cclxuXHRpZiAodGhpcy5lbmVtaWVzLmNvdW50TGl2aW5nKCkgPT0gMCkge1xyXG5cdFx0dGhpcy53aW4oKTtcclxuXHR9XHJcbn1cclxuXHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdpbnRybycsICdhc3NldHMvcHJvZHVjdGlvbi9WRFNfbWFpblNjcmVlbi5wbmcnKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygnYmdtJywgJy9hc3NldHMvcHJvZHVjdGlvbi9Ob2N0dXJuZW9mSGlwc3Rlci5tcDMnKTtcclxuXHRcdHRoaXMuc2NhbGUuc2NhbGVNb2RlID0gUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTFxyXG5cdFx0dGhpcy5zY2FsZS5yZWZyZXNoKClcclxuXHR9LFxyXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmFkZC5zcHJpdGUoMCwgMCwgJ2ludHJvJyk7XHJcblx0XHR2YXIgc3RhdGVUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLndvcmxkLmNlbnRlclgsdGhpcy53b3JsZC5jZW50ZXJZLCcgJywgeyBmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmJyB9KTtcclxuXHRcdHN0YXRlVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xyXG5cdFx0c3RhdGVUZXh0LnZpc2libGUgPSB0cnVlO1xyXG5cdFx0c3RhdGVUZXh0LnRleHQgPSBcIlNwYWNlIHRvIHN0YXJ0XCI7XHJcblx0XHRzdGF0ZVRleHQuYWxpZ24gPSAnY2VudGVyJ1xyXG5cdFx0dmFyIG11c2ljID0gdGhpcy5hZGQuYXVkaW8oJ2JnbScsIDEsIHRydWUpO1xyXG5cdFx0bXVzaWMucGxheSgpO1xyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuZ2FtZS5zdGF0ZS5nZXRDdXJyZW50U3RhdGUoKS5rZXkgPT0gJ2ludHJvJyAmJiBldmVudC5rZXlDb2RlID09IDMyICYmIGV2ZW50LnJlcGVhdCA9PSBmYWxzZSkge1xyXG5cdFx0XHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncGxheScpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHN0YXRlVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy53b3JsZC5jZW50ZXJYLHRoaXMud29ybGQuY2VudGVyWSwnICcsIHsgZm9udDogJzI0cHggQXJpYWwnLCBmaWxsOiAnI2ZmZicgfSk7XHJcblx0XHRzdGF0ZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuXHRcdHN0YXRlVGV4dC52aXNpYmxlID0gdHJ1ZTtcclxuXHRcdHN0YXRlVGV4dC50ZXh0ID0gXCJZb3UgbG9zdC5cXG5QcmVzcyBzcGFjZSB0byB0cnkgYWdhaW5cIjtcclxuXHRcdHN0YXRlVGV4dC5hbGlnbiA9ICdjZW50ZXInXHJcblx0fSxcclxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xyXG5cdH0sXHJcblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRpZiAodGhpcy5nYW1lLnN0YXRlLmdldEN1cnJlbnRTdGF0ZSgpLmtleSA9PSAnbG9zZScgJiYgZXZlbnQua2V5Q29kZSA9PSAzMiAmJiBldmVudC5yZXBlYXQgPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3BsYXknKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRwcmVsb2FkOiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzdGF0ZVRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCx0aGlzLndvcmxkLmNlbnRlclksJyAnLCB7IGZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmYnIH0pO1xyXG5cdFx0c3RhdGVUZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcblx0XHRzdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XHJcblx0XHRzdGF0ZVRleHQudGV4dCA9IFwiWW91IFdpbi5cXG5QcmVzcyBzcGFjZSB0byBwbGF5IGFnYWluXCI7XHJcblx0XHRzdGF0ZVRleHQuYWxpZ24gPSAnY2VudGVyJ1xyXG5cdH0sXHJcblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcclxuXHR9LFxyXG5cdHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLmlucHV0LmtleWJvYXJkLm9uRG93bkNhbGxiYWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0aWYgKHRoaXMuZ2FtZS5zdGF0ZS5nZXRDdXJyZW50U3RhdGUoKS5rZXkgPT0gJ3dpbicgJiYgZXZlbnQua2V5Q29kZSA9PSAzMiAmJiBldmVudC5yZXBlYXQgPT0gZmFsc2UpIHtcclxuXHRcdFx0XHR0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3BsYXknKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJ2YXIgZ2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpO1xyXG4iXX0=
