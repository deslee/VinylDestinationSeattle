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

	this.scoreText = game.add.text(0, 0, ' ', {font: '12px Arial', fill: '#fff'});
	this.scoreText.visible = true;
	this.livesText = game.add.text(0, 12, ' ', {font: '12px Arial', fill: '#fff'});
	this.livesText.visible = true;


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

var scoreText, livesText;

module.exports = function(game) {
	return {
		startGame: function startGame() {
			this.updateScore(0);
			this.updateLives(3);
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
			this.updateScore(this.score + 1)

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
					this.updateLives(this.lives - 1);
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
			this.updateScore(this.score + 1)
		},

		updateScore: function(score) {
			this.scoreText.text = "Score: " + score;
			this.score = score;
		},
		updateLives: function(lives) {
			this.livesText.text = "Lives: " + lives;
			this.lives = lives;
		},
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
	game.load.audio('boom', 'assets/production/boom.wav');
	game.load.audio('throw', 'assets/production/throw.mp3');
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
		this.load.audio('bgm', 'assets/production/NocturneofHipster.mp3');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9pbmRleC5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL2dhbWUvcGxheS9jcmVhdGUuanMiLCIvaG9tZS9kZXNtb25kL1Byb2plY3RzL1ZpbnlsRGVzdGluYXRpb25TZWF0dGxlL2FwcC9nYW1lL3BsYXkvZW5lbWllcy5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL2dhbWUvcGxheS9leHBsb3Npb25zLmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9wbGF5L2dhbWVDb250ZXh0LmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9wbGF5L3BsYXllci5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL2dhbWUvcGxheS9wcmVsb2FkLmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9wbGF5L3Byb2plY3RpbGVzLmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9wbGF5L3VwZGF0ZS5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL2dhbWUvc2NyZWVucy9pbnRyby5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL2dhbWUvc2NyZWVucy9sb3NlLmpzIiwiL2hvbWUvZGVzbW9uZC9Qcm9qZWN0cy9WaW55bERlc3RpbmF0aW9uU2VhdHRsZS9hcHAvZ2FtZS9zY3JlZW5zL3dpbi5qcyIsIi9ob21lL2Rlc21vbmQvUHJvamVjdHMvVmlueWxEZXN0aW5hdGlvblNlYXR0bGUvYXBwL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDQwMCwgNjAwLCBQaGFzZXIuQVVUTylcbnZhciBjdHggPSByZXF1aXJlKCcuL3BsYXkvZ2FtZUNvbnRleHQnKShnYW1lKTtcblxudmFyIHBsYXkgPSBmdW5jdGlvbihnYW1lKXt9IFxucGxheS5wcm90b3R5cGUgPSB7XG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJlcXVpcmUoJy4vcGxheS9wcmVsb2FkJykuYmluZChjdHgpKHRoaXMpO1xuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJlcXVpcmUoJy4vcGxheS9jcmVhdGUnKS5iaW5kKGN0eCkodGhpcyk7XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmVxdWlyZSgnLi9wbGF5L3VwZGF0ZScpLmJpbmQoY3R4KSh0aGlzKTtcblx0fVxufTtcblxudmFyIGludHJvID0gZnVuY3Rpb24oZ2FtZSl7fVxudmFyIGxvc2UgPSBmdW5jdGlvbihnYW1lKXt9XG52YXIgd2luID0gZnVuY3Rpb24oZ2FtZSl7fVxuaW50cm8ucHJvdG90eXBlID0gcmVxdWlyZSgnLi9zY3JlZW5zL2ludHJvJyk7XG5sb3NlLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vc2NyZWVucy9sb3NlJyk7XG53aW4ucHJvdG90eXBlID0gcmVxdWlyZSgnLi9zY3JlZW5zL3dpbicpO1xuZ2FtZS5zdGF0ZS5hZGQoXCJpbnRyb1wiLCBpbnRybyk7XG5nYW1lLnN0YXRlLmFkZChcImxvc2VcIiwgbG9zZSk7XG5nYW1lLnN0YXRlLmFkZChcIndpblwiLCB3aW4pO1xuZ2FtZS5zdGF0ZS5hZGQoXCJwbGF5XCIsIHBsYXkpO1xuZ2FtZS5zdGF0ZS5zdGFydChcImludHJvXCIpO1xuIiwidmFyIHByb2plY3RpbGVzID0gcmVxdWlyZSgnLi9wcm9qZWN0aWxlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZShnYW1lKSB7XG5cdC8vIHNldCBwaHlzaWNzIGVuZ2luZSB0byBhcmNhZGVcblx0Z2FtZS5waHlzaWNzLnN0YXJ0U3lzdGVtKFBoYXNlci5QaHlzaWNzLkFSQ0FERSk7XG5cblx0dGhpcy50aHJvdyA9IGdhbWUuYWRkLmF1ZGlvKCd0aHJvdycsIDEpO1xuXHR0aGlzLmJvb20gPSBnYW1lLmFkZC5hdWRpbygnYm9vbScsIDEpO1xuXG5cdHRoaXMuYmFja2dyb3VuZCA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgZ2FtZS53b3JsZC53aWR0aCwgZ2FtZS53b3JsZC5oZWlnaHQsICdiYWNrZ3JvdW5kJyk7XG5cdHRoaXMubGluZXMgPSBnYW1lLmFkZC50aWxlU3ByaXRlKGdhbWUud29ybGQud2lkdGgvMiAtIDUwLzIsIDAsIDUwLCBnYW1lLndvcmxkLmhlaWdodCwgJ2xpbmVzJyk7XG5cblx0dGhpcy5wbGF5ZXJCdWxsZXRzID0gZ2FtZS5hZGQuZ3JvdXAoKTtcblx0cHJvamVjdGlsZXMuaW5pdC5iaW5kKHRoaXMpKHRoaXMucGxheWVyQnVsbGV0cywgJ3Jhem9yJywgZ2FtZSk7XG5cblx0dGhpcy5oaXBzdGVyQnVsbGV0cyA9IGdhbWUuYWRkLmdyb3VwKCk7XG5cdHByb2plY3RpbGVzLmluaXQuYmluZCh0aGlzKSh0aGlzLmhpcHN0ZXJCdWxsZXRzLCAndmlueWwnLCBnYW1lKTtcblxuXHR0aGlzLmZlZG9yYUJ1bGxldHMgPSBnYW1lLmFkZC5ncm91cCgpO1xuXHRwcm9qZWN0aWxlcy5pbml0LmJpbmQodGhpcykodGhpcy5mZWRvcmFCdWxsZXRzLCAnZmVkb3JhJywgZ2FtZSk7XG5cblx0Ly8gY3JlYXRlIHBsYXllciBzcHJpdGVcblx0cmVxdWlyZSgnLi9wbGF5ZXInKS5pbml0LmJpbmQodGhpcykoZ2FtZSk7XG5cblx0Ly8gY3JlYXRlIGVuZW1pZXMgZ3JvdXBcblx0cmVxdWlyZSgnLi9lbmVtaWVzJykuaW5pdC5iaW5kKHRoaXMpKGdhbWUpO1xuXG5cdC8vICBBbiBleHBsb3Npb24gcG9vbFxuXHR0aGlzLmV4cGxvc2lvbnMgPSBnYW1lLmFkZC5ncm91cCgpO1xuXHRyZXF1aXJlKCcuL2V4cGxvc2lvbnMnKS5pbml0LmJpbmQodGhpcykoKTtcblxuXHQvLyAgQW5kIHNvbWUgY29udHJvbHMgdG8gcGxheSB0aGUgZ2FtZSB3aXRoXG5cdHRoaXMuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuXHR0aGlzLmZpcmVCdXR0b24gPSBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuU1BBQ0VCQVIpO1xuXG5cdHRoaXMuc2NvcmVUZXh0ID0gZ2FtZS5hZGQudGV4dCgwLCAwLCAnICcsIHtmb250OiAnMTJweCBBcmlhbCcsIGZpbGw6ICcjZmZmJ30pO1xuXHR0aGlzLnNjb3JlVGV4dC52aXNpYmxlID0gdHJ1ZTtcblx0dGhpcy5saXZlc1RleHQgPSBnYW1lLmFkZC50ZXh0KDAsIDEyLCAnICcsIHtmb250OiAnMTJweCBBcmlhbCcsIGZpbGw6ICcjZmZmJ30pO1xuXHR0aGlzLmxpdmVzVGV4dC52aXNpYmxlID0gdHJ1ZTtcblxuXG5cdHRoaXMuc3RhcnRHYW1lKCk7XG59XG4iLCJ2YXIgcHJvamVjdGlsZXMgPSByZXF1aXJlKCcuL3Byb2plY3RpbGVzJyk7XG5cbnZhciBmaXJpbmdUaW1lciA9IDA7XG52YXIgRU5FTVlfQlVMTEVUX1NQRUVEID0gMzAwXG5cbmZ1bmN0aW9uIGVuZW15RmlyZXMoZ2FtZSkge1xuXHR2YXIgZW5lbWllcyA9IHRoaXMuZW5lbWllcztcblx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xuXHR2YXIgbGl2aW5nRW5lbWllcyA9IFtdO1xuXHRlbmVtaWVzLmZvckVhY2hBbGl2ZShmdW5jdGlvbihlbmVteSl7XG5cdFx0Ly8gcHV0IGV2ZXJ5IGxpdmluZyBlbmVteSBpbiBhbiBhcnJheVxuXHRcdGxpdmluZ0VuZW1pZXMucHVzaChlbmVteSk7XG5cdH0pO1xuXG5cblx0aWYgKGxpdmluZ0VuZW1pZXMubGVuZ3RoID4gMCkge1xuXHRcdHZhciByYW5kb209Z2FtZS5ybmQuaW50ZWdlckluUmFuZ2UoMCxsaXZpbmdFbmVtaWVzLmxlbmd0aC0xKTtcblxuXHRcdC8vIHJhbmRvbWx5IHNlbGVjdCBvbmUgb2YgdGhlbVxuXHRcdHZhciBzaG9vdGVyPWxpdmluZ0VuZW1pZXNbcmFuZG9tXTtcblxuXG5cdFx0Ly8gIEdyYWIgdGhlIGZpcnN0IGJ1bGxldCB3ZSBjYW4gZnJvbSB0aGUgcG9vbFxuXHRcdHZhciBlbmVteUJ1bGxldDtcblx0XHRpZiAoc2hvb3Rlci5uYW1lID09ICdmZWRvcmFIaXBzdGVyJykge1xuXHRcdFx0ZW5lbXlCdWxsZXQgPSB0aGlzLmZlZG9yYUJ1bGxldHMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xuXHRcdH1cblx0XHRpZiAoc2hvb3Rlci5uYW1lID09ICdoaXBzdGVyJykge1xuXHRcdFx0ZW5lbXlCdWxsZXQgPSB0aGlzLmhpcHN0ZXJCdWxsZXRzLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcblx0XHR9XG5cdFx0aWYgKGVuZW15QnVsbGV0KSB7XG5cdFx0XHRwcm9qZWN0aWxlcy5lbmVteUZpcmUuYmluZChlbmVteUJ1bGxldCkoZ2FtZSk7XG5cblx0XHRcdC8vIEFuZCBmaXJlIHRoZSBidWxsZXQgZnJvbSB0aGlzIGVuZW15XG5cdFx0XHRlbmVteUJ1bGxldC5yZXNldChzaG9vdGVyLmJvZHkueCtzaG9vdGVyLmJvZHkud2lkdGgvMiwgc2hvb3Rlci5ib2R5Lnkrc2hvb3Rlci5ib2R5LmhlaWdodC8yKTtcblxuXHRcdFx0Z2FtZS5waHlzaWNzLmFyY2FkZS5tb3ZlVG9PYmplY3QoZW5lbXlCdWxsZXQscGxheWVyLEVORU1ZX0JVTExFVF9TUEVFRCk7XG5cdFx0XHRmaXJpbmdUaW1lciA9IGdhbWUudGltZS5ub3cgKyAyMDAwO1xuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aW5pdDogZnVuY3Rpb24gKGdhbWUpIHtcblx0XHR2YXIgZW5lbWllcyA9IHRoaXMuZW5lbWllcyA9IGdhbWUuYWRkLmdyb3VwKCk7XG5cdFx0ZW5lbWllcy5lbmFibGVCb2R5ID0gdHJ1ZVxuXHRcdGVuZW1pZXMucGh5c2ljc0JvZHlUeXBlID0gUGhhc2VyLlBoeXNpY3MuQVJDQURFXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA0MDsgaSsrKVxuXHRcdHtcblx0XHRcdHZhciBlbmVteVR5cGUgPSBnYW1lLnJuZC5pbnRlZ2VySW5SYW5nZSgwLCAyKTtcblx0XHRcdHZhciBuYW1lID0gZW5lbXlUeXBlID09IDIgPyAnZmVkb3JhSGlwc3RlcicgOiAnaGlwc3Rlcidcblx0XHRcdHZhciBlbmVteSA9IGVuZW1pZXMuY3JlYXRlKDAsIDAsIG5hbWUpO1xuXHRcdFx0ZW5lbXkua2lsbCgpXG5cdFx0XHRlbmVteS5uYW1lID0gbmFtZTtcblx0XHRcdGVuZW15LnR5cGUgPSAnZ3JvdW5kJ1xuXHRcdFx0ZW5lbXkuaWQgPSBpXG5cdFx0XHRlbmVteS5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuXHRcdFx0ZW5lbXkuYW5pbWF0aW9ucy5hZGQoJ21vdmUnLCBbIDAsIDEgXSwgNSwgdHJ1ZSk7XG5cdFx0XHRlbmVteS5wbGF5KCdtb3ZlJyk7XG5cdFx0XHRlbmVteS5oaXRwb2ludHMgPSBlbmVteVR5cGUgPT0gMiA/IDIgOiAxXG5cdFx0fVxuXHR9LFxuXG5cdHVwZGF0ZTogZnVuY3Rpb24oZ2FtZSkge1xuXHRcdGlmICh0aGlzLnBsYXllci5hbGl2ZSAmJiBnYW1lLnRpbWUubm93ID4gZmlyaW5nVGltZXIpXG5cdFx0e1xuXHRcdFx0ZW5lbXlGaXJlcy5iaW5kKHRoaXMpKGdhbWUpO1xuXHRcdH1cblxuXHRcdHRoaXMuZW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uKGVuZW15KSB7XG5cdFx0XHRpZiAoZW5lbXkudHlwZSA9PSAnZ3JvdW5kJykge1xuXHRcdFx0XHRlbmVteS5ib2R5LnZlbG9jaXR5LnggPSAoZW5lbXkuZGlyZWN0aW9uID09IDAgPyAtMSA6IDEpICogMTAwXG5cdFx0XHRcdGlmICgoZW5lbXkuYm9keS54IDwgMCAmJiBlbmVteS5kaXJlY3Rpb24gPT0gMCkgfHwgKGVuZW15LmJvZHkueCA+IGdhbWUud29ybGQud2lkdGggLSBlbmVteS53aWR0aCAmJiBlbmVteS5kaXJlY3Rpb24gPT0gMSkpIHtcblx0XHRcdFx0XHRlbmVteS5kaXJlY3Rpb24gXj0gMVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9LmJpbmQodGhpcykpO1xuXHR9LFxuXG5cdHJlc2V0OiBmdW5jdGlvbihnYW1lKSB7XG5cdFx0dGhpcy5lbmVtaWVzLmZvckVhY2goZnVuY3Rpb24oZW5lbXkpIHtcblx0XHRcdGlmIChlbmVteS50eXBlID09ICdncm91bmQnKSB7XG5cdFx0XHRcdHZhciB4LCB5O1xuXHRcdFx0XHR4ID0gTWF0aC5mbG9vcihlbmVteS5pZCAvIDQpO1xuXHRcdFx0XHR5ID0gZW5lbXkuaWQgJSA0O1xuXHRcdFx0XHRlbmVteS5yZXNldCh4ICogZW5lbXkud2lkdGggKyBlbmVteS53aWR0aC8yLCB5ICogZW5lbXkuaGVpZ2h0ICsgZW5lbXkuaGVpZ2h0LzIpO1xuXHRcdFx0XHRlbmVteS5kaXJlY3Rpb24gPSB5ICUgMiA9PSAwID8gMSA6IDBcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZXhwbG9zaW9ucyA9IHRoaXMuZXhwbG9zaW9uc1xuXHRcdGV4cGxvc2lvbnMuY3JlYXRlTXVsdGlwbGUoNTAsICdrYWJvb20nKTtcblx0XHRleHBsb3Npb25zLmZvckVhY2goZnVuY3Rpb24oZXhwbG9zaW9uKSB7XG5cdFx0XHRleHBsb3Npb24uYW5jaG9yLnggPSAwLjU7XG5cdFx0XHRleHBsb3Npb24uYW5jaG9yLnkgPSAwLjU7XG5cdFx0XHRleHBsb3Npb24uYW5pbWF0aW9ucy5hZGQoJ2thYm9vbScpO1xuXHRcdH0sIHRoaXMpO1xuXHR9XG59XG4iLCJ2YXIgZW5lbWllcyA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xudmFyIHBsYXllckltcG9ydCA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XG52YXIgcHJvamVjdGlsZXMgPSByZXF1aXJlKCcuL3Byb2plY3RpbGVzJyk7XG5cbnZhciBzY29yZVRleHQsIGxpdmVzVGV4dDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihnYW1lKSB7XG5cdHJldHVybiB7XG5cdFx0c3RhcnRHYW1lOiBmdW5jdGlvbiBzdGFydEdhbWUoKSB7XG5cdFx0XHR0aGlzLnVwZGF0ZVNjb3JlKDApO1xuXHRcdFx0dGhpcy51cGRhdGVMaXZlcygzKTtcblx0XHRcdHBsYXllckltcG9ydC5yZXNldC5iaW5kKHRoaXMpKGdhbWUpO1xuXHRcdFx0ZW5lbWllcy5yZXNldC5iaW5kKHRoaXMpKGdhbWUpXG5cdFx0fSxcblxuXHRcdHdpbjogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2FtZS5zdGF0ZS5zdGFydCgnd2luJylcblx0XHR9LFxuXG5cdFx0bG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0Z2FtZS5zdGF0ZS5zdGFydCgnbG9zZScpXG5cdFx0fSxcblxuXHRcdGVuZW15SGl0OiBmdW5jdGlvbiAoYnVsbGV0LCBlbmVteSkge1xuXHRcdFx0aWYgKGJ1bGxldC5wZW5ldHJhdGlvbiA8PSAwKSB7XG5cdFx0XHQgIFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRwcm9qZWN0aWxlcy5oaXQuYmluZChidWxsZXQpKGVuZW15LCBnYW1lKTtcblx0XHRcdGVuZW15LmhpdHBvaW50cyAtPSBidWxsZXQucGVuZXRyYXRpb25cblx0XHRcdGJ1bGxldC5wZW5ldHJhdGlvbi0tO1xuXHRcdFx0dGhpcy5ib29tLnBsYXkoKTtcblx0XHRcdFx0aWYgKGJ1bGxldC5wZW5ldHJhdGlvbiA8IDApIHtcblx0XHRcdFx0YnVsbGV0LmtpbGwoKVxuXHRcdFx0fVxuXHRcdFx0aWYgKGVuZW15LmhpdHBvaW50cyA8PSAwKSB7XG5cdFx0XHRcdGVuZW15LmtpbGwoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMudXBkYXRlU2NvcmUodGhpcy5zY29yZSArIDEpXG5cblx0XHRcdHZhciBleHBsb3Npb24gPSB0aGlzLmV4cGxvc2lvbnMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xuXHRcdFx0Ly8gY2FsY3VsYXRlIGV4cGxvc2lvbiBsb2NhdGlvblxuXHRcdFx0ZXhwbG9zaW9uLnJlc2V0KGVuZW15LmJvZHkueCtlbmVteS53aWR0aC8yLCBlbmVteS5ib2R5LnkrZW5lbXkuaGVpZ2h0LzIpO1xuXHRcdFx0ZXhwbG9zaW9uLnBsYXkoJ2thYm9vbScsIDMwLCBmYWxzZSwgdHJ1ZSk7XG5cblx0XHR9LFxuXG5cdFx0cGxheWVySGl0OiBmdW5jdGlvbiAocGxheWVyLCBidWxsZXQpIHtcblx0XHRcdHByb2plY3RpbGVzLmhpdC5iaW5kKGJ1bGxldCkocGxheWVyLCBnYW1lKTtcblx0XHRcdGJ1bGxldC5raWxsKCk7XG5cdFx0XHRwbGF5ZXIua2lsbCgpO1xuXG5cdFx0XHR2YXIgZXhwbG9zaW9uID0gdGhpcy5leHBsb3Npb25zLmdldEZpcnN0RXhpc3RzKGZhbHNlKTtcblx0XHRcdC8vIGNhbGN1bGF0ZSBleHBsb3Npb24gbG9jYXRpb25cblx0XHRcdGV4cGxvc2lvbi5yZXNldChwbGF5ZXIuYm9keS54K3BsYXllci53aWR0aC8yLCBwbGF5ZXIuYm9keS55K3BsYXllci5oZWlnaHQvMik7XG5cdFx0XHRleHBsb3Npb24ucGxheSgna2Fib29tJywgMzAsIGZhbHNlLCB0cnVlKTtcblx0XHRcdHRoaXMuYm9vbS5wbGF5KCk7XG5cblxuXHRcdFx0aWYgKHRoaXMubGl2ZXMgPiAwKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVMaXZlcyh0aGlzLmxpdmVzIC0gMSk7XG5cdFx0XHRcdFx0cGxheWVySW1wb3J0LnJlc2V0LmJpbmQodGhpcykoZ2FtZSk7XG5cdFx0XHRcdH0uYmluZCh0aGlzKSwgMTAwMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dGhpcy5sb3NlKClcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cHJvamVjdGlsZUNvbGxpc2lvbjogZnVuY3Rpb24gKGJ1bGxldDEsIGJ1bGxldDIpIHtcblx0XHRcdGJ1bGxldDEucGVuZXRyYXRpb24tLTtcblx0XHRcdGJ1bGxldDIucGVuZXRyYXRpb24tLTtcblx0XHRcdGlmIChidWxsZXQxLnBlbmV0cmF0aW9uIDw9IDApIHtcblx0XHRcdFx0YnVsbGV0MS5raWxsKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYnVsbGV0Mi5wZW5ldHJhdGlvbiA8PSAwKSB7XG5cdFx0XHRcdGJ1bGxldDIua2lsbCgpO1xuXHRcdFx0fVxuXHRcdFx0cHJvamVjdGlsZXMuaGl0LmJpbmQoYnVsbGV0MSkoYnVsbGV0MiwgZ2FtZSk7XG5cdFx0XHRwcm9qZWN0aWxlcy5oaXQuYmluZChidWxsZXQyKShidWxsZXQxLCBnYW1lKTtcblx0XHRcdHZhciBleHBsb3Npb24gPSB0aGlzLmV4cGxvc2lvbnMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xuXHRcdFx0Ly8gY2FsY3VsYXRlIGV4cGxvc2lvbiBsb2NhdGlvblxuXHRcdFx0ZXhwbG9zaW9uLnJlc2V0KGJ1bGxldDEuYm9keS54K2J1bGxldDEud2lkdGgvMiwgYnVsbGV0MS5ib2R5LnkrYnVsbGV0MS5oZWlnaHQvMik7XG5cdFx0XHRleHBsb3Npb24ucGxheSgna2Fib29tJywgMzAsIGZhbHNlLCB0cnVlKTtcblx0XHRcdHRoaXMuYm9vbS5wbGF5KCk7XG5cdFx0XHR0aGlzLnVwZGF0ZVNjb3JlKHRoaXMuc2NvcmUgKyAxKVxuXHRcdH0sXG5cblx0XHR1cGRhdGVTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcblx0XHRcdHRoaXMuc2NvcmVUZXh0LnRleHQgPSBcIlNjb3JlOiBcIiArIHNjb3JlO1xuXHRcdFx0dGhpcy5zY29yZSA9IHNjb3JlO1xuXHRcdH0sXG5cdFx0dXBkYXRlTGl2ZXM6IGZ1bmN0aW9uKGxpdmVzKSB7XG5cdFx0XHR0aGlzLmxpdmVzVGV4dC50ZXh0ID0gXCJMaXZlczogXCIgKyBsaXZlcztcblx0XHRcdHRoaXMubGl2ZXMgPSBsaXZlcztcblx0XHR9LFxuXHR9XG59XG4iLCJ2YXIgYnVsbGV0VGltZSA9IDBcbnZhciBidWxsZXRWZWxvY2l0eSA9IDQwMFxudmFyIGJ1bGxldERlbGF5ID0gODAwXG5cbnZhciBwcm9qZWN0aWxlcyA9IHJlcXVpcmUoJy4vcHJvamVjdGlsZXMnKVxuXG5mdW5jdGlvbiBmaXJlYnVsbGV0KGdhbWUpIHtcblx0Ly8gIFRvIGF2b2lkIHRoZW0gYmVpbmcgYWxsb3dlZCB0byBmaXJlIHRvbyBmYXN0IHdlIHNldCBhIHRpbWUgbGltaXRcblx0aWYgKGdhbWUudGltZS5ub3cgPiBidWxsZXRUaW1lKSB7XG5cdFx0Ly8gIEdyYWIgdGhlIGZpcnN0IGJ1bGxldCB3ZSBjYW4gZnJvbSB0aGUgcG9vbFxuXHRcdHZhciBidWxsZXQgPSB0aGlzLnBsYXllckJ1bGxldHMuZ2V0Rmlyc3RFeGlzdHMoZmFsc2UpO1xuXHRcdHByb2plY3RpbGVzLnBsYXllckZpcmUuYmluZChidWxsZXQpKGdhbWUpO1xuXHRcdHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllcjtcblxuXHRcdGlmIChidWxsZXQpIHtcblx0XHRcdC8vICBBbmQgZmlyZSBpdFxuXHRcdFx0YnVsbGV0LnJlc2V0KHBsYXllci54LCBwbGF5ZXIueSArIDgpO1xuXHRcdFx0YnVsbGV0LmJvZHkudmVsb2NpdHkueSA9IC1idWxsZXRWZWxvY2l0eTtcblx0XHRcdGJ1bGxldFRpbWUgPSBnYW1lLnRpbWUubm93ICsgYnVsbGV0RGVsYXk7XG5cdFx0fVxuXHRcdHRoaXMudGhyb3cucGxheSgpO1xuXHR9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdC8vIHB1dCB0aGUgcGxheWVyIG9uIHRoZSBtYXBcblx0aW5pdDogZnVuY3Rpb24oZ2FtZSkge1xuXHRcdHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllciA9IGdhbWUuYWRkLnNwcml0ZSgwLCAwLCAncGxheWVyJylcblx0XHRwbGF5ZXIua2lsbCgpXG5cdFx0cGxheWVyLmFuY2hvci5zZXRUbyguNSwuNSlcblx0XHRnYW1lLnBoeXNpY3MuZW5hYmxlKHBsYXllciwgUGhhc2VyLlBoeXNpY3MuQVJDQURFKVxuXHRcdHBsYXllci5jaGVja1dvcmxkQm91bmRzID0gdHJ1ZVxuXHRcdHBsYXllci5hbmltYXRpb25zLmFkZCgnbW92ZScsIFsgMCwgMSBdLCA1LCB0cnVlKTtcblx0fSxcblxuXHQvLyB1cGRhdGUgZ2FtZSBsb29wXG5cdHVwZGF0ZTogZnVuY3Rpb24oZ2FtZSkge1xuXHRcdHZhciBjdXJzb3JzID0gdGhpcy5jdXJzb3JzO1xuXHRcdHZhciBmaXJlQnV0dG9uID0gdGhpcy5maXJlQnV0dG9uXG5cdFx0dmFyIHBsYXllciA9IHRoaXMucGxheWVyO1xuXG5cdFx0aWYgKCFwbGF5ZXIuYWxpdmUpIHJldHVybjtcblxuXHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnNldFRvKDAsIDApO1xuXG5cdFx0aWYgKGN1cnNvcnMubGVmdC5pc0Rvd24pIHtcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAtMjAwO1xuXHRcdFx0cGxheWVyLnBsYXkoJ21vdmUnKVxuXHRcdH1cblx0XHRlbHNlIGlmIChjdXJzb3JzLnJpZ2h0LmlzRG93bikge1xuXHRcdFx0cGxheWVyLmJvZHkudmVsb2NpdHkueCA9IDIwMDtcblx0XHRcdHBsYXllci5wbGF5KCdtb3ZlJylcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR2YXIgYW5pbWF0aW9uID0gcGxheWVyLmFuaW1hdGlvbnMuY3VycmVudEFuaW0uc3RvcCgpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5maXJlQnV0dG9uLmlzRG93bikge1xuXHRcdFx0ZmlyZWJ1bGxldC5iaW5kKHRoaXMpKGdhbWUpO1xuXHRcdH1cblx0XHRpZiAoKHBsYXllci5ib2R5LnggPD0gMCAmJiBwbGF5ZXIuYm9keS52ZWxvY2l0eS54IDwgMCkgfHwgKHBsYXllci5ib2R5LnggPj0gZ2FtZS53b3JsZC53aWR0aCAtIHBsYXllci53aWR0aCAmJiBwbGF5ZXIuYm9keS52ZWxvY2l0eS54ID4gMCkpIHtcblx0XHRcdHBsYXllci5ib2R5LnZlbG9jaXR5LnggPSAwO1xuXHRcdH1cblx0fSxcblx0cmVzZXQ6IGZ1bmN0aW9uKGdhbWUpIHtcblx0XHR0aGlzLnBsYXllci5yZXNldChnYW1lLndvcmxkLndpZHRoLzIsIGdhbWUud29ybGQuaGVpZ2h0LXRoaXMucGxheWVyLmhlaWdodC8yKTtcblx0fVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcmVsb2FkKGdhbWUpIHtcblx0Z2FtZS5sb2FkLmF1ZGlvKCdib29tJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL2Jvb20ud2F2Jyk7XG5cdGdhbWUubG9hZC5hdWRpbygndGhyb3cnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vdGhyb3cubXAzJyk7XG5cdGdhbWUubG9hZC5pbWFnZSgncmF6b3InLCAnYXNzZXRzL3Byb2R1Y3Rpb24vcmF6b3IucG5nJyk7XG5cdGdhbWUubG9hZC5pbWFnZSgndmlueWwnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vdmlueWwucG5nJyk7XG5cdGdhbWUubG9hZC5pbWFnZSgnZmVkb3JhJywgJ2Fzc2V0cy9wcm9kdWN0aW9uL2ZlZG9yYVByb2plY3RpbGUucG5nJyk7XG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgnaGlwc3RlcicsICdhc3NldHMvcHJvZHVjdGlvbi9oaXBzdGVyU3ByaXRlU2hlZXQxLnBuZycsIDYyLCA2Myk7XG5cdGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZmVkb3JhSGlwc3RlcicsICdhc3NldHMvcHJvZHVjdGlvbi9mZWRvcmFIaXBzdGVyU3ByaXRlU2hlZXQucG5nJywgNjIsIDYzKTtcblx0Z2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdwbGF5ZXInLCAnYXNzZXRzL3Byb2R1Y3Rpb24vcGxheWVyQ2hhcmFjdGVyU2hlZXQucG5nJywgNjQsIDY0KTtcblx0Z2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdrYWJvb20nLCAnYXNzZXRzL2dhbWVzL2ludmFkZXJzL2V4cGxvZGUucG5nJywgMTI4LCAxMjgpO1xuXHRnYW1lLmxvYWQuaW1hZ2UoJ2JhY2tncm91bmQnLCAnYXNzZXRzL3Byb2R1Y3Rpb24vYmFja2dyb3VuZC5wbmcnKTtcblx0Z2FtZS5sb2FkLmltYWdlKCdsaW5lcycsICdhc3NldHMvcHJvZHVjdGlvbi9saW5lcy5wbmcnKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRpbml0OiBmdW5jdGlvbihidWxsZXRzLCBzcHJpdGVOYW1lLCBnYW1lKSB7XG5cdFx0YnVsbGV0cy5lbmFibGVCb2R5ID0gdHJ1ZTtcblx0XHRidWxsZXRzLnBoeXNpY3NCb2R5VHlwZSA9IFBoYXNlci5QaHlzaWNzLkFSQ0FERTtcblx0XHRidWxsZXRzLmNyZWF0ZU11bHRpcGxlKDMwLCBzcHJpdGVOYW1lKTtcblx0XHRidWxsZXRzLnNldEFsbCgnYW5jaG9yLngnLCAwLjUpO1xuXHRcdGJ1bGxldHMuc2V0QWxsKCdhbmNob3IueScsIDEpO1xuXHRcdGJ1bGxldHMuc2V0QWxsKCdvdXRPZkJvdW5kc0tpbGwnLCB0cnVlKTtcblx0XHRidWxsZXRzLnNldEFsbCgnY2hlY2tXb3JsZEJvdW5kcycsIHRydWUpO1xuXHR9LFxuXG5cdHBsYXllckZpcmU6IGZ1bmN0aW9uKGdhbWUpIHtcblx0XHR0aGlzLnBlbmV0cmF0aW9uID0gMjtcblx0fSxcblxuXHRlbmVteUZpcmU6IGZ1bmN0aW9uKGdhbWUpIHtcblx0XHR0aGlzLnBlbmV0cmF0aW9uID0gMTtcblx0fSxcblxuXHRoaXQ6IGZ1bmN0aW9uKHRhcmdldCwgZ2FtZSkge1xuXHR9XG59XG4iLCJ2YXIgZW5lbWllcyA9IHJlcXVpcmUoJy4vZW5lbWllcycpO1xudmFyIHBsYXllckltcG9ydCA9IHJlcXVpcmUoJy4vcGxheWVyJyk7XG52YXIgcHJvamVjdGlsZXMgPSByZXF1aXJlKCcuL3Byb2plY3RpbGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXBkYXRlKGdhbWUpIHtcblx0Ly92YXIgZG9tU2NvcmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmUnKVxuXHQvL3ZhciBkb21MaXZlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXZlcycpXG5cblx0Ly9pZiAoZG9tU2NvcmUuaW5uZXJUZXh0ICE9IHRoaXMuc2NvcmUpIHtcblx0Ly9kb21TY29yZS5pbm5lclRleHQgPSB0aGlzLnNjb3JlO1xuXHQvL31cblx0Ly9pZiAoZG9tTGl2ZXMuaW5uZXJUZXh0ICE9IHRoaXMubGl2ZXMpIHtcblx0Ly9kb21MaXZlcy5pbm5lclRleHQgPSB0aGlzLmxpdmVzO1xuXHQvL31cblxuXHR0aGlzLmJhY2tncm91bmQudGlsZVBvc2l0aW9uLnkgKz0gMjtcblx0dGhpcy5saW5lcy50aWxlUG9zaXRpb24ueSArPSAyO1xuXHRwbGF5ZXJJbXBvcnQudXBkYXRlLmJpbmQodGhpcykoZ2FtZSk7XG5cdGVuZW1pZXMudXBkYXRlLmJpbmQodGhpcykoZ2FtZSk7XG5cblx0Z2FtZS5waHlzaWNzLmFyY2FkZS5vdmVybGFwKHRoaXMucGxheWVyQnVsbGV0cywgdGhpcy5lbmVtaWVzLCB0aGlzLmVuZW15SGl0LmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xuXG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmhpcHN0ZXJCdWxsZXRzLCB0aGlzLnBsYXllciwgdGhpcy5wbGF5ZXJIaXQuYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmZlZG9yYUJ1bGxldHMsIHRoaXMucGxheWVyLCB0aGlzLnBsYXllckhpdC5iaW5kKHRoaXMpLCBudWxsLCBnYW1lKTtcblxuXHRnYW1lLnBoeXNpY3MuYXJjYWRlLm92ZXJsYXAodGhpcy5oaXBzdGVyQnVsbGV0cywgdGhpcy5wbGF5ZXJCdWxsZXRzLCB0aGlzLnByb2plY3RpbGVDb2xsaXNpb24uYmluZCh0aGlzKSwgbnVsbCwgZ2FtZSk7XG5cdGdhbWUucGh5c2ljcy5hcmNhZGUub3ZlcmxhcCh0aGlzLmZlZG9yYUJ1bGxldHMsIHRoaXMucGxheWVyQnVsbGV0cywgdGhpcy5wcm9qZWN0aWxlQ29sbGlzaW9uLmJpbmQodGhpcyksIG51bGwsIGdhbWUpO1xuXG5cdGlmICh0aGlzLmVuZW1pZXMuY291bnRMaXZpbmcoKSA9PSAwKSB7XG5cdFx0dGhpcy53aW4oKTtcblx0fVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0cHJlbG9hZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5sb2FkLmltYWdlKCdpbnRybycsICdhc3NldHMvcHJvZHVjdGlvbi9WRFNfbWFpblNjcmVlbi5wbmcnKTtcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ2JnbScsICdhc3NldHMvcHJvZHVjdGlvbi9Ob2N0dXJuZW9mSGlwc3Rlci5tcDMnKTtcblx0XHR0aGlzLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTExcblx0XHR0aGlzLnNjYWxlLnJlZnJlc2goKVxuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuYWRkLnNwcml0ZSgwLCAwLCAnaW50cm8nKTtcblx0XHR2YXIgc3RhdGVUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLndvcmxkLmNlbnRlclgsdGhpcy53b3JsZC5jZW50ZXJZLCcgJywgeyBmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmJyB9KTtcblx0XHRzdGF0ZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcblx0XHRzdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XG5cdFx0c3RhdGVUZXh0LnRleHQgPSBcIlNwYWNlIHRvIHN0YXJ0XCI7XG5cdFx0c3RhdGVUZXh0LmFsaWduID0gJ2NlbnRlcidcblx0XHR2YXIgbXVzaWMgPSB0aGlzLmFkZC5hdWRpbygnYmdtJywgMSwgdHJ1ZSk7XG5cdFx0bXVzaWMucGxheSgpO1xuXHR9LFxuXHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW5wdXQua2V5Ym9hcmQub25Eb3duQ2FsbGJhY2sgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHRpZiAodGhpcy5nYW1lLnN0YXRlLmdldEN1cnJlbnRTdGF0ZSgpLmtleSA9PSAnaW50cm8nICYmIGV2ZW50LmtleUNvZGUgPT0gMzIgJiYgZXZlbnQucmVwZWF0ID09IGZhbHNlKSB7XG5cdFx0XHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncGxheScpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdHByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdGF0ZVRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCx0aGlzLndvcmxkLmNlbnRlclksJyAnLCB7IGZvbnQ6ICcyNHB4IEFyaWFsJywgZmlsbDogJyNmZmYnIH0pO1xuXHRcdHN0YXRlVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xuXHRcdHN0YXRlVGV4dC52aXNpYmxlID0gdHJ1ZTtcblx0XHRzdGF0ZVRleHQudGV4dCA9IFwiWW91IGxvc3QuXFxuUHJlc3Mgc3BhY2UgdG8gdHJ5IGFnYWluXCI7XG5cdFx0c3RhdGVUZXh0LmFsaWduID0gJ2NlbnRlcidcblx0fSxcblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0fSxcblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmlucHV0LmtleWJvYXJkLm9uRG93bkNhbGxiYWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmICh0aGlzLmdhbWUuc3RhdGUuZ2V0Q3VycmVudFN0YXRlKCkua2V5ID09ICdsb3NlJyAmJiBldmVudC5rZXlDb2RlID09IDMyICYmIGV2ZW50LnJlcGVhdCA9PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3BsYXknKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRwcmVsb2FkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGVUZXh0ID0gdGhpcy5hZGQudGV4dCh0aGlzLndvcmxkLmNlbnRlclgsdGhpcy53b3JsZC5jZW50ZXJZLCcgJywgeyBmb250OiAnMjRweCBBcmlhbCcsIGZpbGw6ICcjZmZmJyB9KTtcblx0XHRzdGF0ZVRleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcblx0XHRzdGF0ZVRleHQudmlzaWJsZSA9IHRydWU7XG5cdFx0c3RhdGVUZXh0LnRleHQgPSBcIllvdSBXaW4uXFxuUHJlc3Mgc3BhY2UgdG8gcGxheSBhZ2FpblwiO1xuXHRcdHN0YXRlVGV4dC5hbGlnbiA9ICdjZW50ZXInXG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cdH0sXG5cdHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pbnB1dC5rZXlib2FyZC5vbkRvd25DYWxsYmFjayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRpZiAodGhpcy5nYW1lLnN0YXRlLmdldEN1cnJlbnRTdGF0ZSgpLmtleSA9PSAnd2luJyAmJiBldmVudC5rZXlDb2RlID09IDMyICYmIGV2ZW50LnJlcGVhdCA9PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmdhbWUuc3RhdGUuc3RhcnQoJ3BsYXknKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9nYW1lJyk7XG4iXX0=
